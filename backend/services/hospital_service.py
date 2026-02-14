"""
Hospital lookup: ZIP → lat/lon (local CSV), Haversine distance, CMS hospital list.
No paid APIs. Returns hospitals within configurable radius with lat, lon, type, distance.
"""

import csv
import math
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ── Data paths ─────────────────────────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ZIP_CSV = os.environ.get("CARECOMPASS_ZIP_CSV", str(_DATA_DIR / "zip_lat_lon.csv"))
HOSPITALS_CSV = os.environ.get("CARECOMPASS_HOSPITALS_CSV", str(_DATA_DIR / "cms_hospitals.csv"))

EARTH_RADIUS_MILES = 3958.8


@dataclass
class _Hospital:
    id: str
    name: str
    lat: float
    lon: float
    type: str  # "academic" | "community" | "clinical_trial"
    quality_rating: Optional[int] = None


# ── Lazy caches ────────────────────────────────────────────────────────────
_zip_cache: Optional[Dict[str, Tuple[float, float]]] = None
_hospitals_cache: Optional[List[_Hospital]] = None


def _load_zip_lat_lon() -> Dict[str, Tuple[float, float]]:
    out: Dict[str, Tuple[float, float]] = {}
    path = Path(ZIP_CSV)
    if not path.exists():
        return out
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            z = (row.get("zip") or "").strip()
            if len(z) >= 5:
                z = z[:5]
            try:
                lat, lon = float(row.get("lat", 0)), float(row.get("lon", 0))
                out[z] = (lat, lon)
            except (ValueError, TypeError):
                continue
    return out


def _load_hospitals() -> List[_Hospital]:
    out: List[_Hospital] = []
    path = Path(HOSPITALS_CSV)
    if not path.exists():
        return out
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            try:
                hid = (row.get("id") or "").strip()
                name = (row.get("name") or "").strip()
                lat = float(row.get("lat", 0))
                lon = float(row.get("lon", 0))
                htype = (row.get("type") or "community").strip().lower()
                if htype not in ("academic", "community", "clinical_trial"):
                    htype = "community"
                q = row.get("quality_rating", "").strip()
                quality = int(q) if q and q.isdigit() else None
                if hid and name:
                    out.append(_Hospital(id=hid, name=name, lat=lat, lon=lon, type=htype, quality_rating=quality))
            except (ValueError, TypeError):
                continue
    return out


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in miles between two (lat, lon) points."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return EARTH_RADIUS_MILES * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _ensure_caches():
    global _zip_cache, _hospitals_cache
    if _zip_cache is None:
        _zip_cache = _load_zip_lat_lon()
    if _hospitals_cache is None:
        _hospitals_cache = _load_hospitals()


# ── Public API ─────────────────────────────────────────────────────────────

def zip_to_latlon(zip_code: str) -> Optional[Tuple[float, float]]:
    """Convert 5-digit ZIP to (lat, lon) from local dataset. Returns None if not found."""
    _ensure_caches()
    z = "".join(c for c in zip_code if c.isdigit())[:5]
    return _zip_cache.get(z) if z else None  # type: ignore[union-attr]


def find_hospitals_near_zip(
    zip_code: str,
    radius_miles: float = 50.0,
    max_results: int = 5,
) -> List[dict]:
    """
    Return up to max_results hospitals within radius_miles of the given ZIP,
    sorted by distance. Each dict: id, name, type, distance_miles, lat, lon.
    """
    _ensure_caches()
    coords = zip_to_latlon(zip_code)
    if coords is None:
        return []
    lat0, lon0 = coords
    nearby: List[dict] = []
    for h in (_hospitals_cache or []):
        d = haversine_miles(lat0, lon0, h.lat, h.lon)
        if d > radius_miles:
            continue
        nearby.append({
            "id": h.id,
            "name": h.name,
            "type": h.type,
            "distance_miles": round(d, 2),
            "lat": h.lat,
            "lon": h.lon,
        })
    nearby.sort(key=lambda x: x["distance_miles"])
    return nearby[:max_results]


def get_hospital_by_id(hospital_id: str) -> Optional[dict]:
    """Return one hospital by id (with lat, lon)."""
    _ensure_caches()
    for h in (_hospitals_cache or []):
        if h.id == hospital_id:
            return {
                "id": h.id,
                "name": h.name,
                "type": h.type,
                "lat": h.lat,
                "lon": h.lon,
            }
    return None
