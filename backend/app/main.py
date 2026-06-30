"""LiveRoar Backend - Main Application Entry Point"""
import uvicorn

from app.config import settings


def main():
    uvicorn.run(
        "app:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
