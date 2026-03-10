"""Data loading and management service."""
from __future__ import annotations

import glob
import json
import logging
from collections import Counter
from pathlib import Path

from app.core.cache import AreaData, DataCache, SummaryStats, get_cache
from app.core.config import settings

logger = logging.getLogger(__name__)

# Zone colors (Permen ATR BPN 11/2023)
ZONE_COLORS: dict[str, str] = {
    # Zona Lindung
    "BA": "#97DBF2",
    "HL": "#325F28",
    "LG": "#696900",
    "PS": "#05D7D7",
    # Zona RTH
    "RTH-1": "#37550A",
    "RTH-2": "#416900",
    "RTH-3": "#468700",
    "RTH-4": "#4BA500",
    "RTH-5": "#50C300",
    "RTH-6": "#55E100",
    "RTH-7": "#5AFF00",
    "RTH-8": "#0F9100",
    # Zona Konservasi
    "CA": "#4646A5",
    "CAL": "#5A5AC3",
    "SM": "#6E6EE1",
    "SML": "#8280FF",
    "TN": "#8280FF",
    "THR": "#A9B837",
    "TWA": "#E6A5FF",
    "TWL": "#C797FF",
    # Zona Perumahan
    "P": "#FFBE00",
    "P-1": "#FFBE00",
    "P-2": "#FFC500",
    "P-3": "#FFCC00",
    "P-4": "#FFD300",
    # Zona Campuran/Komersial
    "C": "#F05500",
    "C-1": "#F05500",
    "C-2": "#F06500",
    "C-3": "#F07500",
    # Zona Industri
    "I": "#690000",
    "I-1": "#690000",
    "I-2": "#7A0000",
    # Zona Perkantoran
    "K": "#8B4513",
    # Zona Pariwisata
    "W": "#FFA5FF",
    # Zona Sosial
    "S": "#7D197D",
    "S-1": "#7D197D",
    "S-2": "#8B1E8B",
    "S-3": "#992399",
    # Zona Transportasi
    "T": "#D73700",
    "T-1": "#D73700",
    "T-2": "#E54500",
    "T-3": "#F35300",
    # Zona Badan Jalan
    "BJ": "#EB1E1E",
    "J": "#EB1E1E",
    # Default
    "default": "#BDBDBD",
}


