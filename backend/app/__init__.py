from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, matches, channels, users, chat, admin
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="LiveRoar API",
    description="Live sports streaming platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(matches.router, prefix="/api/v1/matches", tags=["matches"])
app.include_router(channels.router, prefix="/api/v1/channels", tags=["channels"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"], dependencies=[])

@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "liveroar-backend"}
