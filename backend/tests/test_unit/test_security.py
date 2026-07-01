"""Unit tests for app.core.security module."""
import os
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock

import pytest
from jose import jwt

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _mock_jwt_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    """Use a deterministic secret in tests — not a production credential."""
    # Secret stored outside the process; never used in production.
    secret = os.environ.get("TEST_JWT_SECRET", "test-secret-key-for-unit-tests-only")
    monkeypatch.setenv("JWT_SECRET_KEY", secret)
    import importlib
    import app.config as config_mod
    importlib.reload(config_mod)
    import app.core.security as sec_mod
    sec_mod.settings = config_mod.Settings(JWT_SECRET_KEY=secret)
    return config_mod.Settings(JWT_SECRET_KEY=secret)


@pytest.fixture
def mock_settings(_mock_jwt_secret):
    return _mock_jwt_secret


# ---------------------------------------------------------------------------
# hash_password / verify_password
# ---------------------------------------------------------------------------

class TestPasswordHashing:
    def test_hash_password_returns_string(self):
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_password_uses_bcrypt(self):
        hashed = hash_password("mypassword")
        assert hashed.startswith("$2")

    def test_hash_password_different_salts(self):
        h1 = hash_password("samepassword")
        h2 = hash_password("samepassword")
        assert h1 != h2  # different salts → different hashes

    def test_verify_password_correct(self):
        pwd = "strongpassword123"
        hashed = hash_password(pwd)
        assert verify_password(pwd, hashed) is True

    def test_verify_password_incorrect(self):
        hashed = hash_password("correcthorse")
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_empty_plain(self):
        hashed = hash_password("realpassword")
        assert verify_password("", hashed) is False

    def test_verify_password_unicode(self):
        pwd = "passw__"
        hashed = hash_password(pwd)
        assert verify_password(pwd, hashed) is True

    def test_hash_verify_roundtrip_short_passwords(self):
        for pwd in ["a" * 8, "12345678"]:
            hashed = hash_password(pwd)
            assert verify_password(pwd, hashed) is True


# ---------------------------------------------------------------------------
# create_access_token
# ---------------------------------------------------------------------------

class TestCreateAccessToken:

    def test_token_contains_sub_and_role(self, mock_settings):
        data = {"sub": "user-123", "role": "USER"}
        token = create_access_token(data)
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["sub"] == "user-123"
        assert payload["role"] == "USER"

    def test_token_has_type_access(self, mock_settings):
        token = create_access_token({"sub": "u1"})
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["type"] == "access"

    def test_token_has_exp_claim(self, mock_settings):
        token = create_access_token({"sub": "u1"})
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        assert "exp" in payload

    def test_token_expires_in_15_min_default(self, mock_settings):
        before = datetime.now(timezone.utc)
        token = create_access_token({"sub": "u1"})
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        delta = (exp - before).total_seconds()
        assert 840 <= delta <= 900

    def test_token_respects_custom_expires_delta(self, mock_settings):
        delta = timedelta(minutes=1)
        token = create_access_token({"sub": "u1"}, expires_delta=delta)
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        before = datetime.now(timezone.utc)
        diff = (exp - before).total_seconds()
        assert 0 <= diff <= 120

    def test_token_does_not_mutate_input(self, mock_settings):
        data = {"sub": "u1", "role": "ADMIN"}
        original = dict(data)
        create_access_token(data)
        assert data == original

    def test_token_is_valid_jwt(self, mock_settings):
        token = create_access_token({"sub": "u1"})
        jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])


# ---------------------------------------------------------------------------
# create_refresh_token
# ---------------------------------------------------------------------------

class TestCreateRefreshToken:

    def test_token_has_type_refresh(self, mock_settings):
        token = create_refresh_token({"sub": "u1"})
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["type"] == "refresh"

    def test_token_expires_in_7_days(self, mock_settings):
        before = datetime.now(timezone.utc)
        token = create_refresh_token({"sub": "u1"})
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        diff_hours = (exp - before).total_seconds() / 3600
        assert 167 <= diff_hours <= 170

    def test_token_does_not_mutate_input(self, mock_settings):
        data = {"sub": "u1", "extra": "value"}
        original = dict(data)
        create_refresh_token(data)
        assert data == original

    def test_token_contains_sub(self, mock_settings):
        token = create_refresh_token({"sub": "user-abc"})
        payload = jwt.decode(token, mock_settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["sub"] == "user-abc"


# ---------------------------------------------------------------------------
# decode_token
# ---------------------------------------------------------------------------

class TestDecodeToken:

    def test_decode_valid_access_token(self, mock_settings):
        token = create_access_token({"sub": "u1", "role": "ADMIN"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "u1"

    def test_decode_valid_refresh_token(self, mock_settings):
        token = create_refresh_token({"sub": "u1"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_decode_invalid_token_returns_none(self):
        assert decode_token("not.a.valid.token") is None

    def test_decode_tampered_token_returns_none(self):
        token = create_access_token({"sub": "u1"})
        parts = token.split(".")
        parts[1] = "aaaa"
        tampered = ".".join(parts)
        assert decode_token(tampered) is None

    def test_decode_expired_token_returns_none(self, mock_settings):
        past = datetime.now(timezone.utc) - timedelta(hours=1)
        payload_data = {"sub": "u1", "exp": past, "type": "access"}
        token = jwt.encode(payload_data, mock_settings.jwt_secret_key, algorithm="HS256")
        assert decode_token(token) is None

    def test_decode_empty_string_returns_none(self):
        assert decode_token("") is None
