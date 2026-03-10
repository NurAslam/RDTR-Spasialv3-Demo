"""Cache management endpoints."""
from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import APIRouter

from app.core.cache import get_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cache", tags=["cache"])


@router.post("/clear")
async def clear_cache() -> dict[str, str]:
    """Clear all cached data."""
    cache = get_cache()
    cache.clear()
    logger.info("Cache cleared")
    return {"status": "success", "message": "Cache cleared"}


@router.get("/status")
async def get_cache_status() -> Dict[str, Any]:
    """Get cache status."""
    from app.services.data_service import get_data_service

    cache = get_cache()
    data_service = get_data_service()

    is_loaded = cache.is_loaded()
    summary = cache.get_summary()

    if not is_loaded:
        return {
            "loaded": False,
            "areas_count": 0,
            "total_features": 0,
        }

    return {
        "loaded": True,
        "areas_count": len(cache.get_all_areas()),
        "total_features": summary.total_features if summary else 0,
        "provinces": data_service.get_provinces(),
    }
