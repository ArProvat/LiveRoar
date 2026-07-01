"""Integration tests for matches API endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
from app import app
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
async def seeded_client(test_db_engine):
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_session_maker() as session:
        from app.core.models import Match
        now = datetime.now()
        for i in range(4):
            match = Match(
                title=f"Match {i}",
                sport_category="FOOTBALL" if i % 2 == 0 else "CRICKET",
                start_time=now,
                team_a=f"Team A{i}",
                team_b=f"Team B{i}",
                status=["SCHEDULED", "LIVE", "FINISHED"][i % 3],
                viewers=i * 100,
                is_featured=i == 0,
            )
            session.add(match)
        await session.commit()

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


# ---------------------------------------------------------------------------
# List Matches
# ---------------------------------------------------------------------------

class TestListMatches:
    @pytest.mark.asyncio
    async def test_list_matches_empty(self, client):
        resp = await client.get("/api/v1/matches")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["data"] == []

    @pytest.mark.asyncio
    async def test_list_matches_with_data(self, seeded_client):
        resp = await client.get("/api/v1/matches")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["data"]) == 4

    @pytest.mark.asyncio
    async def test_list_matches_filter_by_sport(self, seeded_client):
        resp = await client.get("/api/v1/matches?sport_category=FOOTBALL")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        for match in data["data"]:
            assert match["sport_category"] == "FOOTBALL"

    @pytest.mark.asyncio
    async def test_list_matches_filter_by_status(self, seeded_client):
        resp = await client.get("/api/v1/matches?status=LIVE")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["data"][0]["status"] == "LIVE"

    @pytest.mark.asyncio
    async def test_list_matches_filter_both(self, seeded_client):
        resp = await client.get("/api/v1/matches?sport_category=CRICKET&status=FINISHED")
        assert resp.status_code == 200
        data = resp.json()
        for match in data["data"]:
            assert match["sport_category"] == "CRICKET"
            assert match["status"] == "FINISHED"

    @pytest.mark.asyncio
    async def test_list_matches_pagination(self, seeded_client):
        resp = await client.get("/api/v1/matches?per_page=2&page=1")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["per_page"] == 2
        assert data["total"] == 4

    @pytest.mark.asyncio
    async def test_list_matches_ordered_by_start_time_desc(self, seeded_client):
        resp = await client.get("/api/v1/matches")
        data = resp.json()
        matches = data["data"]
        for i in range(len(matches) - 1):
            assert matches[i]["start_time"] >= matches[i + 1]["start_time"]


# ---------------------------------------------------------------------------
# Get Match By ID
# ---------------------------------------------------------------------------

class TestGetMatch:
    @pytest.mark.asyncio
    async def test_get_match_by_id(self, seeded_client):
        resp = await client.get("/api/v1/matches")
        data = resp.json()
        match_id = data["data"][0]["id"]

        resp = await client.get(f"/api/v1/matches/{match_id}")
        assert resp.status_code == 200
        match_data = resp.json()
        assert match_data["id"] == match_id
        assert match_data["title"] == "Match 0"

    @pytest.mark.asyncio
    async def test_get_match_not_found(self, seeded_client):
        resp = await client.get("/api/v1/matches/nonexistent-id")
        assert resp.status_code == 404
