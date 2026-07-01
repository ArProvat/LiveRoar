"""Unit tests for app.config module."""
import json
import os
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.config import Settings


class TestSettings:
    def test_settings_load_required_fields(self):
        """Settings reads env_file first — verify the loaded values exist."""
        import os
        s = Settings()
        assert s.database_url is not None and len(s.database_url) > 0
        assert s.jwt_secret_key is not None and len(s.jwt_secret_key) > 0

    def test_settings_defaults(self):
        s = Settings(DATABASE_URL="sqlite+aiosqlite:///:memory:", JWT_SECRET_KEY="s")
        assert s.jwt_algorithm == "HS256"
        assert s.access_token_expire_minutes == 15
        assert s.refresh_token_expire_days == 7
        assert s.secret_key_salt == "liveroar-salt-2026"
        assert s.backend_host == "0.0.0.0"
        assert s.backend_port == 8000
        assert s.redis_url == "redis://localhost:6379/0"
        assert s.rtmp_server_url == "rtmp://localhost:1935/live"
        assert s.hls_server_url == "http://localhost:8888"
        assert s.cloudflare_r2_bucket == "liveroar-streams"

    def test_settings_cors_origins_list(self):
        s = Settings(DATABASE_URL="sqlite+aiosqlite:///:memory:", JWT_SECRET_KEY="s",
                     cors_origins=["http://localhost:3000", "http://localhost:8080"])
        assert len(s.cors_origins) == 2
        assert "http://localhost:3000" in s.cors_origins

    def test_settings_cors_origins_comma_string(self):
        s = Settings(DATABASE_URL="sqlite+aiosqlite:///:memory:", JWT_SECRET_KEY="s",
                     cors_origins='["http://a.com", "http://b.com"]')
        assert s.cors_origins == ["http://a.com", "http://b.com"]

    def test_settings_cors_origins_space_comma_string(self):
        s = Settings(DATABASE_URL="sqlite+aiosqlite:///:memory:", JWT_SECRET_KEY="s",
                     cors_origins="http://a.com, http://b.com")
        assert s.cors_origins == ["http://a.com", "http://b.com"]

    def test_settings_optional_fields_empty(self):
        s = Settings(DATABASE_URL="sqlite+aiosqlite:///:memory:", JWT_SECRET_KEY="s")
        assert s.cloudflare_r2_endpoint == ""
        assert s.cloudflare_r2_access_key == ""
        assert s.cloudflare_r2_secret_key == ""
        assert s.resend_api_key == ""
        assert s.sentry_dsn == ""

    def test_settings_extra_fields_ignored(self):
        s = Settings(DATABASE_URL="sqlite+aiosqlite:///:memory:", JWT_SECRET_KEY="s", **{"UNKNOWN_FIELD": "ignored"})
        assert not hasattr(s, "unknown_field")
