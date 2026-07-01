"""Integration tests for matches API endpoints."""
import os
import tempfile
import sqlite3
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime, timezone
from app import app
from app.database import get_db, Base


@pytest.fixture(scope="session")
def db_path():
    tmpdir = tempfile.mkdtemp(prefix="liveroar_matches_test_")
    return os.path.join(tmpdir, "matches_test.sqlite")


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
        from app.core.models import Match, Channel
        now = datetime.now(timezone.utc)
        channel = Channel(
            id="match-channel-1",
            name="Main Sports",
            slug="main-sports",
            description="Main sports channel",
            category="FOOTBALL",
        )
        session.add(channel)

        for i in range(4):
            match = Match(
                id=f"match-{i}",
                title=f"Match {i}",
                sport_category="FOOTBALL" if i % 2 == 0 else "CRICKET",
                start_time=now,
                team_a=f"Team A{i}",
                team_b=f"Team B{i}",
                status=["SCHEDULED", "LIVE", "FINISHED"][i % 3],
                viewers=i * 100,
                is_featured=(i == 0),
                channel_id=channel.id,
            )
            session.add(match)
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
# List Matches
# ---------------------------------------------------------------------------

class TestListMatches:
    @pytest.mark.asyncio
    async def test_list_matches_default(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data
        assert data["total"] == 4

    @pytest.mark.asyncio
    async def test_list_matches_filter_sport_category(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches?sport_category=CRICKET")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        for m in data["data"]:
            assert m["sport_category"] == "CRICKET"

    @pytest.mark.asyncio
    async def test_list_matches_filter_status(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches?status=LIVE")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["data"][0]["status"] == "LIVE"

    @pytest.mark.asyncio
    async def test_list_matches_pagination(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches?page=1&per_page=2")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["page"] == 1

    @pytest.mark.asyncio
    async def test_list_matches_combined_filters(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches?sport_category=FOOTBALL&status=SCHEDULED")
        assert resp.status_code == 200
        data = resp.json()
        for m in data["data"]:
            assert m["sport_category"] == "FOOTBALL"
            assert m["status"] == "SCHEDULED"


# ---------------------------------------------------------------------------
# Get Match
# ---------------------------------------------------------------------------

class TestGetMatch:
    @pytest.mark.asyncio
    async def test_get_match_by_id(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches/match-0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "match-0"
        assert data["title"] == "Match 0"
        assert data["team_a"] == "Team A0"
        assert data["team_b"] == "Team B0"

    @pytest.mark.asyncio
    async def test_get_match_not_found(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches/nonexistent-id")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_match_has_channel_info(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches/match-0")
        assert resp.status_code == 200
        data = resp.json()
        assert "channel" in data
        assert data["channel"]["name"] == "Main Sports"

    @pytest.mark.asyncio
    async def test_get_match_fields(self, seeded_client):
        resp = await seeded_client.get("/api/v1/matches/match-1")
        assert resp.status_code == 200
        data = resp.json()
        required_fields = ["id", "title", "sport_category", "status", "start_time",
                          "team_a", "team_b", "viewers", "is_featured"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
