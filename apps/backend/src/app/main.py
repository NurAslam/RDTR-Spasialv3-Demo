"""FastAPI application entry point."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.api.v1 import cache, geojson, health, locations, summary
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("=" * 60)
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    logger.info("=" * 60)

    # Pre-load data if data directory exists and SKIP_PRELOAD is False
    from app.services.data_service import get_data_service

    if not settings.SKIP_PRELOAD:
        try:
            data_service = get_data_service()
            summary = data_service.load_all_data()
            logger.info(f"✓ Pre-loaded {summary.total_features:,} features from {len(summary.areas)} areas")
        except Exception as e:
            logger.warning(f"Could not pre-load data: {e}")
            logger.info("Data will be loaded on first request")
    else:
        logger.info("⚡ SKIP_PRELOAD is enabled - data will be loaded on-demand (lower memory usage)")
        logger.info("Run without SKIP_PRELOAD env var to enable preloading")

    yield

    # Shutdown
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
cors_origins = settings.CORS_ORIGINS + [settings.FRONTEND_URL]
if settings.PRODUCTION_FRONTEND_URL:
    cors_origins.append(settings.PRODUCTION_FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
api_v1_prefix = "/api/v1"

app.include_router(health.router, prefix=api_v1_prefix)
app.include_router(summary.router, prefix=api_v1_prefix)
app.include_router(geojson.router, prefix=api_v1_prefix)
app.include_router(locations.router, prefix=api_v1_prefix)
app.include_router(cache.router, prefix=api_v1_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
