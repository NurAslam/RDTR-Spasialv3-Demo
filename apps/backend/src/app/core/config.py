
"""Application configuration using Pydantic Settings."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Literal, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _get_base_dir() -> Path:
    """Get base directory."""
    # Try env var first
    if "BASE_DIR" in os.environ:
        return Path(os.environ["BASE_DIR"])
    # From apps/backend/src/app/core/config.py, go up 5 levels to reach root
    # core -> app -> src -> backend -> apps -> root
    return Path(__file__).resolve().parents[5]


def _get_data_dir() -> Path:
    """Get data directory by checking possible locations."""
    base = _get_base_dir()
    possible_locations = [
        base / "packages" / "output",                 # Monorepo packages/output
        base / "packages" / "data",                   # Monorepo packages/data
        base.parent / "RDTR-Spasial-Rev2" / "output",  # Parent folder
        base / "RDTR-Spasial-Rev2" / "output",         # Same level
        Path("/app/data"),                            # Docker
    ]
    for loc in possible_locations:
        if loc.exists():
            return loc
    # Default to packages/output
    return base / "packages" / "output"


def _get_cache_dir() -> Path:
    """Get cache directory."""
    import tempfile
    # Use temp directory for cache to avoid permission issues
    return Path(tempfile.gettempdir()) / "rdtr_cache"


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "RDTR Spasial API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Web Spasial Interaktif untuk visualisasi RDTR"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ],
        description="Allowed CORS origins",
    )

    # Data Paths
    BASE_DIR: Path = Field(default_factory=_get_base_dir)
    DATA_DIR: Path = Field(default_factory=_get_data_dir)
    CACHE_DIR: Path = Field(default_factory=_get_cache_dir)

    # Redis (optional)
    REDIS_URL: Optional[str] = Field(
        default=None,
        description="Redis URL for caching (optional)",
    )

    # Pagination
    MAX_FEATURES_PER_REQUEST: int = Field(
        default=10000,
        description="Maximum features to return per request",
    )
    DEFAULT_FEATURE_LIMIT: int = Field(
        default=1000,
        description="Default feature limit when no viewport filter",
    )

    # Spatial Index
    SPATIAL_INDEX_CELL_SIZE: float = Field(
        default=0.01,
        description="Cell size for spatial index grid in degrees (~1km)",
    )

    # Logging
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # Frontend URL (for CORS)
    FRONTEND_URL: str = "http://localhost:3000"


from functools import lru_cache

@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
