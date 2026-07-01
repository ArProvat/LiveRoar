"""Integration tests for auth API endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.database import Base
from app.core.models import User


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session", autouse=True)
async def test_db_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def client(test_db_engine):
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with test_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[None] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def auth_client(test_db_engine):
    """Client with auth dependency overrides for endpoints that need DB."""
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with test_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[None] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def registered_user(auth_client):
    """Register a user and return (email, password, access_token)."""
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
    async def test_health_endpoint(self, client):
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "liveroar-backend"


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class TestRegister:
    @pytest.mark.asyncio
    async def test_register_success(self, client):
        resp = await client.post("/api/v1/auth/register", json={
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
    async def test_register_duplicate_email(self, client):
        payload = {"email": "dup@example.com", "password": "password123", "name": "Dup"}
        await client.post("/api/v1/auth/register", json=payload)
        resp = await client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 409

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "not-an-email",
            "password": "password123",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_short_password(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "short@example.com",
            "password": "short",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_missing_email(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "password": "password123",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_missing_password(self, client):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
        })
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class TestLogin:
    @pytest.mark.asyncio
    async def test_login_success(self, client):
        register_data = {
            "email": "login@example.com",
            "password": "password123",
            "name": "Login User",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        resp = await client.post("/api/v1/auth/login", json=register_data)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 900  # 15 min in seconds

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client):
        register_data = {
            "email": "wrong@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        resp = await client.post("/api/v1/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client):
        resp = await client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Token Refresh
# ---------------------------------------------------------------------------

class TestRefresh:
    @pytest.mark.asyncio
    async def test_refresh_token(self, client):
        register_data = {
            "email": "refresh@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": tokens["refresh_token"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, client):
        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid.token.here",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_using_access_token_fails(self, client):
        register_data = {
            "email": "refresh2@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        # Using an access token as refresh should fail
        resp = await client.post("/api/v1/auth/refresh", json={
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
        assert resp.status_code == 403  # FastAPI security scheme rejection

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
        assert resp.status_code == 403
