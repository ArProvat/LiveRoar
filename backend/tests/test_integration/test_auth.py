"""Integration tests for auth API endpoints."""
import os
import tempfile
import sqlite3
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app import app
from app.database import get_db, Base


@pytest.fixture(scope="session")
def db_path():
    tmpdir = tempfile.mkdtemp(prefix="liveroar_test_")
    return os.path.join(tmpdir, "test.sqlite")


@pytest.fixture(scope="session")
async def _engine(db_path):
    db_url = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(db_url, echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
async def _setup_db(_engine, db_path):
    # Use synchronous sqlite3 to wipe everything cleanly
    conn = sqlite3.connect(db_path)
    conn.execute("DROP TABLE IF EXISTS notifications")
    conn.execute("DROP TABLE IF EXISTS chat_messages")
    conn.execute("DROP TABLE IF EXISTS watch_history")
    conn.execute("DROP TABLE IF EXISTS favorites")
    conn.execute("DROP TABLE IF EXISTS matches")
    conn.execute("DROP TABLE IF EXISTS channels")
    conn.execute("DROP TABLE IF EXISTS users")
    conn.execute("DROP TABLE IF EXISTS stream_configs")
    conn.commit()
    conn.close()

    # Create tables via async engine's run_sync
    async with _engine.connect() as conn:
        # Import all models to register them with Base
        from app.core.models import User, Channel, Match, Favorite, WatchHistory, ChatMessage, Notification, StreamConfig  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
        await conn.commit()

    yield _engine


@pytest.fixture
def _session_maker(_setup_db):
    return async_sessionmaker(_setup_db, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture
async def auth_client(_setup_db, _session_maker):
    async def override_get_db():
        async with _session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def registered_user(auth_client):
    register_data = {
        "email": "integration@example.com",
        "password": "integration123",
        "name": "Integration Test User",
    }
    resp = await auth_client.post("/api/v1/auth/register", json=register_data)
    assert resp.status_code in (200, 201)

    login_resp = await auth_client.post("/api/v1/auth/login", json=register_data)
    assert login_resp.status_code == 200
    tokens = login_resp.json()

    return register_data["email"], register_data["password"], tokens["access_token"]


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class TestHealth:
    @pytest.mark.asyncio
    async def test_health_endpoint(self, auth_client):
        resp = await auth_client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "liveroar-backend"


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class TestRegister:
    @pytest.mark.asyncio
    async def test_register_success(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/register", json={
            "email": "new@example.com",
            "password": "password123",
            "name": "New User",
        })
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["name"] == "New User"
        assert data["role"] == "USER"
        assert "hashed_password" not in data

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, auth_client):
        payload = {"email": "dup@example.com", "password": "password123", "name": "Dup"}
        await auth_client.post("/api/v1/auth/register", json=payload)
        resp = await auth_client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 409

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/register", json={
            "email": "not-an-email",
            "password": "password123",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_short_password(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/register", json={
            "email": "short@example.com",
            "password": "short",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_missing_email(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/register", json={
            "password": "password123",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_missing_password(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
        })
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class TestLogin:
    @pytest.mark.asyncio
    async def test_login_success(self, auth_client):
        register_data = {
            "email": "login@example.com",
            "password": "password123",
            "name": "Login User",
        }
        await auth_client.post("/api/v1/auth/register", json=register_data)
        resp = await auth_client.post("/api/v1/auth/login", json=register_data)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 900

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, auth_client):
        register_data = {
            "email": "wrong@example.com",
            "password": "password123",
        }
        await auth_client.post("/api/v1/auth/register", json=register_data)
        resp = await auth_client.post("/api/v1/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_missing_fields(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Token Refresh
# ---------------------------------------------------------------------------

class TestRefresh:
    @pytest.mark.asyncio
    async def test_refresh_token(self, auth_client):
        register_data = {
            "email": "refresh@example.com",
            "password": "password123",
        }
        await auth_client.post("/api/v1/auth/register", json=register_data)
        login_resp = await auth_client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await auth_client.post("/api/v1/auth/refresh", json={
            "refresh_token": tokens["refresh_token"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, auth_client):
        resp = await auth_client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid.token.here",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_using_access_token_fails(self, auth_client):
        register_data = {
            "email": "refresh2@example.com",
            "password": "password123",
        }
        await auth_client.post("/api/v1/auth/register", json=register_data)
        login_resp = await auth_client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await auth_client.post("/api/v1/auth/refresh", json={
            "refresh_token": tokens["access_token"],
        })
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Get Me / Update Me
# ---------------------------------------------------------------------------

class TestGetMeUpdateMe:
    @pytest.mark.asyncio
    async def test_get_me(self, auth_client, registered_user):
        _, _, token = registered_user
        resp = await auth_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == registered_user[0]
        assert "hashed_password" not in data

    @pytest.mark.asyncio
    async def test_get_me_without_token(self, auth_client):
        resp = await auth_client.get("/api/v1/auth/me")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_update_me_name(self, auth_client, registered_user):
        _, _, token = registered_user
        resp = await auth_client.put(
            "/api/v1/auth/me",
            json={"name": "Updated Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    @pytest.mark.asyncio
    async def test_update_me_avatar(self, auth_client, registered_user):
        _, _, token = registered_user
        resp = await auth_client.put(
            "/api/v1/auth/me",
            json={"avatar_url": "https://example.com/new-avatar.png"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["avatar_url"] == "https://example.com/new-avatar.png"

    @pytest.mark.asyncio
    async def test_get_me_invalid_token(self, auth_client):
        resp = await auth_client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"})
        assert resp.status_code in (401, 403)
