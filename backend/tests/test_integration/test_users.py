"""Integration tests for users/profile API endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app import app
from app.database import Base


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="session", autouse=True)
async def test_db_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def client(test_db_engine):
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

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


@pytest.fixture
async def auth_client(test_db_engine):
    test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

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


# ---------------------------------------------------------------------------
# Get Profile
# ---------------------------------------------------------------------------

class TestGetProfile:
    @pytest.mark.asyncio
    async def test_get_profile_authenticated(self, auth_client, logged_in_user):
        _, token = logged_in_user
        resp = await auth_client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == logged_in_user[0]
        assert data["role"] == "USER"

    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self, auth_client):
        resp = await auth_client.get("/api/v1/users/me")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Update Profile
# ---------------------------------------------------------------------------

class TestUpdateProfile:
    @pytest.mark.asyncio
    async def test_update_profile_name(self, auth_client, logged_in_user):
        _, token = logged_in_user
        resp = await auth_client.put(
            "/api/v1/users/me",
            json={"name": "Updated Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    @pytest.mark.asyncio
    async def test_update_profile_avatar(self, auth_client, logged_in_user):
        _, token = logged_in_user
        resp = await auth_client.put(
            "/api/v1/users/me",
            json={"avatar_url": "https://example.com/img.png"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["avatar_url"] == "https://example.com/img.png"

    @pytest.mark.asyncio
    async def test_update_profile_unauthenticated(self, auth_client):
        resp = await auth_client.put(
            "/api/v1/users/me",
            json={"name": "Hacker"},
        )
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Favorites
# ---------------------------------------------------------------------------

class TestFavorites:
    @pytest.fixture
    async def user_with_favorite(self, test_db_engine):
        """User + match + favorite pre-seeded."""
        test_session_maker = async_sessionmaker(test_db_engine, class_=AsyncSession, expire_on_commit=False)

        from app.core.models import User, Match, Favorite
        from app.core.security import hash_password
        from datetime import datetime

        async with test_session_maker() as session:
            user = User(
                id="fav-user-123",
                email="fav@example.com",
                name="Fan User",
                hashed_password=hash_password("password123"),
            )
            session.add(user)
            await session.flush()

            match = Match(
                id="match-fav-123",
                title="Favorited Match",
                sport_category="FOOTBALL",
                start_time=datetime.now(),
                team_a="A",
                team_b="B",
            )
            session.add(match)
            fav = Favorite(user_id=user.id, match_id=match.id)
            session.add(fav)
            await session.commit()

            # Login to get token
            async with test_session_maker() as login_session:
                from app.core.security import create_access_token
                token = create_access_token({"sub": user.id, "role": "USER"})

        yield user.id, token

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_favorites(self, auth_client, user_with_favorite):
        _, token = user_with_favorite
        resp = await auth_client.get(
            "/api/v1/users/me/favorites",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Favorited Match"

    @pytest.mark.asyncio
    async def test_get_favorites_empty(self, auth_client, logged_in_user):
        _, token = logged_in_user
        resp = await auth_client.get(
            "/api/v1/users/me/favorites",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []

    @pytest.mark.asyncio
    async def test_add_favorite(self, auth_client, logged_in_user):
        _, token = logged_in_user

        # Create a match first
        from app.core.models import Match
        test_session_maker = async_sessionmaker(
            [p for p in [None] if False][0] if False else test_db_engine,  # noqa: SIM910
            class_=AsyncSession, expire_on_commit=False,
        )
        async with test_session_maker() as session:
            from datetime import datetime
            match = Match(
                id="new-match-id",
                title="New Match",
                sport_category="UFC",
                start_time=datetime.now(),
            )
            session.add(match)
            await session.commit()

        resp = await auth_client.post(
            "/api/v1/users/me/favorites/new-match-id",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_remove_favorite(self, auth_client, user_with_favorite):
        _, token = user_with_favorite
        resp = await auth_client.delete(
            "/api/v1/users/me/favorites/match-fav-123",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    @pytest.mark.asyncio
    async def test_remove_nonexistent_favorite(self, auth_client, logged_in_user):
        _, token = logged_in_user
        resp = await auth_client.delete(
            "/api/v1/users/me/favorites/nonexistent",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Watch History
# ---------------------------------------------------------------------------

class TestWatchHistory:
    @pytest.mark.asyncio
    async def test_get_history_empty(self, auth_client, logged_in_user):
        _, token = logged_in_user
        resp = await auth_client.get(
            "/api/v1/users/me/history",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json() == []
