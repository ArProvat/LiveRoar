import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.config import settings
from app.database import Base, async_session

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session", autouse=True)
async def test_db_engine():
    """Create test database tables."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def client(test_db_engine):
    """Create an async test client with test DB."""
    # Override the database
    from app.database import engine as original_engine
    from app.database import async_session as original_session

    # Create test sessionmaker
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

    # Override dependencies
    original_get_db = app.dependency_overrides.get(None)

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


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "liveroar-backend"


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User",
    })
    assert response.status_code in (200, 201)
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "password": "testpass123",
    })
    response = await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "password": "testpass123",
    })
    assert response.status_code == 409
