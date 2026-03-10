"""In-memory cache for GeoJSON data and summary statistics."""
from __future__ import annotations

import json
import logging
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from app.core.spatial import SpatialIndex

logger = logging.getLogger(__name__)


@dataclass
class AreaData:
    """Cached data for a single area."""

    name: str
    features: list[dict[str, Any]]
    spatial_index: SpatialIndex
    total: int

    @classmethod
    def create(cls, name: str, features: list[dict[str, Any]], cell_size: float = 0.01) -> AreaData:
        """Create a new AreaData with spatial indexing."""
        spatial_index = SpatialIndex(cell_size=cell_size)

        for feature in features:
            geom = feature.get("geometry", {})
            bounds = _get_bounds(geom)
            spatial_index.add(feature, bounds)

        return cls(
            name=name,
            features=features,
            spatial_index=spatial_index,
            total=len(features),
        )


@dataclass
class SummaryStats:
    """Summary statistics for all loaded data."""

    total_features: int = 0
    areas: list[dict[str, Any]] = field(default_factory=list)
    zones: Counter = field(default_factory=Counter)
    kecamatan: Counter = field(default_factory=Counter)
    sub_zones: Counter = field(default_factory=Counter)
    bounds: list[float] = field(default_factory=lambda: [109.0, -4.0, 116.0, 2.0])  # Indonesia bounds


class DataCache:
    """
    In-memory cache for GeoJSON data and summary statistics.

    Uses a simple in-memory dictionary with optional Redis backing.
    """

    def __init__(self, cache_dir: Path | None = None) -> None:
        self.cache_dir = cache_dir
        self._areas: dict[str, AreaData] = {}
        self._summary: SummaryStats | None = None

    def get_area(self, name: str) -> AreaData | None:
        """Get cached area data."""
        return self._areas.get(name)

    def set_area(self, name: str, data: AreaData) -> None:
        """Cache area data."""
        self._areas[name] = data

    def get_all_areas(self) -> dict[str, AreaData]:
        """Get all cached areas."""
        return self._areas.copy()

    def has_area(self, name: str) -> bool:
        """Check if area is cached."""
        return name in self._areas

    def get_summary(self) -> SummaryStats | None:
        """Get cached summary statistics."""
        return self._summary

    def set_summary(self, summary: SummaryStats) -> None:
        """Cache summary statistics."""
        self._summary = summary

    def clear(self) -> None:
        """Clear all cached data."""
        self._areas.clear()
        self._summary = None

    def is_loaded(self) -> bool:
        """Check if data has been loaded."""
        return self._summary is not None

    def save_metadata(self, filepath: Path) -> None:
        """Save cache metadata to file."""
        metadata = {
            "total_features": self._summary.total_features if self._summary else 0,
            "areas": list(self._areas.keys()),
            "loaded": True,
        }
        filepath.write_text(json.dumps(metadata, indent=2))

    @classmethod
    def load_from_file(cls, filepath: Path) -> dict[str, Any]:
        """Load GeoJSON data from file."""
        logger.info(f"Loading data from {filepath}")
        try:
            data = json.loads(filepath.read_text(encoding="utf-8"))
            return data
        except Exception as e:
            logger.error(f"Error loading {filepath}: {e}")
            return {}


def _get_bounds(geometry: dict[str, Any]) -> tuple[float, float, float, float]:
    """Get bounding box from geometry."""
    if geometry.get("type") == "Polygon":
        coords = geometry["coordinates"][0]
    elif geometry.get("type") == "MultiPolygon":
        all_coords = []
        for polygon in geometry["coordinates"]:
            all_coords.extend(polygon[0])
        coords = all_coords
    elif geometry.get("type") == "Point":
        coord = geometry["coordinates"]
        return (coord[0], coord[1], coord[0], coord[1])
    else:
        # Default bounds (Indonesia)
        return (109.0, -4.0, 116.0, 2.0)

    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    return (min(xs), min(ys), max(xs), max(ys))


# Global cache instance
_cache: DataCache | None = None


def get_cache() -> DataCache:
    """Get global cache instance."""
    global _cache
    if _cache is None:
        from app.core.config import settings

        cache_dir = settings.CACHE_DIR
        # Create cache directory if it doesn't exist
        try:
            cache_dir.mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create cache directory {cache_dir}: {e}")
            # Use a temp directory instead
            import tempfile
            cache_dir = Path(tempfile.gettempdir()) / "rdtr_cache"
            cache_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Using temp cache directory: {cache_dir}")
        _cache = DataCache(cache_dir=cache_dir)
    return _cache
