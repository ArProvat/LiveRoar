"""Integration tests for admin API endpoints."""
import os
import tempfile
import sqlite3
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
from app import app
from app.database import get_db, Base


@pytest.fixture(scope="session")
def db_path():
    tmpdir = tempfile.mkdtemp(prefix="liveroar_admin_test_")
    return os.path.join(tmpdir, "admin_test.sqlite")


@pytest.fixture(scope="session")
async def _engine(db_path):
    db_url = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(db_url, echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
async def _setup_db(_engine, db_path):
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

    async with _engine.connect() as conn:
        from app.core.models import User, Channel, Match, Favorite, WatchHistory, ChatMessage, Notification, StreamConfig  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
        await conn.commit()

    yield _engine


@pytest.fixture
def _session_maker(_setup_db):
    return async_sessionmaker(_setup_db, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture
async def client(_setup_db, _session_maker):
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
async def seeded_admin_client(_setup_db, _session_maker):
    from app.core.models import User, Match, Channel
    from app.core.security import hash_password, create_access_token

    async with _session_maker() as session:
        admin = User(
            id="admin-123",
            email="admin@example.com",
            name="Admin User",
            hashed_password=hash_password("password123"),
            role="ADMIN",
        )
        session.add(admin)

        channel = Channel(
            name="Main Channel",
            slug="main-channel",
            description="Main sports channel",
            category="FOOTBALL",
        )
        session.add(channel)

        for i in range(3):
            match = Match(
                id=f"admin-match-{i}",
                title=f"Admin Match {i}",
                sport_category="FOOTBALL",
                start_time=datetime.now(),
                status=["SCHEDULED", "LIVE", "FINISHED"][i],
                viewers=i * 50,
                team_a=f"Team A{i}",
                team_b=f"Team B{i}",
                channel_id=channel.id,
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
        yield ac, admin_token

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class TestDashboard:
    @pytest.mark.asyncio
    async def test_dashboard_admin_access(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_matches"] >= 3
        assert "live_matches" in data
        assert data["total_users"] >= 2
        assert isinstance(data["recent_matches"], list)

    @pytest.mark.asyncio
    async def test_dashboard_requires_admin(self, client):
        register_data = {
            "email": "nonadmin@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_dashboard_without_token(self, client):
        resp = await client.get("/api/v1/admin/dashboard")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Create Match
# ---------------------------------------------------------------------------

class TestCreateMatch:
    @pytest.mark.asyncio
    async def test_create_match(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.post(
            "/api/v1/admin/matches",
            json={
                "title": "New Test Match",
                "sport_category": "CRICKET",
                "status": "SCHEDULED",
                "start_time": "2026-08-01T18:00:00Z",
                "team_a": "India",
                "team_b": "Australia",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "New Test Match"
        assert data["sport_category"] == "CRICKET"

    @pytest.mark.asyncio
    async def test_create_match_non_admin(self, client):
        register_data = {
            "email": "nonadmin2@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.post(
            "/api/v1/admin/matches",
            json={
                "title": "Unauthorized Match",
                "sport_category": "FOOTBALL",
                "status": "SCHEDULED",
                "start_time": "2026-08-01T18:00:00Z",
                "team_a": "Team A",
                "team_b": "Team B",
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Update Match
# ---------------------------------------------------------------------------

class TestUpdateMatch:
    @pytest.mark.asyncio
    async def test_update_match(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.put(
            "/api/v1/admin/matches/admin-match-0",
            json={"status": "LIVE", "viewers": 500},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["match_id"] == "admin-match-0"

    @pytest.mark.asyncio
    async def test_update_match_not_found(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.put(
            "/api/v1/admin/matches/nonexistent-id",
            json={"status": "LIVE"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Stream Key
# ---------------------------------------------------------------------------

class TestStreamKey:
    @pytest.mark.asyncio
    async def test_generate_stream_key(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.post(
            "/api/v1/admin/streams/generate-key",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "stream_key" in data
        assert "config_id" in data
        assert len(data["stream_key"]) > 10

    @pytest.mark.asyncio
    async def test_generate_stream_key_requires_admin(self, client):
        register_data = {
            "email": "nonadmin3@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.post(
            "/api/v1/admin/streams/generate-key",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Stream Status
# ---------------------------------------------------------------------------

class TestStreamStatus:
    @pytest.mark.asyncio
    async def test_get_stream_status(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.get(
            "/api/v1/admin/streams/status",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @pytest.mark.asyncio
    async def test_stream_status_requires_admin(self, client):
        register_data = {
            "email": "nonadmin4@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.get(
            "/api/v1/admin/streams/status",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# List Users
# ---------------------------------------------------------------------------

class TestListUsers:
    @pytest.mark.asyncio
    async def test_list_users(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        users = resp.json()
        assert isinstance(users, list)
        assert len(users) >= 2
        user = users[0]
        assert "email" in user
        assert "role" in user
        assert "name" in user

    @pytest.mark.asyncio
    async def test_list_users_requires_admin(self, client):
        register_data = {
            "email": "nonadmin5@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Chat Moderation
# ---------------------------------------------------------------------------

class TestChatModeration:
    @pytest.mark.asyncio
    async def test_chat_moderation(self, seeded_admin_client):
        client, admin_token = seeded_admin_client
        resp = await client.get(
            "/api/v1/admin/chat/moderation",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @pytest.mark.asyncio
    async def test_chat_moderation_requires_admin(self, client):
        register_data = {
            "email": "nonadmin6@example.com",
            "password": "password123",
        }
        await client.post("/api/v1/auth/register", json=register_data)
        login_resp = await client.post("/api/v1/auth/login", json=register_data)
        tokens = login_resp.json()

        resp = await client.get(
            "/api/v1/admin/chat/moderation",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert resp.status_code in (401, 403)
