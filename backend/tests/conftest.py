"""Pytest configuration for the LiveRoar backend test suite."""
import sys
import os

# Ensure the backend directory is on sys.path so 'app' imports work
_BACKEND_ROOT = os.path.join(os.path.dirname(__file__))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

# Set a minimal .env for tests so Settings() doesn't crash
_ENV_PATH = os.path.join(os.path.dirname(_BACKEND_ROOT), ".env")
if not os.path.exists(_ENV_PATH):
    with open(_ENV_PATH, "w") as f:
        f.write("""DATABASE_URL=postgresql+asyncpg://test:test@localhost/test
JWT_SECRET_KEY=test-secret-key-for-unit-tests-only
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
""")
