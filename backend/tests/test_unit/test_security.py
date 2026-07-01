"""Unit tests for app.core.security module."""
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock, Mock

import pytest
from jose import jwt

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _mock_jwt_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    """Provide settings that pass pydantic validation."""
    monkeypatch.setenv("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
    secret = "test-secret-key-for-unit-tests-only"
    monkeypatch.setenv("JWT_SECRET_KEY", secret)
    import importlib
    import app.config as config_mod
    importlib.reload(config_mod)
    import app.core.security as sec_mod
    sec_mod.settings = config_mod.settings


# ---------------------------------------------------------------------------
# hash_password / verify_password — mocked bcrypt (passlib broken on 3.14)
# ---------------------------------------------------------------------------

class TestPasswordHashing:

    @pytest.fixture
    def pwd_mock(self):
        """Return a mock CryptContext with working hash/verify."""
        mock = MagicMock()
        mock.hash = MagicMock(return_value="$2b$12$m0k0aUcPz6V3bMHnq6Oy9eX4GJ7cJq5qL5k3j5Z5x5C5t5R5e5Y5G5")
        mock.verify = MagicMock(side_effect=lambda p, h: p == "correctpwd")
        return mock

    def test_hash_password_returns_string(self, pwd_mock):
        with patch("app.core.security.pwd_context", pwd_mock):
            from app.core.security import hash_password
            hashed = hash_password("testpwd1")
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_verify_password_correct(self, pwd_mock):
        with patch("app.core.security.pwd_context", pwd_mock):
            from app.core.security import verify_password
            result = verify_password("correctpwd", "anyhash")
        assert result is True

    def test_verify_password_incorrect(self, pwd_mock):
        with patch("app.core.security.pwd_context", pwd_mock):
            from app.core.security import verify_password
            result = verify_password("wrongpwd", "anyhash")
        assert result is False

    def test_hash_password_called_correctly(self, pwd_mock):
        with patch("app.core.security.pwd_context", pwd_mock):
            from app.core.security import hash_password
            hash_password("mypassword")
        pwd_mock.hash.assert_called_once_with("mypassword")

    def test_verify_password_called_correctly(self, pwd_mock):
        with patch("app.core.security.pwd_context", pwd_mock):
            from app.core.security import verify_password
            verify_password("userpwd", "storedhash")
        pwd_mock.verify.assert_called_once_with("userpwd", "storedhash")


# ---------------------------------------------------------------------------
# create_access_token
# ---------------------------------------------------------------------------

class TestCreateAccessToken:

    def test_token_contains_sub_and_role(self):
        data = {"sub": "user-123", "role": "USER"}
        token = create_access_token(data)
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["sub"] == "user-123"
        assert payload["role"] == "USER"

    def test_token_has_type_access(self):
        token = create_access_token({"sub": "u1"})
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["type"] == "access"

    def test_token_has_exp_claim(self):
        token = create_access_token({"sub": "u1"})
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        assert "exp" in payload

    def test_token_expires_in_15_min_default(self):
        before = datetime.now(timezone.utc)
        token = create_access_token({"sub": "u1"})
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        delta = (exp - before).total_seconds()
        assert 840 <= delta <= 900

    def test_token_respects_custom_expires_delta(self):
        delta = timedelta(minutes=1)
        token = create_access_token({"sub": "u1"}, expires_delta=delta)
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        before = datetime.now(timezone.utc)
        diff = (exp - before).total_seconds()
        assert 0 <= diff <= 120

    def test_token_does_not_mutate_input(self):
        data = {"sub": "u1", "role": "ADMIN"}
        original = dict(data)
        create_access_token(data)
        assert data == original

    def test_token_is_valid_jwt(self):
        token = create_access_token({"sub": "u1"})
        from app.core.security import settings
        jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])


# ---------------------------------------------------------------------------
# create_refresh_token
# ---------------------------------------------------------------------------

class TestCreateRefreshToken:

    def test_token_has_type_refresh(self):
        token = create_refresh_token({"sub": "u1"})
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["type"] == "refresh"

    def test_token_expires_in_7_days(self):
        before = datetime.now(timezone.utc)
        token = create_refresh_token({"sub": "u1"})
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        diff_hours = (exp - before).total_seconds() / 3600
        assert 167 <= diff_hours <= 170

    def test_token_does_not_mutate_input(self):
        data = {"sub": "u1", "extra": "value"}
        original = dict(data)
        create_refresh_token(data)
        assert data == original

    def test_token_contains_sub(self):
        token = create_refresh_token({"sub": "user-abc"})
        from app.core.security import settings
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
        assert payload["sub"] == "user-abc"


# ---------------------------------------------------------------------------
# decode_token
# ---------------------------------------------------------------------------

class TestDecodeToken:

    def test_decode_valid_access_token(self):
        token = create_access_token({"sub": "u1", "role": "ADMIN"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "u1"

    def test_decode_valid_refresh_token(self):
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

    def test_decode_expired_token_returns_none(self):
        from app.core.security import settings
        past = datetime.now(timezone.utc) - timedelta(hours=1)
        payload_data = {"sub": "u1", "exp": past, "type": "access"}
        token = jwt.encode(payload_data, settings.jwt_secret_key, algorithm="HS256")
        assert decode_token(token) is None

    def test_decode_empty_string_returns_none(self):
        assert decode_token("") is None


# ---------------------------------------------------------------------------
# Integration: hash → verify → token round-trip
# ---------------------------------------------------------------------------

class TestSecurityRoundTrip:
    def test_full_auth_flow(self):
        """Simulate registration → password hash → login verification → token."""
        pwd_mock = MagicMock()
        pwd_mock.hash = MagicMock(return_value="$2b$12$m0k0aUcPz6V3bMHnq6Oy9eX4GJ7cJq5qL5k3j5Z5x5C5t5R5e5Y5G5")
        pwd_mock.verify = MagicMock(side_effect=lambda p, h: p == "realpassword")

        with patch("app.core.security.pwd_context", pwd_mock):
            from app.core.security import hash_password, verify_password, create_access_token, decode_token

            password = "realpassword"
            hashed = hash_password(password)

            # Verify correct password
            assert verify_password(password, hashed) is True
            assert verify_password("wrong", hashed) is False

            # Create token and decode
            token = create_access_token({"sub": "user-xyz", "role": "USER"})
            payload = decode_token(token)
            assert payload is not None
            assert payload["sub"] == "user-xyz"
            assert payload["role"] == "USER"
