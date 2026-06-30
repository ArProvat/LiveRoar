# LiveRoar — Watch. Feel. Roar.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker)](https://docker.com)

A production-grade live sports streaming platform for watching football, cricket, UFC, and other sports matches in real time.

## 🏗 Architecture

```
┌──────────────┐     HTTPS      ┌──────────────────┐     DB/Cache   ┌──────────────────┐
│  Next.js     │ ────────────▶  │  FastAPI         │ ◀───────────▶  │  PostgreSQL      │
│  (Vercel)    │                │  Backend         │                 │  (Neon/Supabase) │
│  Frontend    │                │  (DO/Render)     │                 │                  │
└──────────────┘                └────────┬─────────┘                 └──────────────────┘
                                         │
                             RTMP / HLS   │
                                         ▼
                            ┌──────────────────────────┐
                            │  MediaMTX Streaming      │
                            │  Server (DigitalOcean)   │
                            └──────────────────────────┘
```

## 📁 Project Structure

```
liveroar/
├── frontend/                  # Next.js 14 frontend (Vercel)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── matches/      # Match listing & detail pages
│   │   │   ├── channels/     # Channel browsing
│   │   │   ├── user/         # Auth pages (login/register)
│   │   │   ├── layout.tsx    # Root layout
│   │   │   ├── page.tsx      # Homepage → redirects to /matches
│   │   │   └── globals.css   # Tailwind + global styles
│   │   ├── components/
│   │   │   ├── layout/       # Header, Footer
│   │   │   └── video/        # HLSPlayer component
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios instance with JWT interceptors
│   │   │   └── config.ts     # API/WS URL config
│   │   └── middleware.ts     # Auth protection middleware
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                   # FastAPI backend (DigitalOcean/Render)
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── config.py         # Pydantic settings
│   │   ├── database.py       # Async SQLAlchemy engine/session
│   │   ├── core/
│   │   │   ├── models.py     # SQLAlchemy ORM models
│   │   │   ├── auth.py       # JWT auth dependencies
│   │   │   ├── security.py   # Password hashing + JWT utils
│   │   │   └── logging.py    # Structured logging config
│   │   ├── api/
│   │   │   ├── auth.py       # Register, login, refresh
│   │   │   ├── matches.py    # Match CRUD + listing
│   │   │   ├── channels.py   # Channel listing
│   │   │   ├── users.py      # User profile, favorites, history
│   │   │   ├── chat.py       # WebSocket chat
│   │   │   └── admin.py      # Admin dashboard + moderation
│   │   └── schemas/          # Pydantic v2 request/response models
│   ├── tests/
│   │   └── test_api.py       # API integration tests
│   ├── alembic/              # DB migration management
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   └── requirements-dev.txt
├── streaming-server/          # MediaMTX streaming server
│   └── mediamtx.yml          # RTMP→HLS config
├── docker-compose.yml         # Full local dev environment
├── .env.example              # Environment variables template
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites

- **Docker** + **Docker Compose** (easiest way)
- Or: Node.js 20+, Python 3.12+, PostgreSQL 16, Redis 7

### Option 1: Docker (Recommended)

```bash
# 1. Clone and setup
git clone https://github.com/ArProvat/LiveRoar.git
cd LiveRoar
cp .env.example .env
# Edit .env with your config

# 2. Start all services
docker compose up -d

# 3. Initialize database
docker compose exec backend alembic upgrade head

# 4. Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/api/docs
# Streaming: rtmp://localhost:1935/live
```

### Option 2: Local Development

```bash
# 1. Start infrastructure
docker compose up -d postgres redis mediamtx

# 2. Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt -r requirements-dev.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/liveroar
alembic upgrade head
uvicorn app.main:app --reload

# 3. Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Pushing a Live Stream (for testing)

```bash
# In OBS Studio:
# Service: Custom
# URL: rtmp://localhost:1935/live
# Stream Key: test-stream
```

## 🔑 Key Features

- **Real-time HLS streaming** with low-latency mode
- **JWT authentication** with access/refresh token flow
- **WebSocket chat** for live viewer engagement
- **RESTful API** with OpenAPI docs (`/api/docs`)
- **Role-based access** (USER, ADMIN, BROADCASTER)
- **Database migrations** via Alembic
- **Production Docker** configs for all services
- **Automated tests** with pytest + httpx

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login → JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET`  | `/api/v1/matches` | List matches (filter by sport, status) |
| `GET`  | `/api/v1/matches/{id}` | Match details |
| `GET`  | `/api/v1/channels` | List channels |
| `WS`   | `/api/v1/chat/{match_id}` | Join live chat |
| `GET`  | `/api/v1/health` | Health check |

Full interactive docs at: `http://localhost:8000/api/docs`

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

## 📄 License

Private — LiveRoar Project
