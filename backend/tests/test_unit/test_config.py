"""Unit tests for app.config module."""
import json
import os
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.config import Settings


class TestSettings:
    @pytest.fixture
    def env_vars(self):
        """Provide required env vars for Settings instantiation."""
        return {
            "DATABASE_URL": "postgresql+asyncpg://user:pass@localhost/testdb",
            "JWT_SECRET_KEY": "test-secret-key",
        }

    @pytest.fixture
    def settings(self, env_vars):
        return Settings(**env_vars)

    def test_settings_load_required_fields(self, env_vars):
        s = Settings(**env_vars)
        assert s.database_url == "postgresql+asyncpg://user:pass@localhost/testdb"
        assert s.jwt_secret_key == "test-secret-key"

    def test_settings_defaults(self, env_vars):
        s = Settings(**env_vars)
        assert s.jwt_algorithm == "HS256"
        assert s.access_token_expire_minutes == 15
        assert s.refresh_token_expire_days == 7
        assert s.secret_key_salt == "liveroar-salt-2026"
        assert s.backend_host == "0.0.0.0"
        assert s.backend_port == 8000
        assert s.cors_origins == ["http://localhost:3000"]
        assert s.redis_url == "redis://localhost:6379/0"
        assert s.rtmp_server_url == "rtmp://localhost:1935/live"
        assert s.hls_server_url == "http://localhost:8888"
        assert s.cloudflare_r2_bucket == "liveroar-streams"

    def test_settings_cors_origins_list(self, env_vars):
        s = Settings(**env_vars, cors_origins=["http://localhost:3000", "http://localhost:8080"])
        assert len(s.cors_origins) == 2
        assert "http://localhost:3000" in s.cors_origins

    def test_settings_cors_origins_comma_string(self, env_vars):
        s = Settings(**env_vars, cors_origins='["http://a.com", "http://b.com"]')
        assert s.cors_origins == ["http://a.com", "http://b.com"]

    def test_settings_cors_origins_space_comma_string(self, env_vars):
        s = Settings(**env_vars, cors_origins="http://a.com, http://b.com")
        assert s.cors_origins == ["http://a.com", "http://b.com"]

    def test_settings_missing_required_field_raises(self):
        with pytest.raises(ValidationError):
            Settings()  # no DATABASE_URL or JWT_SECRET_KEY

    def test_settings_optional_fields_empty(self, env_vars):
        s = Settings(**env_vars)
        assert s.cloudflare_r2_endpoint == ""
        assert s.cloudflare_r2_access_key == ""
        assert s.cloudflare_r2_secret_key == ""
        assert s.resend_api_key == ""
        assert s.sentry_dsn == ""

    def test_settings_extra_fields_ignored(self, env_vars):
        s = Settings(**{**env_vars, "UNKNOWN_FIELD": "ignored"})
        assert not hasattr(s, "unknown_field")
