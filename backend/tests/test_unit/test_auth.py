"""Unit tests for app.core.auth module (get_current_user, require_admin, etc.)."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.auth import get_current_user, get_optional_user, require_admin
from app.core.models import User
from app.core.security import create_access_token


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(**kwargs):
    return User(
        id=kwargs.get("id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
        email=kwargs.get("email", "test@example.com"),
        name=kwargs.get("name", "Test"),
        hashed_password=kwargs.get("hashed_password", "$2b$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"),  # noqa: S105 - test dummy hash
        role=kwargs.get("role", "USER"),
        is_active=kwargs.get("is_active", True),
        **{k: v for k, v in kwargs.items() if k not in ("id", "email", "name", "hashed_password", "role", "is_active")}
    )


def _make_credentials(token: str):
    from fastapi.security import HTTPAuthorizationCredentials
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


@pytest.fixture(autouse=True)
def _mock_jwt_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    secret = "test-secret-key-for-unit-tests-only"
    monkeypatch.setenv("JWT_SECRET_KEY", secret)
    import importlib
    import app.config as config_mod
    importlib.reload(config_mod)
    import app.core.security as sec_mod
    sec_mod.settings = config_mod.Settings(JWT_SECRET_KEY=secret)
    return config_mod.Settings(JWT_SECRET_KEY=secret)


# ---------------------------------------------------------------------------
# get_current_user
# ---------------------------------------------------------------------------

class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_returns_user_with_valid_token(self, _mock_jwt_secret, monkeypatch):
        token = create_access_token({"sub": "user-123", "role": "USER"})
        credentials = _make_credentials(token)
        mock_user = _make_user(id="user-123")

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_session.execute = AsyncMock(return_value=mock_result)

        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield mock_session))

        user = await get_current_user(credentials, db=mock_session)
        assert user.id == "user-123"

    @pytest.mark.asyncio
    async def test_raises_on_invalid_token(self, _mock_jwt_secret, monkeypatch):
        credentials = _make_credentials("invalid.token.here")
        mock_session = AsyncMock()

        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield mock_session))

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, db=mock_session)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_raises_on_missing_sub(self, _mock_jwt_secret, monkeypatch):
        token = create_access_token({"role": "USER"})  # no "sub"
        credentials = _make_credentials(token)
        mock_session = AsyncMock()

        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield mock_session))

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, db=mock_session)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_raises_when_user_not_found(self, _mock_jwt_secret, monkeypatch):
        token = create_access_token({"sub": "nonexistent", "role": "USER"})
        credentials = _make_credentials(token)

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute = AsyncMock(return_value=mock_result)

        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield mock_session))

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, db=mock_session)
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_raises_when_user_inactive(self, _mock_jwt_secret, monkeypatch):
        token = create_access_token({"sub": "user-123", "role": "USER"})
        credentials = _make_credentials(token)
        mock_user = _make_user(id="user-123", is_active=False)

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_session.execute = AsyncMock(return_value=mock_result)

        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield mock_session))

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, db=mock_session)
        assert exc_info.value.status_code == 401


# ---------------------------------------------------------------------------
# get_optional_user
# ---------------------------------------------------------------------------

class TestGetOptionalUser:
    @pytest.mark.asyncio
    async def test_returns_none_when_no_credentials(self, monkeypatch):
        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield AsyncMock()))
        result = await get_optional_user(credentials=None, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_none_with_invalid_token(self, _mock_jwt_secret, monkeypatch):
        credentials = _make_credentials("invalid")
        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield AsyncMock()))
        result = await get_optional_user(credentials, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_user_with_valid_token(self, _mock_jwt_secret, monkeypatch):
        token = create_access_token({"sub": "user-123", "role": "USER"})
        credentials = _make_credentials(token)
        mock_user = _make_user(id="user-123")

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_session.execute = AsyncMock(return_value=mock_result)

        monkeypatch.setattr("app.core.auth.get_db", lambda: (yield mock_session))

        result = await get_optional_user(credentials, db=mock_session)
        assert result is not None
        assert result.id == "user-123"


# ---------------------------------------------------------------------------
# require_admin
# ---------------------------------------------------------------------------

class TestRequireAdmin:
    @pytest.mark.asyncio
    async def test_returns_admin_user(self):
        admin_user = _make_user(id="admin-1", role="ADMIN")
        result = await require_admin(current_user=admin_user)
        assert result is admin_user

    @pytest.mark.asyncio
    async def test_returns_broadcaster_user(self):
        broadcaster = _make_user(id="broad-1", role="BROADCASTER")
        result = await require_admin(current_user=broadcaster)
        assert result is broadcaster

    @pytest.mark.asyncio
    async def test_raises_for_regular_user(self):
        user = _make_user(id="user-1", role="USER")
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await require_admin(current_user=user)
        assert exc_info.value.status_code == 403
        assert "Admin access required" in exc_info.value.detail
