"""Unit tests for all app.schemas modules."""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.auth import UserCreate, UserUpdate, UserOut, TokenPair, TokenRefresh
from app.schemas.match import MatchCreate, MatchUpdate, MatchOut, MatchListResponse
from app.schemas.channel import ChannelCreate, ChannelOut, ChannelListResponse


# ---------------------------------------------------------------------------
# UserCreate
# ---------------------------------------------------------------------------

class TestUserCreate:
    def test_valid_user_create(self):
        data = {"email": "test@example.com", "password": "password123", "name": "Test User"}
        user = UserCreate(**data)
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.password == "password123"

    def test_user_create_without_name(self):
        data = {"email": "test@example.com", "password": "password123"}
        user = UserCreate(**data)
        assert user.name is None

    def test_user_create_invalid_email(self):
        with pytest.raises(ValidationError):
            UserCreate(email="not-an-email", password="password123")

    def test_user_create_password_too_short(self):
        with pytest.raises(ValidationError):
            UserCreate(email="test@example.com", password="short")

    def test_user_create_password_too_long(self):
        with pytest.raises(ValidationError):
            UserCreate(email="test@example.com", password="a" * 101)

    def test_user_create_min_password_length(self):
        user = UserCreate(email="test@example.com", password="12345678")
        assert len(user.password) == 8

    def test_user_create_uppercase_email_normalized(self):
        user = UserCreate(email="Test@Example.com", password="password123")
        assert user.email == "test@example.com"


# ---------------------------------------------------------------------------
# UserUpdate
# ---------------------------------------------------------------------------

class TestUserUpdate:
    def test_update_name_only(self):
        update = UserUpdate(name="New Name")
        assert update.name == "New Name"
        assert update.avatar_url is None

    def test_update_avatar_only(self):
        update = UserUpdate(avatar_url="https://example.com/avatar.png")
        assert update.avatar_url == "https://example.com/avatar.png"
        assert update.name is None

    def test_update_both(self):
        update = UserUpdate(name="New Name", avatar_url="https://example.com/avatar.png")
        assert update.name == "New Name"
        assert update.avatar_url == "https://example.com/avatar.png"

    def test_update_empty(self):
        update = UserUpdate()
        assert update.name is None
        assert update.avatar_url is None


# ---------------------------------------------------------------------------
# UserOut
# ---------------------------------------------------------------------------

class TestUserOut:
    def test_user_out_from_dict(self):
        data = {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "Test User",
            "email": "test@example.com",
            "role": "USER",
            "avatar_url": "https://example.com/avatar.png",
            "created_at": "2026-01-01T00:00:00Z",
        }
        user = UserOut(**data)
        assert user.name == "Test User"
        assert user.role == "USER"

    def test_user_out_nullable_fields(self):
        data = {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": None,
            "email": "test@example.com",
            "role": "ADMIN",
            "avatar_url": None,
            "created_at": "2026-01-01T00:00:00Z",
        }
        user = UserOut(**data)
        assert user.name is None
        assert user.avatar_url is None
        assert user.role == "ADMIN"


# ---------------------------------------------------------------------------
# TokenPair / TokenRefresh
# ---------------------------------------------------------------------------

class TestTokenPair:
    def test_token_pair_defaults(self):
        token = TokenPair(access_token="at", refresh_token="rt", expires_in=900)
        assert token.token_type == "bearer"
        assert token.expires_in == 900

    def test_token_pair_custom_token_type(self):
        token = TokenPair(access_token="at", refresh_token="rt", expires_in=900, token_type="mac")
        assert token.token_type == "mac"


class TestTokenRefresh:
    def test_token_refresh_valid(self):
        token = TokenRefresh(refresh_token="x" * 40)  # noqa: S605 - test dummy value
        assert token.refresh_token == "x" * 40

    def test_token_refresh_empty_rejected(self):
        with pytest.raises(ValidationError):
            TokenRefresh(refresh_token="")


# ---------------------------------------------------------------------------
# MatchCreate / MatchUpdate
# ---------------------------------------------------------------------------

class TestMatchCreate:
    def test_valid_match_create(self):
        data = {
            "title": "Team A vs Team B",
            "sport_category": "FOOTBALL",
            "start_time": datetime(2026, 6, 15, 18, 0, 0),
        }
        match = MatchCreate(**data)
        assert match.title == "Team A vs Team B"
        assert match.sport_category == "FOOTBALL"
        assert match.is_featured is False

    def test_match_create_all_fields(self):
        data = {
            "title": "Full Match",
            "description": "A great match",
            "sport_category": "CRICKET",
            "start_time": datetime(2026, 7, 1, 10, 0, 0),
            "end_time": datetime(2026, 7, 1, 14, 0, 0),
            "team_a": "India",
            "team_b": "Australia",
            "league": "ICC World Cup",
            "thumbnail_url": "https://example.com/thumb.jpg",
            "hls_url": "https://example.com/stream.m3u8",
            "is_featured": True,
        }
        match = MatchCreate(**data)
        assert match.team_a == "India"
        assert match.team_b == "Australia"
        assert match.is_featured is True

    def test_match_create_title_too_short(self):
        with pytest.raises(ValidationError):
            MatchCreate(title="", sport_category="FOOTBALL", start_time=datetime.now())

    def test_match_create_title_too_long(self):
        with pytest.raises(ValidationError):
            MatchCreate(title="a" * 201, sport_category="FOOTBALL", start_time=datetime.now())

    def test_match_create_default_is_featured(self):
        match = MatchCreate(title="Test", sport_category="UFC", start_time=datetime.now())
        assert match.is_featured is False


