"""Integration tests for admin API endpoints."""
import os
import tempfile
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from datetime import datetime
from app import app
from app.database import Base, get_db


@pytest.fixture(scope="session")
def db_path():
    tmpdir = tempfile.mkdtemp(prefix="liveroar_admin_test_")
    return os.path.join(tmpdir, "admin_test.sqlite")


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
        tables = [
            "users", "channels", "matches", "favorites",
            "watch_history", "chat_messages", "notifications",
        ]
        for t in tables:
            await conn.execute(text(f"DROP TABLE IF EXISTS {t}"))
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
async def seeded_admin_client(_seed_db, _session_maker):
    from app.core.models import User, Match
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
