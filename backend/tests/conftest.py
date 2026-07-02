"""Pytest configuration for the LiveRoar backend test suite.

All integration tests share one file-based SQLite database.
app.database.async_session is patched so endpoints like /refresh
that use it directly talk to the test database.
"""
import sys, os
import tempfile
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

_BACKEND_ROOT = os.path.join(os.path.dirname(__file__))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

# Create a temp file for the whole pytest session
_TMPDIR = tempfile.mkdtemp(prefix="liveroar_test_")
_TEST_DB = os.path.join(_TMPDIR, "test.sqlite")

# Patch DATABASE_URL before app modules are imported via the env
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_TEST_DB}"

# Use our own Base defined here, NOT from app.database (which would
# have been created with the original env).
Base = declarative_base()


@pytest.fixture(scope="session")
async def _engine():
    engine = create_async_engine(f"sqlite+aiosqlite:///{_TEST_DB}", echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
async def _setup_db(_engine):
    """Create all tables once per session."""
    if os.path.exists(_TEST_DB):
        os.remove(_TEST_DB)

    async with _engine.begin() as conn:
        # Import models & sync Base so they register with our metadata
        from app.core.models import (  # noqa: F401
            User, Channel, Match, Favorite,
            WatchHistory, ChatMessage, Notification, StreamConfig,
        )
        # Import Base from app.database — but it should pick up our patched env
        import app.database as db_mod
        await conn.run_sync(db_mod.Base.metadata.create_all)

    yield _engine


@pytest.fixture
def _session_maker(_setup_db):
    return async_sessionmaker(_setup_db, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
async def _patch_database(_engine):
    """Patch app.database so the refresh endpoint (which uses async_session directly) works."""
    import app.database as db_mod
    db_mod.async_session = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    yield
