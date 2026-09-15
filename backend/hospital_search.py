"""
Hospital search by ZIP code. Loads CMS Hospital General Information CSV at import time.
Indexes hospitals by ZIP3 prefix for fast lookup.

Coordinates come from data/hospital_coords.json, precomputed offline by
build_hospital_coords.py and keyed by Facility ID. geocoding.py is deliberately not
imported here: the address set is fixed at build time, so nothing needs geocoding at
request time, and keeping it out of this path avoids its cache writes (impossible on a
read-only serverless filesystem) and its unverified-TLS fallback.
"""

import csv
import json
import math
import os
from typing import Any, Dict, List, Optional, Tuple

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "Hospital_General_Information_with_MSPB.csv")
COORDS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "hospital_coords.json")
ZIP_CENTROIDS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "zip_centroids.json")

DEFAULT_RADIUS_MILES = 50.0
EARTH_RADIUS_MILES = 3958.8

# Module-level data: loaded once at import
_ALL_HOSPITALS: List[Dict[str, str]] = []
_ZIP3_INDEX: Dict[str, List[Dict[str, str]]] = {}
_COORDS: Dict[str, Tuple[float, float]] = {}
_ZIP_CENTROIDS: Dict[str, Tuple[float, float]] = {}


def _load_csv() -> None:
    global _ALL_HOSPITALS, _ZIP3_INDEX
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            _ALL_HOSPITALS.append(row)
            zip3 = row.get("ZIP Code", "")[:3]
            if zip3:
                _ZIP3_INDEX.setdefault(zip3, []).append(row)


def _load_coords() -> None:
    """Load the precomputed Facility ID -> (lat, lng) table. Absent file is non-fatal."""
    global _COORDS
    try:
        with open(COORDS_PATH, encoding="utf-8") as f:
            _COORDS = {fid: (pair[0], pair[1]) for fid, pair in json.load(f).items()}
    except (OSError, ValueError, KeyError, IndexError):
        _COORDS = {}


def _load_zip_centroids() -> None:
    """Load the ZIP -> (lat, lng) table used to anchor distance search."""
    global _ZIP_CENTROIDS
    try:
        with open(ZIP_CENTROIDS_PATH, encoding="utf-8") as f:
            _ZIP_CENTROIDS = {z: (p[0], p[1]) for z, p in json.load(f).items()}
    except (OSError, ValueError, KeyError, IndexError):
        _ZIP_CENTROIDS = {}


_load_csv()
_load_coords()
_load_zip_centroids()


def _haversine_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in miles."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_RADIUS_MILES * math.asin(math.sqrt(h))


def _parse_rating(val: str) -> float:
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _compute_measure_score(row: Dict[str, str], prefix: str) -> float:
    """Convert better/worse counts into a 1-5 scale. 3.0 = neutral."""
    try:
        total = int(row.get(f"Count of Facility {prefix} Measures", "0") or "0")
        better = int(row.get(f"Count of {prefix} Measures Better", "0") or "0")
        worse = int(row.get(f"Count of {prefix} Measures Worse", "0") or "0")
    except ValueError:
        return 3.0
    if total == 0:
        return 3.0
    score = (better - worse) / total  # -1 to +1
    return round(3.0 + score * 2.0, 1)


def _parse_mspb_score(row: Dict[str, str]) -> float:
    """
    Parse MSPB Score from CSV. Returns raw MSPB score.
    MSPB Score: 1.0 = national average, <1.0 = lower cost, >1.0 = higher cost
    """
    try:
        mspb = float(row.get("MSPB_Score", "") or "")
        if mspb <= 0:
            return 1.0  # Return national average if no valid data
        return mspb
    except (ValueError, TypeError):
        return 1.0  # Return national average if no data


