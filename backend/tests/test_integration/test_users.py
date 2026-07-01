"""Integration tests for users/profile API endpoints."""
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
    tmpdir = tempfile.mkdtemp(prefix="liveroar_users_test_")
    return os.path.join(tmpdir, "users_test.sqlite")


@pytest.fixture(scope="session")
def _engine(db_path):
    db_url = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(db_url, echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def _setup_db(_engine, db_path):
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

    import asyncio
    async def create():
        async with _engine.connect() as conn:
            from app.core.models import User, Channel, Match, Favorite, WatchHistory, ChatMessage, Notification, StreamConfig  # noqa: F401
            await conn.run_sync(Base.metadata.create_all)
            await conn.commit()
    asyncio.get_event_loop().run_until_complete(create())

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
