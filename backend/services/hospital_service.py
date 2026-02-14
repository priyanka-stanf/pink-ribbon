"""
Hospital lookup: ZIP → lat/lon (local CSV), Haversine distance, CMS hospital list.
No paid APIs. No Google Maps. Local datasets only.
"""

import csv
import math
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ZIP_CSV = os.environ.get("CARECOMPASS_ZIP_CSV", str(_DATA_DIR / "zip_lat_lon.csv"))
HOSPITALS_CSV = os.environ.get("CARECOMPASS_HOSPITALS_CSV", str(_DATA_DIR / "cms_hospitals.csv"))
EARTH_RADIUS_MILES = 3958.8

# ── Lazy caches ──────────────────────────────────────────────────────────
_zip_cache: Optional[Dict[str, Tuple[float, float]]] = None
_hospitals_cache: Optional[List[dict]] = None


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


def _load_hospitals() -> List[dict]:
    out: List[dict] = []
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
                has_onc = row.get("has_oncology", "1").strip()
                proc_vol = row.get("procedure_volume", "").strip()
                cost_tier = row.get("cost_tier", "yellow").strip()
                cms_stars = row.get("cms_overall_stars", "").strip()
                cms_mortality = row.get("cms_mortality_rating", "").strip()
                cms_readmission = row.get("cms_readmission_rating", "").strip()
                cms_experience = row.get("cms_patient_experience", "").strip()
                cms_spending = row.get("cms_spending_per_beneficiary", "").strip()
                if hid and name:
                    out.append({
                        "id": hid, "name": name, "lat": lat, "lon": lon,
                        "type": htype, "quality_rating": quality,
                        "has_oncology": has_onc == "1",
                        "procedure_volume": int(proc_vol) if proc_vol.isdigit() else 0,
                        "cost_tier": cost_tier,
                        "cms_overall_stars": int(cms_stars) if cms_stars.isdigit() else quality,
                        "cms_mortality_rating": cms_mortality or "Not available",
                        "cms_readmission_rating": cms_readmission or "Not available",
                        "cms_patient_experience": cms_experience or "Not available",
                        "cms_spending_per_beneficiary": cms_spending or "Not available",
                    })
            except (ValueError, TypeError):
                continue
    return out


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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


def zip_to_latlon(zip_code: str) -> Optional[Tuple[float, float]]:
    """Convert ZIP to (lat, lon). Returns None if not found."""
    _ensure_caches()
    z = "".join(c for c in zip_code if c.isdigit())[:5]
    return (_zip_cache or {}).get(z)


def find_hospitals_near_zip(
    zip_code: str,
    radius_miles: float = 25.0,
    max_results: int = 20,
) -> List[dict]:
    """
    Return hospitals within radius_miles of ZIP, sorted by distance.
    Each dict includes all hospital fields + distance_miles.
    """
    _ensure_caches()
    coords = zip_to_latlon(zip_code)
    if coords is None:
        return []
    lat0, lon0 = coords
    nearby: List[dict] = []
    for h in (_hospitals_cache or []):
        d = haversine_miles(lat0, lon0, h["lat"], h["lon"])
        if d > radius_miles:
            continue
        entry = dict(h)
        entry["distance_miles"] = round(d, 2)
        nearby.append(entry)
    nearby.sort(key=lambda x: x["distance_miles"])
    return nearby[:max_results]
