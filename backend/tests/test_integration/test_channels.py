"""Integration tests for channels API endpoints."""
import os
import tempfile
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app import app
from app.database import Base, get_db


@pytest.fixture(scope="session")
def db_path():
    tmpdir = tempfile.mkdtemp(prefix="liveroar_channels_test_")
    return os.path.join(tmpdir, "channels_test.sqlite")


@pytest.fixture(scope="session")
def test_db_url(db_path):
    return f"sqlite+aiosqlite:///{db_path}"


@pytest.fixture(scope="session")
def _engine(test_db_url):
    engine = create_async_engine(test_db_url, echo=False)
    return engine


@pytest.fixture(scope="session", autouse=True)
async def _seed_db(_engine):
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield _engine
    await _engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)
        tmpdir = os.path.dirname(db_path)
        if os.path.exists(tmpdir):
            try:
                os.rmdir(tmpdir)
            except OSError:
                pass


@pytest.fixture
def _session_maker(_engine):
    return async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture
async def client(_seed_db, _session_maker):
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
async def seeded_client(_seed_db, _session_maker):
    async with _session_maker() as session:
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
