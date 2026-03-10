"""Summary statistics endpoint."""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.api.deps import DataServiceDep
from app.core.cache import get_cache
from app.core.config import settings
from app.models import AreaInfo, SummaryResponse, ZoneInfo
from app.services.data_service import ZONE_COLORS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/", response_model=SummaryResponse)
async def get_summary(data_service: DataServiceDep) -> SummaryResponse:
    """
    Get summary statistics for all loaded RDTR data.

    Returns:
        SummaryResponse: Total features, areas, zones, and bounds
    """
    cache = get_cache()

    # Load data if not already loaded
    if not cache.is_loaded():
        logger.info("Data not loaded, loading now...")
        data_service.load_all_data()

    summary = cache.get_summary()
    if not summary:
        raise HTTPException(status_code=500, detail="Failed to load data")

    # Convert zones to dict with colors
    zones_with_colors = {}
    for zone_key, count in summary.zones.most_common(30):
        color = ZONE_COLORS.get(zone_key, ZONE_COLORS["default"])
        zones_with_colors[zone_key] = ZoneInfo(count=count, color=color)

    return SummaryResponse(
        total_features=summary.total_features,
        areas=[AreaInfo(**area) for area in summary.areas],
        zones=zones_with_colors,
        kecamatan=dict(summary.kecamatan.most_common(20)),
        sub_zones=dict(summary.sub_zones.most_common(15)),
        bounds=summary.bounds,
    )
