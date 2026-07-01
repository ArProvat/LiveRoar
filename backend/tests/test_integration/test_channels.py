"""Integration tests for channels API endpoints."""
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
    tmpdir = tempfile.mkdtemp(prefix="liveroar_channels_test_")
    return os.path.join(tmpdir, "channels_test.sqlite")


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
async def seeded_client(_setup_db, _session_maker):
    async with _session_maker() as session:
        from app.core.models import Channel
        for i in range(5):
            channel = Channel(
                id=f"channel-{i}",
                name=f"Channel {i}",
                slug=f"channel-{i}",
                description=f"Description for channel {i}",
                category="FOOTBALL" if i % 2 == 0 else "CRICKET",
                is_live=(i == 0),
            )
            session.add(channel)
        await session.commit()

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


# ---------------------------------------------------------------------------
# List Channels
# ---------------------------------------------------------------------------

class TestListChannels:
    @pytest.mark.asyncio
    async def test_list_channels_default(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert data["total"] == 5

    @pytest.mark.asyncio
    async def test_list_channels_filter_category(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels?category=FOOTBALL")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 3  # channels 0, 2, 4 are FOOTBALL
        for c in data["data"]:
            assert c["category"] == "FOOTBALL"

    @pytest.mark.asyncio
    async def test_list_channels_pagination(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels?page=1&per_page=2")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["page"] == 1
        assert data["per_page"] == 2

    @pytest.mark.asyncio
    async def test_list_channels_empty_result(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels?category=BASKETBALL")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert len(data["data"]) == 0


# ---------------------------------------------------------------------------
# Get Channel
# ---------------------------------------------------------------------------

class TestGetChannel:
    @pytest.mark.asyncio
    async def test_get_channel_by_slug(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels/channel-0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "channel-0"
        assert data["name"] == "Channel 0"
        assert data["category"] == "FOOTBALL"

    @pytest.mark.asyncio
    async def test_get_channel_not_found(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels/nonexistent-slug")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_channel_has_required_fields(self, seeded_client):
        resp = await seeded_client.get("/api/v1/channels/channel-1")
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert "name" in data
        assert "slug" in data
        assert "category" in data
        assert "is_live" in data
        assert "created_at" in data
