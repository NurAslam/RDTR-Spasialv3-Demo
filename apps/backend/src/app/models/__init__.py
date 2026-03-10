"""Pydantic models for request/response validation."""
from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str = "1.0.0"
    timestamp: str


class ZoneInfo(BaseModel):
    """Zone information."""

    count: int
    color: str


class AreaInfo(BaseModel):
    """Area information."""

    name: str
    features: int


class SummaryResponse(BaseModel):
    """Summary statistics response."""

    total_features: int
    areas: list[AreaInfo]
    zones: dict[str, ZoneInfo]
    kecamatan: dict[str, int]
    sub_zones: dict[str, int]
    bounds: list[float]


class GeoJSONGeometry(BaseModel):
    """GeoJSON geometry."""

    type: str
    coordinates: Any


class GeoJSONFeature(BaseModel):
    """GeoJSON feature."""

    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: dict[str, Any]


class GeoJSONResponse(BaseModel):
    """GeoJSON response with metadata."""

    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]
    returned: int
    total: int


class ViewportFilter(BaseModel):
    """Viewport filter for spatial queries."""

    minx: float = Field(..., description="Minimum longitude")
    miny: float = Field(..., description="Minimum latitude")
    maxx: float = Field(..., description="Maximum longitude")
    maxy: float = Field(..., description="Maximum latitude")

    @field_validator("minx", "maxx")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        """Validate longitude range."""
        if not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v

    @field_validator("miny", "maxy")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        """Validate latitude range."""
        if not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v


class Province(BaseModel):
    """Province information."""

    name: str
    regencies: list[str] = []


class Regency(BaseModel):
    """Regency information."""

    name: str
    province: str
    rdtr_count: int = 0


class RDTRInfo(BaseModel):
    """RDTR information."""

    id: str
    name: str
    province: str
    kabupaten: str
    feature_count: int


class ErrorResponse(BaseModel):
    """Error response."""

    error: str
    detail: Optional[str] = None