class TestMatchUpdate:
    def test_update_status(self):
        update = MatchUpdate(status="LIVE")
        assert update.status == "LIVE"

    def test_update_partial(self):
        update = MatchUpdate(title="New Title")
        assert update.title == "New Title"
        assert update.status is None
        assert update.hls_url is None

    def test_update_empty(self):
        update = MatchUpdate()
        assert update.model_dump(exclude_unset=True) == {}


# ---------------------------------------------------------------------------
# MatchOut / MatchListResponse
# ---------------------------------------------------------------------------

class TestMatchOut:
    def test_match_out_from_dict(self):
        data = {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "title": "Test Match",
            "sport_category": "FOOTBALL",
            "status": "LIVE",
            "start_time": datetime(2026, 6, 15, 18, 0, 0),
            "end_time": None,
            "team_a": "A",
            "team_b": "B",
            "viewers": 1500,
            "is_featured": True,
            "created_at": datetime(2026, 6, 14, 12, 0, 0),
        }
        match = MatchOut(**data)
        assert match.title == "Test Match"
        assert match.viewers == 1500

    def test_match_out_with_channel(self):
        data = {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "title": "Test",
            "sport_category": "FOOTBALL",
            "status": "SCHEDULED",
            "start_time": datetime(2026, 6, 15, 18, 0, 0),
            "end_time": None,
            "team_a": None,
            "team_b": None,
            "viewers": 0,
            "is_featured": False,
            "created_at": datetime(2026, 6, 14, 12, 0, 0),
            "channel": {"name": "ESPN", "slug": "espn"},
        }
        match = MatchOut(**data)
        assert match.channel["name"] == "ESPN"


class TestMatchListResponse:
    def test_empty_list_response(self):
        response = MatchListResponse(data=[], total=0, page=1, per_page=20, total_pages=0)
        assert response.total == 0
        assert response.total_pages == 0

    def test_paginated_response(self):
        item = MatchOut(**{
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "title": "Match 1",
            "sport_category": "FOOTBALL",
            "status": "LIVE",
            "start_time": datetime(2026, 6, 15, 18, 0, 0),
            "end_time": None,
            "team_a": None,
            "team_b": None,
            "viewers": 100,
            "is_featured": False,
            "created_at": datetime(2026, 6, 14, 12, 0, 0),
        })
        response = MatchListResponse(data=[item], total=1, page=1, per_page=20, total_pages=1)
        assert len(response.data) == 1


# ---------------------------------------------------------------------------
# ChannelCreate / ChannelOut
# ---------------------------------------------------------------------------

class TestChannelCreate:
    def test_valid_channel_create(self):
        data = {"name": "ESPN", "slug": "espn", "category": "FOOTBALL"}
        channel = ChannelCreate(**data)
        assert channel.name == "ESPN"
        assert channel.slug == "espn"

    def test_channel_create_with_optional_fields(self):
        data = {
            "name": "Sky Sports",
            "slug": "sky-sports",
            "category": "CRICKET",
            "description": "Premium sports channel",
            "logo_url": "https://example.com/logo.png",
        }
        channel = ChannelCreate(**data)
        assert channel.description == "Premium sports channel"

    def test_channel_create_empty_name_rejected(self):
        with pytest.raises(ValidationError):
            ChannelCreate(name="", slug="test", category="FOOTBALL")

    def test_channel_create_empty_slug_rejected(self):
        with pytest.raises(ValidationError):
            ChannelCreate(name="Test", slug="", category="FOOTBALL")

    def test_channel_create_slug_too_long(self):
        with pytest.raises(ValidationError):
            ChannelCreate(name="Test", slug="a" * 101, category="FOOTBALL")


class TestChannelOut:
    def test_channel_out_from_dict(self):
        data = {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "ESPN",
            "slug": "espn",
            "category": "FOOTBALL",
            "is_live": True,
            "created_at": datetime(2026, 1, 1, 0, 0, 0),
        }
        channel = ChannelOut(**data)
        assert channel.name == "ESPN"
        assert channel.is_live is True

    def test_channel_out_nullable_fields(self):
        data = {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "Test",
            "slug": "test",
            "description": None,
            "logo_url": None,
            "category": "UFC",
            "is_live": False,
            "created_at": datetime(2026, 1, 1, 0, 0, 0),
        }
        channel = ChannelOut(**data)
        assert channel.description is None
        assert channel.logo_url is None


class TestChannelListResponse:
    def test_empty_channels_response(self):
        response = ChannelListResponse(data=[], total=0, page=1, per_page=20)
        assert response.total == 0

    def test_paginated_channels_response(self):
        item = ChannelOut(**{
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "ESPN",
            "slug": "espn",
            "category": "FOOTBALL",
            "is_live": True,
            "created_at": datetime(2026, 1, 1, 0, 0, 0),
        })
        response = ChannelListResponse(data=[item], total=5, page=1, per_page=20)
        assert len(response.data) == 1
        assert response.total == 5
