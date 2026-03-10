"""GeoJSON data endpoint with viewport filtering."""
from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import ORJSONResponse

from app.api.deps import DataServiceDep
from app.core.cache import get_cache
from app.core.config import settings
from app.models import GeoJSONResponse, ViewportFilter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/geojson", tags=["geojson"])


@router.get("/list/all", response_class=ORJSONResponse)
async def list_all_geojson(data_service: DataServiceDep) -> dict[str, Any]:
    """List all available GeoJSON areas."""
    cache = get_cache()

    if not cache.is_loaded():
        data_service.load_all_data()

    all_areas = cache.get_all_areas()

    return {
        "type": "FeatureCollectionList",
        "areas": [
            {
                "name": name,
                "feature_count": area.total,
            }
            for name, area in all_areas.items()
        ],
        "total": len(all_areas),
    }


@router.get("/{area_name:path}", response_class=ORJSONResponse)
async def get_geojson(
    area_name: str,
    data_service: DataServiceDep,
    minx: float | None = Query(None, description="Minimum longitude"),
    miny: float | None = Query(None, description="Minimum latitude"),
    maxx: float | None = Query(None, description="Maximum longitude"),
    maxy: float | None = Query(None, description="Maximum latitude"),
    zones: list[str] = Query(default_factory=list, description="Zone codes to filter"),
) -> GeoJSONResponse:
    """
    Get GeoJSON data for a specific area.

    Args:
        area_name: Name of the area (can be partial match)
        minx, miny, maxx, maxy: Viewport bounds for filtering
        zones: List of zone codes to filter

    Returns:
        GeoJSONResponse: Feature collection with filtered features
    """
    cache = get_cache()

    # Ensure data is loaded
    if not cache.is_loaded():
        logger.info("Data not loaded, loading now...")
        data_service.load_all_data()

    # Find matching area (fuzzy matching)
    matched_key = None
    all_areas = cache.get_all_areas()

    for key in all_areas.keys():
        if area_name.lower() in key.lower() or key.lower() in area_name.lower():
            matched_key = key
            break

    if not matched_key:
        raise HTTPException(
            status_code=404,
            detail=f"Area '{area_name}' not found. Available areas: {list(all_areas.keys())[:10]}...",
        )

    area_data = cache.get_area(matched_key)
    if not area_data:
        raise HTTPException(status_code=404, detail=f"Area data not found: {matched_key}")

    # Filter by viewport if bounds provided
    filtered_features: list[dict[str, Any]] = area_data.features

    if all(v is not None for v in [minx, miny, maxx, maxy]):
        # Use spatial index for fast query
        viewport = (minx, miny, maxx, maxy)
        filtered_features = list(area_data.spatial_index.query(viewport))
        logger.info(f"Viewport filter: {len(area_data.features)} -> {len(filtered_features)} features")
    else:
        # Limit features if no viewport filter
        limit = min(settings.DEFAULT_FEATURE_LIMIT, len(area_data.features))
        filtered_features = area_data.features[:limit]
        logger.info(f"No viewport filter, returning first {len(filtered_features)} features")

    # Apply zone filter if provided
    if zones:
        zone_set = set(zones)
        filtered_features = [
            f for f in filtered_features
            if f.get("properties", {}).get("KODZON") in zone_set
        ]
        logger.info(f"Zone filter: {len(filtered_features)} features remaining")

    return GeoJSONResponse(
        type="FeatureCollection",
        features=filtered_features,
        returned=len(filtered_features),
        total=area_data.total,
    )
