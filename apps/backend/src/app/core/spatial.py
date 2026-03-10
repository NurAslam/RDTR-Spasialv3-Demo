"""Spatial indexing for efficient viewport queries."""
from __future__ import annotations

from collections.abc import Generator
from dataclasses import dataclass, field
from typing import Any


@dataclass
class SpatialIndex:
    """
    Simple grid-based spatial index for bounding box queries.

    Uses a grid cell system to quickly find features within a bounding box.
    """

    cell_size: float = 0.01  # ~1km in degrees
    index: dict[tuple[int, int], list[int]] = field(default_factory=dict)
    features: list[dict[str, Any]] = field(default_factory=list)
    bounds_map: dict[int, tuple[float, float, float, float]] = field(default_factory=dict)

    def add(self, feature: dict[str, Any], bounds: tuple[float, float, float, float]) -> None:
        """
        Add a feature to the spatial index.

        Args:
            feature: GeoJSON feature object
            bounds: (min_x, min_y, max_x, max_y) bounding box
        """
        idx = len(self.features)
        self.features.append(feature)
        self.bounds_map[idx] = bounds

        min_x, min_y, max_x, max_y = bounds

        # Add to all grid cells that intersect the bounds
        start_x = int(min_x / self.cell_size)
        end_x = int(max_x / self.cell_size)
        start_y = int(min_y / self.cell_size)
        end_y = int(max_y / self.cell_size)

        for x in range(start_x, end_x + 1):
            for y in range(start_y, end_y + 1):
                key = (x, y)
                if key not in self.index:
                    self.index[key] = []
                self.index[key].append(idx)

    def query(
        self, bounds: tuple[float, float, float, float]
    ) -> Generator[dict[str, Any], None, None]:
        """
        Query features within the given bounds.

        Args:
            bounds: (min_x, min_y, max_x, max_y) bounding box

        Yields:
            Features that intersect the query bounds
        """
        min_x, min_y, max_x, max_y = bounds

        start_x = int(min_x / self.cell_size)
        end_x = int(max_x / self.cell_size)
        start_y = int(min_y / self.cell_size)
        end_y = int(max_y / self.cell_size)

        result_indices: set[int] = set()

        # Collect all feature indices in the queried grid cells
        for x in range(start_x, end_x + 1):
            for y in range(start_y, end_y + 1):
                result_indices.update(self.index.get((x, y), []))

        # Yield features and filter by actual bounds (not just grid cell)
        for idx in result_indices:
            feature = self.features[idx]
            feature_bounds = self.bounds_map.get(idx)
            if feature_bounds and self._bounds_intersect(feature_bounds, bounds):
                yield feature

    @staticmethod
    def _bounds_intersect(
        bounds1: tuple[float, float, float, float],
        bounds2: tuple[float, float, float, float],
    ) -> bool:
        """Check if two bounding boxes intersect."""
        return not (
            bounds1[2] < bounds2[0]  # bounds1 max_x < bounds2 min_x
            or bounds1[0] > bounds2[2]  # bounds1 min_x > bounds2 max_x
            or bounds1[3] < bounds2[1]  # bounds1 max_y < bounds2 min_y
            or bounds1[1] > bounds2[3]  # bounds1 min_y > bounds2 max_y
        )

    def clear(self) -> None:
        """Clear all data from the index."""
        self.index.clear()
        self.features.clear()
        self.bounds_map.clear()

    def __len__(self) -> int:
        """Return the number of features in the index."""
        return len(self.features)
