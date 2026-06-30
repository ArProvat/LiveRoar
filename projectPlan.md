# 📺 LiveRoar — Watch. Feel. Roar.

> A web-based live streaming platform for watching football, cricket, UFC, and other sports matches in real time.

---

## Changes from v1.0 (Next.js Full-Stack) → v2.0 (FastAPI Backend)

| Aspect | v1.0 (Next.js) | v2.0 (FastAPI) |
|--------|----------------|----------------|
| **Backend** | Next.js API Routes (TypeScript) | Python FastAPI (async, high performance) |
| **Database ORM** | Prisma | SQLAlchemy 2.0 + Alembic |
| **Auth** | NextAuth.js | JWT (python-jose) + passlib[bcrypt] |
| **Validation** | Zod (frontend) | Pydantic v2 (backend schemas) |
| **WebSocket/Chat** | Socket.io | FastAPI WebSocket + Redis Pub/Sub |
| **API Versioning** | `/api/...` | `/api/v1/...` |
| **Hosting** | Vercel (all-in-one) | Vercel (frontend) + DigitalOcean/Render (backend) |
| **Project Structure** | Single monorepo | `frontend/` + `backend/` + `streaming-server/` |

### Key Architecture Change

```
BEFORE (v1.0):              AFTER (v2.0):

┌─────────────────┐         ┌─────────────┐       ┌──────────────┐
│   Vercel        │         │  Vercel     │       │ FastAPI      │
│   Next.js       │         │  Next.js    │────▶  │ Backend      │
│   (UI + API)    │         │  (UI only)  │       │ (Separate    │
└─────────────────┘         └─────────────┘       │ Server)      │
         │                              ▲         └──────────────┘
         ▼                              │               │
┌─────────────────┐         ┌─────────────┐       ┌──────▼──────┐
│ PostgreSQL      │         │ PostgreSQL  │◀──────│ PostgreSQL  │
│ Prisma ORM      │         │ Shared DB   │       │ Shared DB   │
└─────────────────┘         └─────────────┘       └─────────────┘
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Streaming Pipeline](#8-streaming-pipeline)
9. [Implementation Phases](#9-implementation-phases)
10. [Security & Compliance](#10-security--compliance)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Timeline & Milestones](#12-timeline--milestones)
13. [Risk Register](#13-risk-register)

---

## 1. Project Overview

### What It Is
A responsive web application that aggregates live sports streams and presents them in a TV-like interface with:
- Real-time match schedules
- Category-based browsing (Football, Cricket, UFC, etc.)
- Embedded live video player
- Live viewer chat & reactions
- User accounts with watchlists and preferences

### Target Users
- Sports fans who want a single place to watch multiple live matches
- Community leagues organizing their own tournaments
- Small broadcasters who need an embeddable streaming frontend

---

## 2. Goals & Non-Goals

### Goals
| # | Goal | Success Metric |
|---|------|---------------|
| 1 | Stream live video with < 10s latency | 95% of streams under threshold |
| 2 | Support 500 concurrent viewers per stream | No playback failures at load |
| 3 | Responsive on mobile, tablet, desktop | Lighthouse performance ≥ 80 |
| 4 | Intuitive match discovery & schedule | < 3 clicks to start watching |
| 5 | Real-time viewer engagement via chat | Chat messages < 2s delivery |

### Non-Goals (V1)
- User-generated content uploading (only live RTMP push)
- VOD / recording library
- Native mobile apps (PWA covers this)
- Payment / subscription system (can be added later)
- Multi-language UI

---

## 3. Tech Stack

| Layer | Choice | Version | Reason |
|-------|--------|---------|--------|
| **Frontend** | Next.js | 14+ (App Router) | SSR, routing, static site generation |
| **Backend** | Python FastAPI | 0.110+ | High-performance async API, auto OpenAPI docs |
| **Language** | TypeScript (frontend) + Python 3.12 (backend) | — | Type safety on both sides |
| **UI** | Tailwind CSS + shadcn/ui | Latest | Rapid, consistent component design |
| **Video Player** | HLS.js | 1.x | Open-source HLS player, no license |
| **Database** | PostgreSQL | 15+ | Relational, ACID |
| **ORM** | SQLAlchemy 2.0 + Alembic | Latest | Async ORM, migration tooling |
| **Auth** | JWT (python-jose) + Passlib | — | Token-based auth, Bearer headers |
| **Real-time** | FastAPI WebSocket + Redis Pub/Sub | — | Live chat, viewer count, reactions |
| **Streaming Server** | MediaMTX | Latest | Lightweight RTMP → HLS converter |
| **Caching** | Redis (Upstash) | Cloud | Rate limiting, chat history, pub/sub |
| **Email** | Resend | — | Transactional emails (notifications) |
| **Hosting (Frontend)** | Vercel | — | Zero-config Next.js deploy |
| **Hosting (Backend)** | DigitalOcean / AWS / Render | — | Persistent server for FastAPI + WebSockets |
| **Hosting (Streaming)** | DigitalOcean / AWS EC2 | — | Persistent server required for RTMP |
| **CDN** | Cloudflare R2 + Public CDN | — | Cheap storage, fast HLS delivery |

---

## 4. System Architecture

```
                              ┌────────────────────────────────────────────────┐
                              │                  USER BROWSERS                  │
                              │  (Desktop / Mobile / Tablet / Smart TV)        │
                              └────────────┬───────────────┬───────────────────┘
                                           │               │
                              HTTPS (Web App)     WebSocket (Chat)
                                           │               │
                              ┌────────────────────▼──────────────────────────────┐
                              │                Vercel (Frontend)                  │
                              │  ┌───────────────────────────────────────────┐  │
                              │  │  Next.js Application                      │  │
                              │  │  ┌─────────┬──────────────────────────┐    │  │
                              │  │  │ Pages / │ REST API calls             │    │  │
                              │  │  │ App Router│ (fetch → FastAPI)        │    │  │
                              │  │  └─────────┴──────────────────────────┘    │  │
                              │  └───────────────────────────────────────────┘  │
                              └───────────────────────┬───────────────────────┘
                                                      │ HTTPS (JSON API)
                              ┌───────────────────────▼───────────────────────┐
                              │           FastAPI Backend Server              │
                              │  (DigitalOcean / AWS / Render)                 │
                              │  ┌───────────────┬──────────────────────────┐  │
                              │  │ REST API      │ WebSocket (Chat)         │  │
                              │  │ (Users,       │ (FastAPI WS + Redis      │  │
                              │  │ Matches,      │  Pub/Sub for real-time) │  │
                              │  │ Channels,     │                          │  │
                              │  │ Auth (JWT)    │                          │  │
                              │  └───────┬───────┴──────────────────────────┘  │
                              └──────────────┬──────────────────────────────────┘
                                             │
                              ┌──────────────▼──────────────────────────────────┐
                              │                PostgreSQL                        │
                              │         (SQLAlchemy 2.0 + Alembic)               │
                              │  Users | Channels | Matches | StreamConfigs     │
                              └──────────────┬──────────────────────────────────┘
                                             │
                              ┌──────────────▼──────────────────────────────────┐
                              │                  Redis                           │
                              │  Chat Messages | Rate Limits | Pub/Sub | Sessions│
                              └─────────────────────────────────────────────────┘
                                                 │
                              ┌────────────────────▼──────────────────────────────┐
                              │          HLS Manifest & Segments (Cloudflare R2)  │
                              └────────────────────┬──────────────────────────────┘
                                                 ▲ HLS
                              ┌────────────────────┘
                              │
              ┌───────────────▼──────────────────────────────────────────────────┐
              │                     Streaming Server                              │
              │              (DigitalOcean / AWS EC2)                             │
              │  ┌──────────────┐    ┌───────────────┐    ┌──────────────────┐   │
              │  │  MediaMTX     │    │  RTMP Ingest  │    │  HLS Distributor  │   │
              │  │  (Port 8888)  │◀───│  (Port 1935)  │◀───│  (Push to R2 CDN) │   │
              │  └──────────────┘    └───────────────┘    └──────────────────┘   │
              └──────────────────────────────────────────────────────────────────┘
                              ▲
              ┌───────────────┘ RTMP Push
              │
  ┌───────────┴──────────┐
  │    Encoder Source     │
  │  (OBS Studio /        │
  │   FFmpeg / Hardware)  │
  └──────────────────────┘
```

---

## 5. Database Schema

### SQLAlchemy Models (Python)

```python
# backend/models.py

from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float,
    ForeignKey, Enum, Text, Index
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    BROADCASTER = "BROADCASTER"


class MatchStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    LIVE = "LIVE"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"


class SportCategory(str, enum.Enum):
    FOOTBALL = "FOOTBALL"
    CRICKET = "CRICKET"
    UFC = "UFC"
    BASKETBALL = "BASKETBALL"
    TENNIS = "TENNIS"
    OTHER = "OTHER"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    email_verified = Column(DateTime, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    watch_history = relationship("WatchHistory", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Channel(Base):
    __tablename__ = "channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    category = Column(Enum(SportCategory), nullable=False)
    is_live = Column(Boolean, default=False)
    rtmp_stream_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    matches = relationship("Match", back_populates="channel")


class Match(Base):
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    sport_category = Column(Enum(SportCategory), nullable=False)
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    team_a = Column(String, nullable=True)
    team_b = Column(String, nullable=True)
    league = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    rtmp_stream_key = Column(String, nullable=True)
    hls_url = Column(String, nullable=True)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("channels.id"), nullable=True)
    viewers = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    channel = relationship("Channel", back_populates="matches")
    favorites = relationship("Favorite", back_populates="match", cascade="all, delete-orphan")
    watch_history = relationship("WatchHistory", back_populates="match", cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="favorites")
    match = relationship("Match", back_populates="favorites")

    __table_args__ = (
        # Unique constraint on (user_id, match_id)
    )


class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    watched_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float, default=0.0)  # percentage watched

    user = relationship("User", back_populates="watch_history")
    match = relationship("Match", back_populates="watch_history")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    username = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
    match = relationship("Match", backref="chat_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## 6. API Design

### Authentication Flow

All protected endpoints use **JWT Bearer tokens** in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

Token lifecycle:
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (stored in HTTP-only cookie)
- Tokens issued on `/api/auth/login`, refreshed on `/api/auth/refresh`

### REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Public** |
| `GET` | `/api/v1/matches` | List matches (query: sport, status, date) | No |
| `GET` | `/api/v1/matches/{id}` | Match details + HLS URL | No |
| `GET` | `/api/v1/channels` | List channels by category | No |
| `GET` | `/api/v1/channels/live` | Currently live channels | No |
| **Auth** |
| `POST` | `/api/v1/auth/register` | Register user (email + password) | No |
| `POST` | `/api/v1/auth/login` | Login → returns access + refresh tokens | No |
| `POST` | `/api/v1/auth/refresh` | Refresh access token from refresh token | No |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token | Yes |
| `GET` | `/api/v1/auth/me` | Get current user profile | Yes |
| **User** |
| `GET` | `/api/v1/users/me` | Get current user | Yes |
| `PUT` | `/api/v1/users/me` | Update profile | Yes |
| `GET` | `/api/v1/users/me/favorites` | Favorite matches | Yes |
| `POST` | `/api/v1/users/me/favorites/{match_id}` | Add favorite | Yes |
| `DELETE` | `/api/v1/users/me/favorites/{match_id}` | Remove favorite | Yes |
| `GET` | `/api/v1/users/me/history` | Watch history | Yes |
| **Chat (WebSocket)** |
| `WS` | `/api/v1/chat/{match_id}` | Join match chat room (query: token) | Optional |
| **Admin** |
| `POST` | `/api/v1/admin/matches` | Create match | Admin |
| `PUT` | `/api/v1/admin/matches/{id}` | Update match (status, HLS) | Admin |
| `POST` | `/api/v1/admin/streams/generate-key` | Generate RTMP key | Admin |
| `GET` | `/api/v1/admin/streams/status` | Stream health for all matches | Admin |

### Request/Response Examples

**GET `/api/v1/matches?status=LIVE&category=FOOTBALL`**
```json
{
  "data": [
    {
      "id": "abc123",
      "title": "Real Madrid vs Barcelona",
      "sport_category": "FOOTBALL",
      "status": "LIVE",
      "team_a": "Real Madrid",
      "team_b": "Barcelona",
      "league": "La Liga",
      "start_time": "2026-07-01T18:00:00Z",
      "hls_url": "https://cdn.example.com/streams/abc123/playlist.m3u8",
      "channel": { "name": "ESPN Live", "slug": "espn-live" },
      "viewers": 12453
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```

**POST `/api/v1/auth/login`**
```json
{ "email": "user@example.com", "password": "secret123" }
```
Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**POST `/api/v1/users/me/favorites/{match_id}`**
```json
{ "success": true, "match_id": "abc123" }
```

---

## 7. Frontend Architecture

### Page Structure

```
/app
  /page.tsx                  → Homepage (live matches, upcoming)
  /matches
    /page.tsx                → Match listings (filters, search)
    /[id]/page.tsx           → Individual match + player
  /channels
    /page.tsx                → Channel listings
    /[slug]/page.tsx         → Channel page with scheduled matches
  /user
    /login/page.tsx          → Login
    /register/page.tsx       → Registration
    /profile/page.tsx        → User profile
    /favorites/page.tsx      → Favorite matches
    /history/page.tsx        → Watch history
  /admin
    /page.tsx                → Admin dashboard
    /matches/page.tsx        → Manage matches
    /streams/page.tsx        → Stream health monitor
  /api                       → Next.js API routes removed — all calls go to FastAPI backend

/components
  /video
    HLSPlayer.tsx            → HLS.js video player wrapper
    LiveBadge.tsx            → Pulsing "LIVE" indicator
  /chat
    ChatRoom.tsx             → Socket.io chat for a match
    ChatInput.tsx
  /matches
    MatchCard.tsx            → Match listing card
    MatchSchedule.tsx        → Upcoming schedule timeline
    MatchFilter.tsx          → Category + date filters
  /channels
    ChannelCard.tsx
    ChannelGrid.tsx
  /layout
    Header.tsx               → Nav bar with live indicator
    Footer.tsx
    Sidebar.tsx              → Sport category navigation
  /ui                        → shadcn/ui components

/lib
  hls.ts                     → HLS player utilities
  socket.ts                  → WebSocket client setup (or Socket.io client)
  api.ts                     → API client (fetch wrapper for FastAPI)
  auth-client.ts             → JWT token storage, interceptor for Bearer headers

/types
  index.ts                   → Shared TypeScript types
```

### HLS Player Component

```tsx
// /components/video/HLSPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function HLSPlayer({ src, autoPlay = true, muted = false }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls.levels[data.level];
        if (level?.details?.live) {
          setIsLive(true);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Stream unavailable. Please try again later.");
          hls.destroy();
        }
      });

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        if (autoPlay) video.play().catch(() => {});
        setIsLive(true);
      });
    }
  }, [src, autoPlay]);

  if (error) return <div className="p-4 text-red-400">{error}</div>;

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        muted={muted}
        playsInline
      />
      {isLive && (
        <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
          LIVE
        </span>
      )}
    </div>
  );
}
```

---

## 8. Streaming Pipeline

### How a Live Match Gets from OBS to Viewer

```
Step 1: Admin/Broadcaster opens OBS Studio
Step 2: OBS pushes video via RTMP to Streaming Server
         rtmp://stream.yourdomain.com:1935/live/[STREAM_KEY]
Step 3: MediaMTX receives RTMP, converts to HLS in real-time
Step 4: HLS segments (.ts) + playlist (.m3u8) stored on server
Step 5: Nginx or Cloudflare Workers serve .m3u8 to viewers
Step 6: Viewer's browser loads HLS.js → fetches playlist → plays segments
```

### Streaming Server Setup (Docker)

```yaml
# docker-compose.yml for streaming server
services:
  mediamtx:
    image: bluenviron/mediamtx:latest
    ports:
      - "1935:1935"   # RTMP ingest
      - "8888:8888"   # HLS serving
      - "8889:8889/tcp"  # WebRTC
      - "8189:8189/udp"  # WebRTC
    volumes:
      - ./mediamtx.yml:/mediamtx.yml
    restart: unless-stopped

  # Optional: reverse proxy for HTTPS HLS
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - mediamtx
    restart: unless-stopped
```

```yaml
# mediamtx.yml
rtmp:
  address: ":1935"

hls:
  address: ":8888"
  protocol: hls
  directory: streams
  segmentDuration: 3s
  inductionNameTemplate: "{path}{hostname}/{index}"

serverKey: "your-secure-stream-key-here"
```

### Admin Stream Management

```
Admin Panel
    │
    ├─▶ Generate RTMP Stream Key (random UUID)
    │
    ├─▶ Associate Key → Match ID
    │
    ├─▶ On Match Start:
    │     1. Set match.status = "LIVE"
    │     2. Set hlsUrl = "https://cdn.example.com/streams/{matchId}/playlist.m3u8"
    │     3. Broadcast WebSocket event to all viewers
    │
    └─▶ On Match End:
      1. Set match.status = "FINISHED"
      2. Stop RTMP stream
      3. Optional: save recording to VOD
```

### OBS Configuration (for Broadcasters)

```
Settings → Stream
  Service: Custom
  URL:      rtmp://stream.yourdomain.com:1935/live
  Stream Key: [generated key from admin panel]

Settings → Output
  Mode: Advanced
  Video Bitrate: 4500 kbps (HD) / 2500 kbps (SD)
  Encoder: x264 or hardware (NVENC / QSV)
  Keyframe Interval: 2s
  Preset: veryfast
```

---

## 9. Implementation Phases

### Phase 1 — Foundation (Weeks 1-2)

**Objective:** Project scaffolding, database, basic video playback.

| # | Task | Details |
|---|------|---------|
| 1.1 | Initialize Next.js project | `npx create-next-app@latest` with TypeScript, Tailwind, App Router |
| 1.2 | Initialize FastAPI backend | Create project structure with `uvicorn`, `sqlalchemy`, `pydantic`, `alembic` |
| 1.3 | Set up PostgreSQL + SQLAlchemy | Create `models.py`, async engine, Alembic init, first migration |
| 1.4 | Authentication (JWT) | Install `python-jose`, `passlib[bcrypt]`; implement login/register with access + refresh tokens |
| 1.5 | Layout & Navigation | Header, Sidebar, Footer, responsive grid layout (frontend) |
| 1.6 | HLS Player Component | Integrate `hls.js` with error handling, live badge, quality selector |
| 1.7 | Deploy streaming server | Docker setup MediaMTX on DigitalOcean/AWS, configure HTTPS with certbot |
| 1.8 | Basic stream test | Push from OBS, play back in HLS player, connect frontend to FastAPI |

**Deliverable:** A working video player that can play an RTMP→HLS stream.

---

### Phase 2 — Core Features (Weeks 3-4)

**Objective:** Match scheduling, browsing, live status.

| # | Task | Details |
|---|------|---------|
| 2.1 | Match CRUD (FastAPI) | Admin endpoints to create, edit, schedule matches with team names, league, category |
| 2.2 | Match Listing Page | Filter by sport, status (LIVE/SCHEDULED), date range |
| 2.3 | Match Detail Page | Title, teams, HLS player, schedule info, "Remind Me" button |
| 2.4 | Channel System | Create channels (ESPN, UFC TV, etc.), link matches to channels |
| 2.5 | Category Filters | Football, Cricket, UFC tabs on homepage |
| 2.6 | Live Status Logic | Background job (Cron on Vercel / cron job on server) that checks match startTime/endTime and updates status |
| 2.7 | Responsive Design | Mobile-first layout, collapsible sidebar, touch-friendly player |

**Deliverable:** Users can browse matches by sport, see which ones are live, and watch them.

---

### Phase 3 — Real-Time Chat & Engagement (Weeks 5-6)

**Objective:** Viewer interaction during live matches.

| # | Task | Details |
|---|------|---------|
| 3.1 | FastAPI WebSocket | Set up WebSocket endpoint (`/api/v1/chat/{match_id}`) with FastAPI + Redis Pub/Sub |
| 3.2 | Chat Room Component | Real-time message list, input box, send on Enter |
| 3.3 | Message Persistence | Save messages to PostgreSQL (matchId index), load last 50 on join |
| 3.4 | Viewer Count | Track connected sockets per match room, display as viewer count |
| 3.5 | Reactions | Emoji reactions (🔥, ⚽, 👏) with animated overlay on video |
| 3.6 | Rate Limiting | Redis-based rate limiter on chat messages (max 10/sec per user) |
| 3.7 | Moderation | Admin flag/delete messages, keyword blocklist, user mute |

**Deliverable:** Live chat with messages, viewer count, and emoji reactions.

---

### Phase 4 — User Features (Weeks 7-8)

**Objective:** Personalization, account features.

| # | Task | Details |
|---|------|---------|
| 4.1 | User Profile | Edit name, avatar, preferences (default sport categories) |
| 4.2 | Favorites System | Add/remove favorite matches, favorites page |
| 4.3 | Watch History | Track match views with progress %, history page with "Continue Watching" |
| 4.4 | Match Reminders | Email notification 15 min before scheduled match (Resend API) |
| 4.5 | Push Notifications | Browser push notifications for "Match Started" via Web Push API |
| 4.6 | Sports Preferences | User selects favorite sports → homepage prioritizes those matches |

**Deliverable:** Logged-in users have personalized experience.

---

### Phase 5 — Admin & Operations (Weeks 9-10)

**Objective:** Stream management dashboard and monitoring.

| # | Task | Details |
|---|------|---------|
| 5.1 | Admin Dashboard (API) | Endpoints for overview: total matches, live streams, active viewers |
| 5.2 | Stream Health Monitor | Check RTMP connection status, HLS availability per match |
| 5.3 | Stream Key Management | Generate, rotate, revoke RTMP keys per channel/match |
| 5.4 | Match Status Control | Manual override for START/END streaming |
| 5.5 | Analytics Page | Total views per match, peak concurrent viewers, popular channels |
| 5.6 | Channel Management | Create/edit channels, assign categories, set logos |
| 5.7 | Chat Moderation Panel | View/delete messages, mute users, view abuse reports |

**Deliverable:** Full admin panel for managing content and streams.

---

### Phase 6 — Polish & Scale (Weeks 11-12)

**Objective:** Performance, reliability, and production readiness.

| # | Task | Details |
|---|------|---------|
| 6.1 | CDN Integration | Cloudflare R2 for HLS segments, public CDN for .m3u8 |
| 6.2 | Video Quality Selection | Auto + manual bitrate switching (HLS.js levels) |
| 6.3 | PWA Setup | `next-pwa` for installable web app, offline manifest |
| 6.4 | Performance | Lazy load player, optimize images, code splitting, cache API responses |
| 6.5 | Error Boundaries | Graceful fallbacks for player errors, network drops |
| 6.6 | Accessibility | ARIA labels, keyboard navigation, color contrast check |
| 6.7 | Load Testing | k6 or Playwright load test: 500 concurrent viewers per stream |
| 6.8 | Monitoring | Sentry for frontend errors, uptime monitoring for streaming server |
| 6.9 | Documentation | README, streaming server setup guide, admin user guide |

**Deliverable:** Production-ready platform with monitoring and documentation.

---

## 10. Security & Compliance

### Security Measures

| Area | Implementation |
|------|---------------|
| **Authentication** | JWT (python-jose) with bcrypt password hashing; access token 15m, refresh token 7d in httpOnly cookie |
| **Authorization** | Role-based access control (USER / ADMIN / BROADCASTER) via FastAPI dependency injection |
| **Stream Key Protection** | RTMP keys stored encrypted in DB, never exposed to frontend except admin |
| **HLS URL Obfuscation** | Token-protected HLS URLs (signed tokens via Redis) to prevent unauthorized sharing |
| **Rate Limiting** | Redis-based per-IP and per-user rate limits on all API endpoints |
| **Input Validation** | Pydantic v2 models on all FastAPI request/response schemas |
| **CSP Headers** | Middleware in FastAPI to set Content-Security-Policy |
| **XSS Prevention** | React's built-in escaping + DOMPurify for chat messages |
| **CSRF Protection** | SameSite=Strict cookie policy + double-submit token for refresh endpoint |
| **Secrets Management** | `.env` files, never committed; use Vercel env vars / DigitalOcean secrets |

### Legal & Content Compliance

> ⚠️ **CRITICAL**: This platform must only stream content with proper broadcasting rights.

- ✅ **Allowed:** Public broadcasts with permission, own events, licensed content, open tournaments
- ❌ **Not Allowed:** Re-streaming copyrighted matches without license

**Recommended:**
- Require broadcasters to confirm content ownership before publishing
- Implement DMCA takedown process (report button on every match page)
- Log all stream origins for audit trail
- Display "Streamed with permission" badge on licensed content

---

## 11. Deployment & Infrastructure

### Environment Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                                            │
├──────────────────────┬──────────────────────────┬────────────────────────────┤
│   Vercel (Frontend)  │   FastAPI Backend Server  │   DigitalOcean (Streaming) │
│                      │   (Render / AWS / DO)     │                            │
│  ┌────────────────┐  │  ┌────────────────────┐  │  ┌──────────────────────┐  │
│  │  Next.js App   │  │  │  REST API          │  │  │  MediaMTX + Nginx    │  │
│  │  Static Pages  │  │  │  WebSocket (Chat)  │  │  │  HLS Segments → R2   │  │
│  │  (SSR + SSG)   │  │  │  JWT Auth          │  │  └──────────────────────┘  │
│  └───────┬────────┘  │  │  Auth (JWT)        │  │                            │
│          │           │  └───────┬────────────┘  │  ┌──────────────────────┐  │
│          │           │          │               │  │  Cloudflare R2       │  │
│          │           │  ┌───────▼────────────┐  │  │  (HLS storage)       │  │
│  ┌───────▼────────┐  │  │  PostgreSQL        │  │  └──────────────────────┘  │
│  │  PostgreSQL    │  │  │  (Neon / Supabase) │  │                            │
│  │  (Neon /       │  │  └────────────────────┘  │  ┌──────────────────────┐  │
│  │  Supabase)     │  │                           │  │  Cloudflare CDN      │  │
│  └────────────────┘  │  ┌────────────────────┐  │  │  (HLS manifest)      │  │
│  ┌────────────────┐  │  │  Redis             │  │  └──────────────────────┘  │
│  │  Redis         │  │  │  (Upstash)         │  │                            │
│  │  (Upstash)     │  │  │  Chat Pub/Sub     │  │                            │
│  └────────────────┘  │  │  Rate Limits       │  │                            │
│                      │  └────────────────────┘  │                            │
│                      │                           │                            │
└──────────────────────┴───────────────────────────┴────────────────────────────┘
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/livetv

# JWT Auth (Backend)
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Frontend
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Streaming Server
RTMP_SERVER_URL=rtmp://stream.yourdomain.com:1935/live
HLS_SERVER_URL=https://stream.yourdomain.com:8888

# CDN
CLOUDFLARE_R2_ENDPOINT=https://...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...

# Redis
UPSTASH_REDIS_URL=https://...

# Email
RESEND_API_KEY=...

# Monitoring
SENTRY_DSN=...
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (simplified)
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install (Frontend)
        run: npm ci
        working-directory: ./frontend

      - name: Type Check
        run: npx tsc --noEmit
        working-directory: ./frontend

      - name: Lint
        run: npm run lint
        working-directory: ./frontend

      - name: Test
        run: npm test
        working-directory: ./frontend

      - name: Build
        run: npm run build
        working-directory: ./frontend

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install (Backend)
        run: pip install -r requirements.txt
        working-directory: ./backend

      - name: Lint (ruff)
        run: ruff check .
        working-directory: ./backend

      - name: Type Check (mypy)
        run: mypy .
        working-directory: ./backend

      - name: Test
        run: pytest
        working-directory: ./backend

      - name: Alembic Migrate
        run: alembic upgrade head
        working-directory: ./backend
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to Render / AWS
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## 12. Timeline & Milestones

```
Week 1-2   ━━━━━━━━━━━━━━━━━━━  Phase 1: Foundation
                          ━━━━━━━━━━━━━  Phase 2: Core Features
                                        ━━━━━━━━━━━━━━━━━━  Phase 3: Chat & Engagement
                                                       ━━━━━━━━━━━━━━━━━━━  Phase 4: User Features
                                                                         ━━━━━━━━━━━━━━━━━━━━  Phase 5: Admin & Ops
                                                                                           ━━━━━━━━━━━━━━━━━━━━━━━  Phase 6: Polish & Scale

Milestones:
  M1 (End of W2)   Working video player with RTMP→HLS pipeline
  M2 (End of W4)   Browseable match schedule with live streams
  M3 (End of W6)   Real-time chat + viewer engagement
  M4 (End of W8)   User accounts with favorites & reminders
  M5 (End of W10)  Full admin panel + stream monitoring
  M6 (End of W12)  Production-ready with CDN, PWA, monitoring
```

---

## 13. Risk Register

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|-----------|------------|
| 1 | Copyright infringement claims | **Critical** | Medium | Only stream licensed content; DMCA process; content verification |
| 2 | Streaming server goes down during live match | **High** | Medium | Health checks, auto-restart, failover server, CDN cache segments |
| 3 | High bandwidth costs | **High** | High | Cloudflare R2 (cheap storage), CDN caching, bitrate adaptive streaming |
| 4 | Player fails on mobile Safari | **Medium** | Low | Native HLS fallback built in (Safari supports HLS natively) |
| 5 | Chat spam / abuse | **Medium** | High | Rate limiting, moderation tools, keyword filtering |
| 6 | HLS URL sharing / piracy | **Medium** | Medium | Token-protected URLs, referer checks, short-lived tokens |
| 7 | Vercel serverless timeout for Socket.io | **Low** | Medium | Use Vercel WebSockets (preview) or deploy Socket.io on separate server |
| 8 | Database connection limits at scale | **Medium** | Low | Connection pooling (Prisma), Redis caching for hot data |

---

## Appendix A: Project Commands

### Frontend (Next.js)
```bash
# Initialize frontend
cd frontend
npx create-next-app@latest . --typescript --tailwind --app

# Dependencies
npm install hls.js socket.io-client axios
npm install -D @types/node

# Development
npm run dev
```

### Backend (FastAPI)
```bash
# Initialize backend
mkdir backend && cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# Dependencies
pip install fastapi uvicorn[standard] sqlalchemy[asyncio] aiosqlite alembic
pip install python-jose[cryptography] passlib[bcrypt] python-multipart pydantic-settings
pip install redis async-redis aiohttp
pip install ruff mypy pytest httpx

# Database
alembic init -t async alembic
alembic revision --autogenerate -m "initial"
alembic upgrade head

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Lint + Type check
ruff check .
mypy .

# Tests
pytest
```

### Project Root
```bash
# Directory structure
live-tv/
├── frontend/          # Next.js app (Vercel)
├── backend/           # FastAPI app (DigitalOcean / Render)
├── streaming-server/  # MediaMTX Docker setup
└── projectPlan.md

# Full development
# Terminal 1: Frontend
cd frontend && npm run dev          # http://localhost:3000

# Terminal 2: Backend
cd backend && uvicorn app.main:app --reload   # http://localhost:8000
# Auto docs: http://localhost:8000/docs

# Terminal 3: Streaming server
cd streaming-server && docker compose up -d
```

## Appendix B: Estimated Costs (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Hobby → Pro | $0 → $20 |
| FastAPI Backend | Render / DigitalOcean Basic | $5-7 |
| PostgreSQL (Neon) | Free → Pro | $0 → $18 |
| Redis (Upstash) | Free → Pro | $0 → $15 |
| DigitalOcean (Streaming) | Basic Droplet | $18 |
| Cloudflare R2 (Storage) | Pay as you go | ~$5-20 (based on usage) |
| Cloudflare CDN | Free | $0 |
| Resend (Email) | Free tier | $0 (up to 3k emails) |
| **Total** | | **~$28-$60/month** |

---

*Document version: 2.0 (FastAPI Backend)*
*Last updated: 2026-06-30*
