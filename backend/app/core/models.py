from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float,
    ForeignKey, Text, Numeric, Index, func
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship, declared_attr

if TYPE_CHECKING:
    from app.database import Base
else:
    from app.database import Base


def pg_uuid():
    return str(uuid4())


class BaseModel:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower() + "s"

    id = Column(PGUUID(as_uuid=False), primary_key=True, default=pg_uuid)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class User(BaseModel, Base):
    __tablename__ = "users"

    name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(20), default="USER", nullable=False, index=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    watch_history = relationship("WatchHistory", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

    __table_args__ = (
        Index("ix_users_email", "email"),
    )


class Channel(BaseModel, Base):
    __tablename__ = "channels"

    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    category = Column(String(30), nullable=False, index=True)  # FOOTBALL, CRICKET, UFC, etc.
    is_live = Column(Boolean, default=False)
    rtmp_stream_key = Column(String(100), nullable=True)

    matches = relationship("Match", back_populates="channel")

    __table_args__ = (
        Index("ix_channels_slug", "slug"),
        Index("ix_channels_category", "category"),
    )


class Match(BaseModel, Base):
    __tablename__ = "matches"

    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    sport_category = Column(String(30), nullable=False, index=True)
    status = Column(String(20), default="SCHEDULED", nullable=False, index=True)  # SCHEDULED, LIVE, FINISHED, CANCELLED
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    team_a = Column(String(100), nullable=True)
    team_b = Column(String(100), nullable=True)
    league = Column(String(100), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    rtmp_stream_key = Column(String(100), nullable=True)
    hls_url = Column(String(500), nullable=True)
    channel_id = Column(PGUUID(as_uuid=False), ForeignKey("channels.id"), nullable=True)
    viewers = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    metadata_json = Column(JSONB, nullable=True)

    channel = relationship("Channel", back_populates="matches")
    favorites = relationship("Favorite", back_populates="match", cascade="all, delete-orphan")
    watch_history = relationship("WatchHistory", back_populates="match", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_matches_status", "status"),
        Index("ix_matches_sport_category", "sport_category"),
        Index("ix_matches_start_time", "start_time"),
        Index("ix_matches_channel", "channel_id"),
    )


class Favorite(BaseModel, Base):
    __tablename__ = "favorites"

    user_id = Column(PGUUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(PGUUID(as_uuid=False), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="favorites")
    match = relationship("Match", back_populates="favorites")

    __table_args__ = (
        Index("ix_favorites_user_match", "user_id", "match_id", unique=True),
    )


class WatchHistory(BaseModel, Base):
    __tablename__ = "watch_history"

    user_id = Column(PGUUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(PGUUID(as_uuid=False), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    watched_at = Column(DateTime(timezone=True), server_default=func.now())
    progress = Column(Float, default=0.0)
    duration_watched = Column(Float, default=0.0)  # in seconds

    user = relationship("User", back_populates="watch_history")
    match = relationship("Match", back_populates="watch_history")

    __table_args__ = (
        Index("ix_watch_history_user_watched", "user_id", "watched_at"),
    )


class ChatMessage(BaseModel, Base):
    __tablename__ = "chat_messages"

    user_id = Column(PGUUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    username = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    match_id = Column(PGUUID(as_uuid=False), ForeignKey("matches.id", ondelete="SET NULL"), nullable=True)
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="chat_messages")

    __table_args__ = (
        Index("ix_chat_messages_match_created", "match_id", "created_at"),
    )


class Notification(BaseModel, Base):
    __tablename__ = "notifications"

    user_id = Column(PGUUID(as_uuid=False), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    link = Column(String(500), nullable=True)
    type = Column(String(30), nullable=True)  # MATCH_START, RESULT, etc.


class StreamConfig(BaseModel, Base):
    """Tracks active RTMP streams and their health."""
    __tablename__ = "stream_configs"

    match_id = Column(PGUUID(as_uuid=False), ForeignKey("matches.id"), nullable=True, unique=True)
    stream_key = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    stopped_at = Column(DateTime(timezone=True), nullable=True)
    rtmp_url = Column(String(500), nullable=True)
    hls_url = Column(String(500), nullable=True)
    bitrate = Column(Integer, nullable=True)
    resolution = Column(String(20), nullable=True)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_stream_configs_match", "match_id"),
        Index("ix_stream_configs_active", "is_active"),
    )
