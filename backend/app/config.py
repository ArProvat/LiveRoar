from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    secret_key_salt: str = "liveroar-salt-2026"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000"]
    redis_url: str = "redis://localhost:6379/0"
    rtmp_server_url: str = "rtmp://localhost:1935/live"
    hls_server_url: str = "http://localhost:8888"
    cloudflare_r2_endpoint: str = ""
    cloudflare_r2_access_key: str = ""
    cloudflare_r2_secret_key: str = ""
    cloudflare_r2_bucket: str = "liveroar-streams"
    resend_api_key: str = ""
    sentry_dsn: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
