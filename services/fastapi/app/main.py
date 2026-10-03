from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title="Operations Flow API",
        version="0.1.0",
        description="Organization-scoped Operations Flow business API.",
        servers=[{"url": "/api"}],
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Organization-ID"],
    )

    @application.get("/api/healthz", tags=["health"], summary="Health check")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    application.include_router(v1_router, prefix="/api")
    return application


app = create_app()