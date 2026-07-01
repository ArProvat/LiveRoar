"""Integration tests for admin API endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
from app.main import app
from app.database import Base


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
async def admin_client(test_db_engine):
    """Client with admin user pre-seeded."""
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    from app.core.models import User
    from app.core.security import hash_password, create_access_token

    async with test_session_maker() as session:
        admin = User(
            id="admin-123",
            email="admin@example.com",
            name="Admin User",
            hashed_password=hash_password("password123"),
            role="ADMIN",
        )
        session.add(admin)
        await session.flush()

    admin_token = create_access_token({"sub": "admin-123", "role": "ADMIN"})

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
        yield ac, admin_token

    app.dependency_overrides.clear()


@pytest.fixture
async def seeded_admin_client(test_db_engine):
    """Admin client with data seeded."""
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    from app.core.models import User, Match
    from app.core.security import hash_password, create_access_token

    async with test_session_maker() as session:
        admin = User(
            id="admin-123",
            email="admin@example.com",
            name="Admin User",
            hashed_password=hash_password("password123"),
            role="ADMIN",
        )
        session.add(admin)

        for i in range(3):
            match = Match(
                id=f"admin-match-{i}",
                title=f"Admin Match {i}",
                sport_category="FOOTBALL",
                start_time=datetime.now(),
                status=["SCHEDULED", "LIVE", "FINISHED"][i],
                viewers=i * 50,
            )
            session.add(match)

        user = User(
            id="reg-user-123",
            email="reg@example.com",
            name="Regular User",
            hashed_password=hash_password("password123"),
            role="USER",
        )
        session.add(user)
        await session.commit()

    admin_token = create_access_token({"sub": "admin-123", "role": "ADMIN"})

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
        yield ac, admin_token

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class TestDashboard:
    @pytest.mark.asyncio
    async def test_dashboard_requires_admin(self, client):
        resp = await client.get("/api/v1/admin/dashboard")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_dashboard_returns_stats(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "total_matches" in data
        assert "live_matches" in data
        assert "total_users" in data
        assert "recent_matches" in data
        assert data["total_matches"] == 3
        assert data["live_matches"] == 1
        assert data["total_users"] == 2

    @pytest.mark.asyncio
    async def test_dashboard_recent_matches(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
        data = resp.json()
        assert len(data["recent_matches"]) == 3
        for m in data["recent_matches"]:
            assert "id" in m
            assert "title" in m
            assert "status" in m


# ---------------------------------------------------------------------------
# Admin — Create / Update Match
# ---------------------------------------------------------------------------

class TestAdminMatches:
    @pytest.mark.asyncio
    async def test_create_match_requires_admin(self, client):
        resp = await client.post("/api/v1/admin/matches", json={
            "title": "Test",
            "sport_category": "FOOTBALL",
            "start_time": datetime.now().isoformat(),
        })
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_create_match(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.post("/api/v1/admin/matches", json={
            "title": "New Admin Match",
            "sport_category": "TENNIS",
            "start_time": datetime(2026, 12, 25, 18, 0, 0).isoformat(),
            "team_a": "Djokovic",
            "team_b": "Nadal",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "New Admin Match"
        assert data["status"] == "SCHEDULED"

    @pytest.mark.asyncio
    async def test_update_match(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.put(
            "/api/v1/admin/matches/admin-match-0",
            json={"status": "LIVE"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    @pytest.mark.asyncio
    async def test_update_match_not_found(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.put(
            "/api/v1/admin/matches/nonexistent",
            json={"status": "LIVE"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Admin — Stream Key
# ---------------------------------------------------------------------------

class TestAdminStreams:
    @pytest.mark.asyncio
    async def test_generate_stream_key_requires_admin(self, client):
        resp = await client.post("/api/v1/admin/streams/generate-key")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_generate_stream_key(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.post(
            "/api/v1/admin/streams/generate-key",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "stream_key" in data
        assert "config_id" in data
        assert len(data["stream_key"]) > 0

    @pytest.mark.asyncio
    async def test_get_stream_status(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.get(
            "/api/v1/admin/streams/status",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---------------------------------------------------------------------------
# Admin — Users List
# ---------------------------------------------------------------------------

class TestAdminUsers:
    @pytest.mark.asyncio
    async def test_list_users_requires_admin(self, client):
        resp = await client.get("/api/v1/admin/users")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_list_users(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        users = resp.json()
        assert len(users) == 2
        emails = {u["email"] for u in users}
        assert "admin@example.com" in emails
        assert "reg@example.com" in emails

    @pytest.mark.asyncio
    async def test_list_users_includes_role(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
        users = resp.json()
        admin_user = next(u for u in users if u["email"] == "admin@example.com")
        assert admin_user["role"] == "ADMIN"


# ---------------------------------------------------------------------------
# Admin — Chat Moderation
# ---------------------------------------------------------------------------

class TestChatModeration:
    @pytest.mark.asyncio
    async def test_chat_moderation_requires_admin(self, client):
        resp = await client.get("/api/v1/admin/chat/moderation")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_chat_moderation_empty(self, seeded_admin_client):
        ac, token = seeded_admin_client
        resp = await ac.get("/api/v1/admin/chat/moderation", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json() == []
