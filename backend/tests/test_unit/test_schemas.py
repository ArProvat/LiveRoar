"""Unit tests for app.schemas.match module."""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.match import MatchCreate, MatchUpdate, MatchOut, MatchListResponse


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
        assert match.status is None  # not in schema, default handled by model
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
        data = [MatchOut(**{
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
        })]
        response = MatchListResponse(data=data, total=1, page=1, per_page=20, total_pages=1)
        assert len(response.data) == 1