class DataService:
    """Service for loading and managing GeoJSON data."""

    def __init__(self, cache: DataCache | None = None) -> None:
        self.cache = cache or get_cache()
        self.data_dir = settings.DATA_DIR

    def load_all_data(self) -> SummaryStats:
        """Load all GeoJSON data from data directory (rdtr folder only)."""
        logger.info("=" * 50)
        logger.info("LOADING RDTR DATA")
        logger.info("=" * 50)

        summary = SummaryStats()

        # Debug: print data dir
        logger.info(f"DATA_DIR: {self.data_dir}")
        logger.info(f"DATA_DIR exists: {self.data_dir.exists()}")

        # Find all GeoJSON files in rdtr folders (including subdirectories like 'layers')
        pattern = str(self.data_dir / "**" / "rdtr" / "**" / "*.geojson")
        logger.info(f"Searching pattern: {pattern}")
        geojson_files = glob.glob(pattern, recursive=True)
        logger.info(f"Found {len(geojson_files)} GeoJSON files in rdtr folders")

        if not geojson_files:
            logger.warning(f"No GeoJSON files found in {self.data_dir}")
            # Try alternative path
            alt_pattern = str(settings.BASE_DIR.parent / "RDTR-Spasial-Rev2" / "output" / "**" / "rdtr" / "**" / "*.geojson")
            logger.info(f"Trying alternative pattern: {alt_pattern}")
            geojson_files = glob.glob(alt_pattern, recursive=True)
            logger.info(f"Found {len(geojson_files)} files in alternative path")

        # Group files by RDTR folder (to combine multiple files under the same RDTR)
        rdtr_file_groups: dict[str, list[Path]] = {}
        for filepath in geojson_files:
            try:
                # Skip if path contains administrasi or rtrw (we only want rdtr)
                if "/administrasi/" in str(filepath) or "/rtrw/" in str(filepath):
                    continue

                # Get the RDTR folder name (parent of "layers" or the folder containing the file)
                rdtr_key = self._get_rdtr_key(Path(filepath))
                if rdtr_key:
                    if rdtr_key not in rdtr_file_groups:
                        rdtr_file_groups[rdtr_key] = []
                    rdtr_file_groups[rdtr_key].append(Path(filepath))

            except Exception as e:
                logger.error(f"Error grouping file {filepath}: {e}")

        logger.info(f"Grouped into {len(rdtr_file_groups)} RDTR folders")

        # Load each RDTR (combining all files under it)
        for rdtr_key, filepaths in rdtr_file_groups.items():
            try:
                area_data = self._load_rdtr_files(rdtr_key, filepaths)
                if area_data:
                    # Update summary
                    summary.total_features += area_data.total
                    summary.areas.append({"name": area_data.name, "features": area_data.total})

                    # Extract statistics
                    self._update_summary_stats(summary, area_data)

            except Exception as e:
                logger.error(f"Error loading {rdtr_key}: {e}")

        # Update overall bounds
        if summary.bounds:
            summary.bounds = self._calculate_overall_bounds(summary.areas)

        # Cache summary
        self.cache.set_summary(summary)

        logger.info("=" * 50)
        logger.info(f"LOADED: {summary.total_features:,} features from {len(summary.areas)} areas")
        logger.info("=" * 50)

        return summary

    def _get_rdtr_key(self, filepath: Path) -> str | None:
        """Get the RDTR key for a file (used to group files under the same RDTR)."""
        try:
            # Get relative path from data_dir for easier parsing
            try:
                rel_path = filepath.relative_to(self.data_dir)
            except ValueError:
                # If file is not under data_dir, try absolute path
                rel_path = filepath

            parts = list(rel_path.parts)
            logger.info(f"  Parsing: {rel_path}")

            province = ""
            kabupaten = ""
            rdtr_name = ""

            # Find "Kalimantan" to get province
            for i, p in enumerate(parts):
                if p.startswith("Kalimantan") and i + 1 < len(parts):
                    # Check if next part is also part of province name
                    if i + 2 < len(parts) and parts[i + 1] in ("Barat", "Timur", "Tengah", "Selatan", "Utara"):
                        province = f"{p} {parts[i + 1]}"
                    elif p == "Kalimantan":
                        province = f"{p} {parts[i + 1]}"
                    else:
                        # Already has full name like "Kalimantan Barat"
                        province = p
                    break

            # Find kabupaten - after "polygons" and before "rdtr"
            if "polygons" in parts and "rdtr" in parts:
                polygons_idx = parts.index("polygons")
                rdtr_idx = parts.index("rdtr")
                if polygons_idx + 1 < rdtr_idx:
                    kabupaten = parts[polygons_idx + 1]

            # Find RDTR name - after "rdtr" folder
            if "rdtr" in parts:
                rdtr_idx = parts.index("rdtr")
                # Check if next item is "layers"
                if rdtr_idx + 1 < len(parts) and parts[rdtr_idx + 1] == "layers":
                    # RDTR name is at rdtr_idx + 2
                    if rdtr_idx + 2 < len(parts):
                        rdtr_name = parts[rdtr_idx + 2]
                elif rdtr_idx + 1 < len(parts):
                    # File is directly in rdtr/ - get filename without extension
                    rdtr_name = filepath.stem

            if province and kabupaten and rdtr_name:
                result = f"{province}/{kabupaten}/{rdtr_name}"
                logger.info(f"  → Key: {result}")
                return result

            logger.warning(f"  → Could not parse: province={province}, kabupaten={kabupaten}, rdtr_name={rdtr_name}")
            return None

        except Exception as e:
            logger.warning(f"Error getting RDTR key for {filepath}: {e}")
            return None

    def _load_rdtr_files(self, rdtr_key: str, filepaths: list[Path]) -> AreaData | None:
        """Load and combine multiple GeoJSON files under the same RDTR."""
        logger.info(f"Loading RDTR: {rdtr_key} ({len(filepaths)} files)")

        all_features = []

        for filepath in filepaths:
            try:
                logger.info(f"  - Loading {filepath.name}...")
                data = json.loads(filepath.read_text(encoding="utf-8"))
                features = data.get("features", [])

                # Normalize properties (handle case sensitivity)
                for feature in features:
                    props = feature.get("properties", {})
                    normalized = {}
                    for key, value in props.items():
                        normalized[key.upper()] = value
                    feature["properties"] = normalized

                all_features.extend(features)
                logger.info(f"    ✓ {len(features)} features")

            except Exception as e:
                logger.error(f"    ✗ Error loading {filepath.name}: {e}")

        if not all_features:
            logger.warning(f"  No features loaded for {rdtr_key}")
            return None

        logger.info(f"  Total: {len(all_features)} features")

        # Create area data with spatial index
        area_data = AreaData.create(rdtr_key, all_features, cell_size=settings.SPATIAL_INDEX_CELL_SIZE)

        # Cache the data
        self.cache.set_area(rdtr_key, area_data)

        return area_data

    def _load_geojson_file(self, filepath: Path) -> AreaData | None:
        """Load and index a single GeoJSON file."""
        area_name = self._extract_area_name(filepath)
        logger.info(f"Loading {area_name}...")

        try:
            data = json.loads(filepath.read_text(encoding="utf-8"))
            features = data.get("features", [])

            # Normalize properties (handle case sensitivity)
            for feature in features:
                props = feature.get("properties", {})
                normalized = {}
                for key, value in props.items():
                    normalized[key.upper()] = value
                feature["properties"] = normalized

            # Create area data with spatial index
            area_data = AreaData.create(area_name, features, cell_size=settings.SPATIAL_INDEX_CELL_SIZE)

            # Cache the data
            self.cache.set_area(area_name, area_data)

            logger.info(f"  ✓ {len(features)} features indexed")
            return area_data

        except Exception as e:
            logger.error(f"  ✗ Error: {e}")
            return None

    def _extract_area_name(self, filepath: Path) -> str:
        """
        Extract area name from file path.

        Expected path structures:
        1. .../output/Kalimantan Barat/polygons/Kab. Kubu Raya/rdtr/RDTR Kab. Kubu Raya - Sungai Kakap.geojson
        2. .../output/Kalimantan Timur/polygons/Kab. Penajam Paser Utara/rdtr/RDTR X/layers/file.geojson

        Returns: "Kalimantan Barat/Kab. Kubu Raya/RDTR Kab. Kubu Raya - Sungai Kakap"
        """
        parts = list(filepath.parts)
        province = ""
        kabupaten = ""
        rdtr_name = ""

        try:
            # Find "Kalimantan" to get province
            for i, p in enumerate(parts):
                if p == "Kalimantan" and i + 1 < len(parts):
                    province = f"{p} {parts[i + 1]}"
                    break

            # If Kalimantan not found, try common patterns
            if not province:
                # Check if "output" is in path and next item is province
                if "output" in parts:
                    output_idx = parts.index("output")
                    if output_idx + 1 < len(parts):
                        possible_province = parts[output_idx + 1]
                        if possible_province.startswith("Kalimantan"):
                            province = possible_province

            # Find kabupaten - should be after "polygons" and before "rdtr"
            if "polygons" in parts and "rdtr" in parts:
                polygons_idx = parts.index("polygons")
                rdtr_idx = parts.index("rdtr")
                if polygons_idx + 1 < rdtr_idx:
                    kabupaten = parts[polygons_idx + 1]

            # Find RDTR name - it's the parent folder name (before "layers" or the file itself)
            # The file might be directly in rdtr/ or in rdtr/RDTR_NAME/layers/
            if "rdtr" in parts:
                rdtr_idx = parts.index("rdtr")
                # Check if next item after "rdtr" is "layers"
                if rdtr_idx + 1 < len(parts) and parts[rdtr_idx + 1] == "layers":
                    # RDTR name is at rdtr_idx + 2 (the folder containing layers)
                    if rdtr_idx + 2 < len(parts):
                        rdtr_name = parts[rdtr_idx + 2]
                else:
                    # File is directly in rdtr/ - get the filename without extension
                    rdtr_name = filepath.stem

            # If we found all parts, construct the name
            if province and kabupaten and rdtr_name:
                return f"{province}/{kabupaten}/{rdtr_name}"

            # Fallback: use full path as reference
            relative_path = filepath.relative_to(self.data_dir)
            logger.warning(f"Could not fully parse path: {filepath}, using relative path")
            return str(relative_path)

        except Exception as e:
            logger.warning(f"Error parsing path {filepath}: {e}, using filename only")
            return filepath.stem

    def _update_summary_stats(self, summary: SummaryStats, area_data: AreaData) -> None:
        """Update summary statistics with area data."""
        for feature in area_data.features:
            props = feature.get("properties", {})

            # Count zones
            kodzon = props.get("KODZON", "Unknown")
            if kodzon and kodzon != "Unknown":
                summary.zones[kodzon] += 1

            # Count kecamatan
            wadmckc = props.get("WADMKC", "")
            if wadmckc:
                kc_name = wadmckc.replace("Kec. ", "").strip()
                if kc_name:
                    summary.kecamatan[kc_name] += 1

            # Count sub zones
            namszn = props.get("NAMSZN", "")
            if namszn and namszn != "-":
                summary.sub_zones[namszn] += 1

    def _calculate_overall_bounds(self, areas: list[dict]) -> list[float]:
        """Calculate overall bounds from all areas."""
        # Simplified bounds calculation
        # In production, calculate from actual feature coordinates
        return [109.0, -4.0, 116.0, 2.0]  # Indonesia bounds

    def get_provinces(self) -> list[str]:
        """
        Get list of all provinces (Kalimantan Barat, Kalimantan Timur).

        Returns: ["Kalimantan Barat", "Kalimantan Timur"]
        """
        areas = self.cache.get_all_areas()
        provinces = set()

        for area_name in areas.keys():
            parts = area_name.split("/")
            # First part should be the province (e.g., "Kalimantan Barat")
            # Only add if it starts with "Kalimantan"
            if len(parts) >= 1 and parts[0].startswith("Kalimantan"):
                provinces.add(parts[0])

        return sorted(provinces)

    def get_kabupatens(self, province: str) -> list[dict]:
        """
        Get list of kabupaten/kota for a province.

        Returns: [{"name": "Kab. Kubu Raya", "rdtr_count": 1}, ...]
        """
        areas = self.cache.get_all_areas()
        kabupaten_map: dict[str, int] = {}

        for area_name in areas.keys():
            parts = area_name.split("/")
            if len(parts) >= 2 and parts[0] == province:
                kabupaten = parts[1]  # Second part is kabupaten
                kabupaten_map[kabupaten] = kabupaten_map.get(kabupaten, 0) + 1

        return [
            {"name": kab, "rdtr_count": count}
            for kab, count in sorted(kabupaten_map.items())
        ]

    def get_rdtr_list(self, province: str, kabupaten: str) -> list[dict]:
        """
        Get list of RDTR for a province and kabupaten.

        Returns: [{"id": "...", "name": "...", "province": "...", "kabupaten": "...", "feature_count": 123}, ...]
        """
        areas = self.cache.get_all_areas()
        rdtr_map: dict[str, dict] = {}  # Group by RDTR name

        for area_name, area_data in areas.items():
            parts = area_name.split("/")
            if len(parts) >= 3 and parts[0] == province and parts[1] == kabupaten:
                rdtr_name = parts[2]  # RDTR folder name
                rdtr_key = f"{province}/{kabupaten}/{rdtr_name}"

                if rdtr_key not in rdtr_map:
                    rdtr_map[rdtr_key] = {
                        "id": rdtr_key,
                        "name": rdtr_name,
                        "province": province,
                        "kabupaten": kabupaten,
                        "feature_count": 0,
                    }

                # Accumulate feature count from all files in this RDTR
                rdtr_map[rdtr_key]["feature_count"] += area_data.total

        return sorted(rdtr_map.values(), key=lambda x: x["name"])


# Global service instance
_service: DataService | None = None


def get_data_service() -> DataService:
    """Get global data service instance."""
    global _service
    if _service is None:
        _service = DataService()
    return _service
