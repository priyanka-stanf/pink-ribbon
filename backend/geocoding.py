"""
Simple geocoding using Nominatim (OpenStreetMap) with rate limiting and caching.
Free to use, no API key required.
"""

import time
import json
import os
import ssl
from typing import Optional, Tuple
from urllib.request import urlopen, Request
from urllib.parse import urlencode

try:
    import certifi
    HAS_CERTIFI = True
except ImportError:
    HAS_CERTIFI = False

CACHE_FILE = os.path.join(os.path.dirname(__file__), "geocoding_cache.json")
_CACHE = {}
_LAST_REQUEST_TIME = 0
MIN_REQUEST_INTERVAL = 1.0  # Nominatim requires max 1 request per second

def _load_cache():
    global _CACHE
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                _CACHE = json.load(f)
        except Exception:
            _CACHE = {}

def _save_cache():
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump(_CACHE, f, indent=2)
    except Exception:
        pass

_load_cache()

def geocode_address_cached_only(address: str, city: str, state: str, zip_code: str) -> Optional[Tuple[float, float]]:
    """
    Check if address is already geocoded in cache. Returns immediately without making API calls.
    Returns (latitude, longitude) or None if not in cache.
    """
    cache_key = f"{address}, {city}, {state} {zip_code}".lower().strip()
    if cache_key in _CACHE:
        coords = _CACHE[cache_key]
        if coords:
            return tuple(coords)
    return None

def geocode_address(address: str, city: str, state: str, zip_code: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address using Nominatim (OpenStreetMap).
    Returns (latitude, longitude) or None if geocoding fails.
    """
    # Create cache key
    cache_key = f"{address}, {city}, {state} {zip_code}".lower().strip()

    # Check cache first
    if cache_key in _CACHE:
        coords = _CACHE[cache_key]
        if coords:
            return tuple(coords)
        return None

    # Rate limiting
    global _LAST_REQUEST_TIME
    elapsed = time.time() - _LAST_REQUEST_TIME
    if elapsed < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - elapsed)

    # Build query
    query = f"{address}, {city}, {state} {zip_code}, USA"
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'addressdetails': 1
    }

    url = f"https://nominatim.openstreetmap.org/search?{urlencode(params)}"

    try:
        # Create SSL context with proper certificates
        if HAS_CERTIFI:
            context = ssl.create_default_context(cafile=certifi.where())
        else:
            context = ssl._create_unverified_context()

        # Nominatim requires a User-Agent
        req = Request(url, headers={'User-Agent': 'PinkRibbon/1.0 (Healthcare Application)'})
        with urlopen(req, context=context, timeout=5) as response:
            _LAST_REQUEST_TIME = time.time()
            data = json.loads(response.read().decode())

            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                coords = (lat, lon)

                # Cache the result
                _CACHE[cache_key] = coords
                _save_cache()

                return coords
    except Exception as e:
        print(f"Geocoding error for {query}: {e}")

    # Cache the failure to avoid repeated attempts
    _CACHE[cache_key] = None
    _save_cache()

    return None
