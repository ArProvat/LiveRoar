"""Pytest configuration for the LiveRoar backend test suite.

All integration tests share one file-based SQLite database.
app.database.async_session is patched so endpoints like /refresh
that use it directly talk to the test database.
"""
import sys, os, sqlite3, tempfile

_BACKEND_ROOT = os.path.dirname(__file__)
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

# ── 1. Remove .env files so they can't interfere ────────────────────────────
_project_root = os.path.abspath(os.path.join(_BACKEND_ROOT, "..", ".."))
for _rel in [".env", os.path.join("backend", ".env")]:
    _clean = os.path.normpath(os.path.join(_project_root, _rel))
    if os.path.exists(_clean):
        os.remove(_clean)

# ── 2. Set ALL required env vars BEFORE any app module is imported ──────────
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-for-development-only"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-for-development-only"
os.environ["SECRET_KEY_SALT"] = "liveroar-salt-2026"

import pytest
from sqlalchemy import MetaData, inspect
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine as create_sync_engine

# Use a unique file per pytest session (not :memory:, which aiosqlite shares)
_TMPDIR = tempfile.mkdtemp(prefix="liveroar_test_")
_TEST_DB = os.path.join(_TMPDIR, "test.sqlite")

# Re-patch DATABASE_URL to point at file-based DB
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_TEST_DB}"


def _create_schema_sync(db_path: str) -> MetaData:
    """Use SQLAlchemy's sync engine (which compiles types correctly) to create all tables."""
    sync_engine = create_sync_engine(f"sqlite:///{db_path}", echo=False)

    # Import models so they register with Base.metadata
    from app.core.models import (  # noqa: F401
        User, Channel, Match, Favorite,
        WatchHistory, ChatMessage, Notification, StreamConfig,
    )
    import app.database as db_mod

    with sync_engine.begin() as conn:
        conn.run_sync(db_mod.Base.metadata.create_all)

    meta = db_mod.Base.metadata
    sync_engine.dispose()
    return meta


@pytest.fixture(scope="session")
async def _engine():
    """Create file-based SQLite engine."""
    engine = create_async_engine(
        f"sqlite+aiosqlite:///{_TEST_DB}",
        echo=False,
        connect_args={"check_same_thread": False},
    )
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
async def _setup_db(_engine):
    """Build schema via sync engine then use async engine for queries."""
    _create_schema_sync(_TEST_DB)

    yield _engine


@pytest.fixture
def _session_maker(_setup_db):
    return async_sessionmaker(_setup_db, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
async def _patch_database(_engine):
    """Patch app.database so the refresh endpoint works."""
    import app.database as db_mod
    db_mod.async_session = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    yield
