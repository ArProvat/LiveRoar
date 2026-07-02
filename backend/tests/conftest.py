"""Pytest configuration for the LiveRoar backend test suite.

All integration tests share a single temp SQLite database.  The file is
created/destroyed once per pytest session.
"""
import sys
import os
import tempfile
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database import Base

_BACKEND_ROOT = os.path.join(os.path.dirname(__file__))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

# Create a temporary file that lives for the entire pytest session.
_TMPDIR = tempfile.mkdtemp(prefix="liveroar_test_")
_TEST_DB = os.path.join(_TMPDIR, "test.sqlite")


# ---------------------------------------------------------------------------
# Engine / session
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def _db_path():
    """Return the shared SQLite file path for all integration tests."""
    return _TEST_DB


@pytest.fixture(scope="session")
async def _engine(_db_path):
    """Create an async engine once per session."""
    db_url = f"sqlite+aiosqlite:///{_db_path}"
    engine = create_async_engine(db_url, echo=False)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
async def _setup_db(_engine, _db_path):
    """Drop and recreate all tables once per session."""
    # Ensure the file is fresh
    if os.path.exists(_db_path):
        os.remove(_db_path)

    async with _engine.begin() as conn:
        from app.core.models import (  # noqa: F401
            User, Channel, Match, Favorite,
            WatchHistory, ChatMessage, Notification, StreamConfig,
        )
        await conn.run_sync(Base.metadata.create_all)

    yield _engine


@pytest.fixture
def _session_maker(_setup_db):
    return async_sessionmaker(_setup_db, class_=AsyncSession, expire_on_commit=False)


# ---------------------------------------------------------------------------
# Patch app.database so the refresh endpoint (which uses async_session
# directly) talks to our test engine.
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def _patch_database_session(_engine):
    """Replace the module-level async_session with one bound to _engine."""
    import app.database as db_mod
    db_mod.async_session = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    yield