def _csv_row_to_hospital(
    row: Dict[str, str], user_zip: str, distance: Optional[float] = None
) -> Dict[str, Any]:
    hospital_zip = row.get("ZIP Code", "").strip()
    exact_match = hospital_zip == user_zip
    rating = _parse_rating(row.get("Hospital overall rating", ""))

    address = (row.get("Address", "") or "").title()
    city = (row.get("City/Town", "") or "").title()

    # Precomputed lookup keyed on Facility ID (a true primary key: 5,421 unique, no
    # blanks). The old address-string key collided on 8 hospitals sharing an address.
    # (0, 0) means unmatched; MapSearchPage detects it and hides the map.
    lat, lng = _COORDS.get(row.get("Facility ID", ""), (0, 0))

    return {
        "id": row.get("Facility ID", ""),
        "name": (row.get("Facility Name", "") or "").title(),
        "type": row.get("Hospital Type", ""),
        "address": address,
        "city": city,
        "zip": hospital_zip,
        # Real great-circle miles when known; the 0/15 placeholders only remain for
        # the ZIP3 fallback path, where no anchor coordinate exists to measure from.
        "distance": round(distance, 1) if distance is not None else (0.0 if exact_match else 15.0),
        "rating": rating,
        "metrics": {
            "overallRating": rating,
            "mspbComparison": _parse_mspb_score(row),
            "mortalityComparison": _compute_measure_score(row, "MORT"),
            "safetyComparison": _compute_measure_score(row, "Safety"),
            "readmissionComparison": _compute_measure_score(row, "READM"),
            "patientExperience": 3.0,
            "estOutOfPocket": 0,
        },
        "details": {
            "ownership": row.get("Hospital Ownership", ""),
            "beds": 0,
            "accreditations": [],
            "languages": [],
        },
        "coordinates": {"lat": lat, "lng": lng},
        "isInNetwork": False,
        "offersTreatments": [],
        "phone": row.get("Telephone Number", ""),
        "state": row.get("State", ""),
        "emergencyServices": row.get("Emergency Services", "") == "Yes",
    }


def _search_by_zip3(zip_code: str, limit: int) -> List[Dict[str, Any]]:
    """
    Fallback for ZIPs absent from the centroid table: exact matches first, then the
    same ZIP3 area, each ranked by rating. Coarse -- a ZIP3 prefix is an arbitrary
    postal grouping, not a radius -- but it is the best available without a centroid.
    """
    candidates = _ZIP3_INDEX.get(zip_code[:3], [])
    exact, nearby = [], []
    for row in candidates:
        (exact if row.get("ZIP Code", "").strip() == zip_code else nearby).append(row)

    by_rating = lambda r: _parse_rating(r.get("Hospital overall rating", ""))  # noqa: E731
    exact.sort(key=by_rating, reverse=True)
    nearby.sort(key=by_rating, reverse=True)

    return [_csv_row_to_hospital(row, zip_code) for row in (exact + nearby)[:limit]]


def search_hospitals(
    zip_code: str,
    limit: int = 50,
    radius_miles: float = DEFAULT_RADIUS_MILES,
) -> List[Dict[str, Any]]:
    """
    Search hospitals near a ZIP code, ranked by true great-circle distance.

    Anchors on the ZIP's Census centroid and ranks every geocoded hospital by real
    distance, which crosses ZIP3 boundaries. The previous ZIP3-prefix match returned
    only 3 hospitals for 94305 because San Mateo (940xx), San Francisco (941xx) and
    San Jose (950xx) fall under different prefixes; a 25-mile radius finds 19.

    Hospitals in the exact ZIP that the geocoder could not locate are still included
    (their CMS quality data is valid even without a map pin), appended after the
    ranked results.
    """
    zip_code = (zip_code or "").strip()
    if len(zip_code) < 3:
        return []

    anchor = _ZIP_CENTROIDS.get(zip_code)
    if anchor is None:
        return _search_by_zip3(zip_code, limit)

    lat0, lng0 = anchor
    scored: List[Tuple[float, Dict[str, str]]] = []
    unlocated_exact: List[Dict[str, str]] = []

    for row in _ALL_HOSPITALS:
        coords = _COORDS.get(row.get("Facility ID", ""))
        if coords is None:
            if row.get("ZIP Code", "").strip() == zip_code:
                unlocated_exact.append(row)
            continue
        distance = _haversine_miles(lat0, lng0, coords[0], coords[1])
        if distance <= radius_miles:
            scored.append((distance, row))

    scored.sort(key=lambda pair: pair[0])

    results = [
        _csv_row_to_hospital(row, zip_code, distance=distance)
        for distance, row in scored[:limit]
    ]
    for row in unlocated_exact[: max(0, limit - len(results))]:
        results.append(_csv_row_to_hospital(row, zip_code))
    return results
