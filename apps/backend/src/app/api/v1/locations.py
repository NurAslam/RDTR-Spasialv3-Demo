"""Location endpoints (provinces, kabupatens, RDTR list)."""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.api.deps import DataServiceDep
from app.core.cache import get_cache
from app.models import Province, RDTRInfo, Regency

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/provinces")
async def get_provinces(data_service: DataServiceDep) -> list[str]:
    """
    Get list of all provinces.

    Returns: ["Kalimantan Barat", "Kalimantan Timur"]
    """
    cache = get_cache()

    if not cache.is_loaded():
        data_service.load_all_data()

    provinces = data_service.get_provinces()
    return provinces


@router.get("/kabupatens/{province}")
async def get_kabupatens(
    province: str,
    data_service: DataServiceDep,
) -> list[dict]:
    """
    Get list of kabupaten/kota for a province.

    Returns: [{"name": "Kab. Kubu Raya", "rdtr_count": 1}, ...]
    """
    cache = get_cache()

    if not cache.is_loaded():
        data_service.load_all_data()

    kabupatens = data_service.get_kabupatens(province)
    return kabupatens


@router.get("/rdtr/{province}/{kabupaten}")
async def get_rdtr_list(
    province: str,
    kabupaten: str,
    data_service: DataServiceDep,
) -> list[dict]:
    """
    Get list of RDTR for a province and kabupaten.

    Returns: [{"id": "...", "name": "...", "province": "...", "kabupaten": "...", "feature_count": 123}, ...]
    """
    cache = get_cache()

    if not cache.is_loaded():
        data_service.load_all_data()

    rdtr_list = data_service.get_rdtr_list(province, kabupaten)
    return rdtr_list
