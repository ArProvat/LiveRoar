"""Integration tests for channels API endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
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
async def seeded_client(test_db_engine):
    """Client with DB seeded with channels."""
    test_session_maker = async_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_session_maker() as session:
        from app.core.models import Channel
        for i in range(5):
            channel = Channel(
                name=f"Channel {i}",
                slug=f"channel-{i}",
                description=f"Description for channel {i}",
                category="FOOTBALL" if i % 2 == 0 else "CRICKET",
                is_live=i == 0,
            )
            session.add(channel)
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
# List Channels
# ---------------------------------------------------------------------------

class TestListChannels:
    @pytest.mark.asyncio
    async def test_list_channels_empty(self, client):
        resp = await client.get("/api/v1/channels")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["data"] == []
        assert data["page"] == 1
        assert data["per_page"] == 20

    @pytest.mark.asyncio
    async def test_list_channels_with_data(self, seeded_client):
        resp = await client.get("/api/v1/channels")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 5
        assert len(data["data"]) == 5

    @pytest.mark.asyncio
    async def test_list_channels_paginated(self, seeded_client):
        resp = await client.get("/api/v1/channels?per_page=2&page=1")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["total"] == 5
        assert data["page"] == 1

    @pytest.mark.asyncio
    async def test_list_channels_second_page(self, seeded_client):
        resp = await client.get("/api/v1/channels?per_page=2&page=2")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["page"] == 2

    @pytest.mark.asyncio
    async def test_list_channels_last_page(self, seeded_client):
        resp = await client.get("/api/v1/channels?per_page=2&page=3")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 1
        assert data["page"] == 3

    @pytest.mark.asyncio
    async def test_list_channels_filter_by_category(self, seeded_client):
        resp = await client.get("/api/v1/channels?category=FOOTBALL")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 3  # Channels 0, 2, 4 are FOOTBALL
        for channel in data["data"]:
            assert channel["category"] == "FOOTBALL"

    @pytest.mark.asyncio
    async def test_list_channels_filter_no_match(self, seeded_client):
        resp = await client.get("/api/v1/channels?category=TENNIS")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["data"] == []

    @pytest.mark.asyncio
    async def test_list_channels_invalid_page(self, client):
        resp = await client.get("/api/v1/channels?page=0")
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_list_channels_per_page_limit(self, client):
        resp = await client.get("/api/v1/channels?per_page=101")
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Get Channel By Slug
# ---------------------------------------------------------------------------

class TestGetChannel:
    @pytest.mark.asyncio
    async def test_get_channel_by_slug(self, seeded_client):
        resp = await client.get("/api/v1/channels/channel-2")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Channel 2"
        assert data["slug"] == "channel-2"
        assert data["category"] == "FOOTBALL"

    @pytest.mark.asyncio
    async def test_get_channel_not_found(self, seeded_client):
        resp = await client.get("/api/v1/channels/nonexistent")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_get_channel_with_is_live(self, seeded_client):
        resp = await client.get("/api/v1/channels/channel-0")
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_live"] is True
