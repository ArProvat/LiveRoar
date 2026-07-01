"""Integration tests for users/profile API endpoints."""
import os
import tempfile
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from datetime import datetime
from app import app
from app.database import get_db, Base


@pytest.fixture(scope="session")
def db_path():
    tmpdir = tempfile.mkdtemp(prefix="liveroar_users_test_")
    return os.path.join(tmpdir, "users_test.sqlite")


@pytest.fixture
async def _engine(db_path):
    db_url = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(db_url, echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture
async def _setup_db(_engine):
    async with _engine.begin() as conn:
        tables = [
            "notifications", "chat_messages", "watch_history",
            "favorites", "matches", "channels", "users",
        ]
        for t in tables:
            await conn.execute(text(f"DROP TABLE IF EXISTS {t}"))
        await conn.run_sync(Base.metadata.create_all)
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
async def logged_in_user(auth_client):
    register_data = {
        "email": "profile@example.com",
        "password": "password123",
        "name": "Profile User",
    }
    await auth_client.post("/api/v1/auth/register", json=register_data)
    login_resp = await auth_client.post("/api/v1/auth/login", json=register_data)
    tokens = login_resp.json()
    return register_data["email"], tokens["access_token"]
