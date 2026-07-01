"""Integration tests for users/profile API endpoints."""
import os
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
from app import app
from app.database import Base, get_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def db_path(tmp_path_factory):
    path = tmp_path_factory.mktemp("test_db") / "users_test.sqlite"
    return str(path)


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
        await conn.run_sync(Base.metadata.create_all)
    yield _engine
    await _engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)


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
async def auth_client(_seed_db, _session_maker):
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
async def logged_in_user(auth_client):
    """Register a user and return (email, password, access_token)."""
    register_data = {
        "email": "profile@example.com",
        "password": "password123",
        "name": "Profile User",
    }
    await auth_client.post("/api/v1/auth/register", json=register_data)
    login_resp = await auth_client.post("/api/v1/auth/login", json=register_data)
    tokens = login_resp.json()
    return register_data["email"], tokens["access_token"]
