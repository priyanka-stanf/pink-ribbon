"""
Offline script: build data/hospital_coords.json, a precomputed {Facility ID: [lat, lng]}
lookup table for every hospital in the CMS file the API actually serves.

Why precompute instead of cache: the address set is closed and known at build time
(5,421 fixed rows in a committed CSV), so nothing is unpredictable. geocoding.py's
runtime cache can never populate itself anymore -- hospital_search.py calls
geocode_address_cached_only -- and it can't persist on a read-only serverless
filesystem either.

Why Facility ID as the key: it is 5,421 unique values across 5,421 rows with no blanks.
The old address-string key collides on 8 hospitals that share an address, and breaks
silently if CMS ever reformats "STREET" to "ST".

Geocoder: US Census batch endpoint. Free, no API key, built for bulk, US-only (every
CMS hospital is a US address), street-level matches. Nominatim's public instance
prohibits bulk geocoding and would take ~90 minutes at its 1 req/sec limit.

Usage:  python build_hospital_coords.py [chunk_size]
"""

import csv
from collections import Counter
import io
import json
import os
import sys

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
# Read the same file the API serves, so addresses can never drift between the two.
CSV_PATH = os.path.join(HERE, "..", "data", "Hospital_General_Information_with_MSPB.csv")
OUT_PATH = os.path.join(HERE, "..", "data", "hospital_coords.json")

ENDPOINT = "https://geocoding.geo.census.gov/geocoder/locations/addressbatch"
BENCHMARK = "Public_AR_Current"
CHUNK_SIZE = 1000  # API cap is 10,000/file, but large uploads are flaky
TIMEOUT = 600
MAX_ATTEMPTS = 3

# Continental US + AK/HI/PR bounding box, used to catch a lat/lng transposition.
LAT_RANGE = (15.0, 72.0)
LNG_RANGE = (-180.0, -60.0)


def read_hospitals():
    """Yield (facility_id, street, city, state, zip) for rows with a complete address."""
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            fid = (row.get("Facility ID") or "").strip()
            street = (row.get("Address") or "").strip()
            city = (row.get("City/Town") or "").strip()
            state = (row.get("State") or "").strip()
            zip_code = (row.get("ZIP Code") or "").strip()
            if fid and street and city and state and zip_code:
                yield fid, street, city, state, zip_code


def build_upload_csv(batch):
    """Census batch format: headerless CSV of id, street, city, state, zip."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    for fid, street, city, state, zip_code in batch:
        writer.writerow([fid, street, city, state, zip_code])
    return buf.getvalue().encode("utf-8")


def post_batch(payload):
    """
    POST a multipart/form-data batch and return the response CSV text.

    Uses requests so TLS certificates are verified against certifi's CA bundle.
    Do not fall back to an unverified SSL context here -- that is the bug in
    geocoding.py:99, and a missing local CA bundle is a machine setup problem
    (run "Install Certificates.command" for python.org builds), not a reason to
    stop verifying certificates.
    """
    resp = requests.post(
        ENDPOINT,
        data={"benchmark": BENCHMARK, "returntype": "locations"},
        files={"addressFile": ("addresses.csv", payload, "text/csv")},
        headers={"User-Agent": "PinkRibbon/1.0 (offline hospital geocoding)"},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.text


def parse_response(text, coords, stats):
    """
    Census returns headerless CSV:
      id, input address, match status, match type, matched address, "lon,lat", tigerline, side
    Note the coordinate order is LONGITUDE,LATITUDE -- reversed from what the app uses.
    """
    for rec in csv.reader(io.StringIO(text)):
        # A No_Match row is truncated to 3 fields (id, input, status) with no
        # coordinate column, so status must be checked before the width check or
        # every unmatched address is misfiled as malformed.
        if len(rec) < 3:
            stats["malformed"] += 1
            continue
        if rec[2].strip() != "Match":
            stats["no_match"] += 1
            continue
        if len(rec) < 6 or not rec[5].strip():
            stats["malformed"] += 1
            continue
        fid, coord_field = rec[0].strip(), rec[5].strip()
        try:
            lng_str, lat_str = coord_field.split(",")
            lng, lat = float(lng_str), float(lat_str)
        except ValueError:
            stats["malformed"] += 1
            continue
        # Guard against a transposition: if these fail, the pair was swapped.
        if not (LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LNG_RANGE[0] <= lng <= LNG_RANGE[1]):
            stats["out_of_bounds"] += 1
            continue
        coords[fid] = [round(lat, 6), round(lng, 6)]
        stats["matched"] += 1


def build_city_retries(hospitals, coords):
    """
    Build retry rows for unmatched hospitals, substituting the dominant city used by
    already-matched hospitals in the same ZIP3.

    Census rejects some perfectly valid addresses because the CSV's city is an
    unincorporated place its TIGER data does not carry as a city name. Stanford Health
    Care is the motivating case: "300 PASTEUR DRIVE, STANFORD, CA 94305" is No_Match,
    but the identical street with "PALO ALTO" matches exactly. Rural highway addresses
    are not recovered this way -- there the street itself is missing from TIGER.
    """
    dominant = {}
    for fid, _street, city, _state, zip_code in hospitals:
        if fid in coords:
            dominant.setdefault(zip_code[:3], Counter())[city] += 1

    retries = []
    for fid, street, city, state, zip_code in hospitals:
        if fid in coords:
            continue
        counter = dominant.get(zip_code[:3])
        if not counter:
            continue
        alt_city = counter.most_common(1)[0][0]
        if alt_city.upper() != city.upper():
            retries.append((fid, street, alt_city, state, zip_code))
    return retries


def run_chunks(rows, coords, stats, chunk_size, label):
    chunks = [rows[i : i + chunk_size] for i in range(0, len(rows), chunk_size)]
    for n, batch in enumerate(chunks, 1):
        payload = build_upload_csv(batch)
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                parse_response(post_batch(payload), coords, stats)
                print(f"  {label} chunk {n}/{len(chunks)}: {stats['matched']} matched so far")
                break
            except requests.RequestException as e:
                if attempt == MAX_ATTEMPTS:
                    print(f"  {label} chunk {n}/{len(chunks)}: FAILED after {MAX_ATTEMPTS} attempts ({e})")
                else:
                    print(f"  {label} chunk {n}/{len(chunks)}: attempt {attempt} failed ({e}); retrying")


def main():
    chunk_size = int(sys.argv[1]) if len(sys.argv) > 1 else CHUNK_SIZE
    hospitals = list(read_hospitals())
    print(f"{len(hospitals)} hospitals with complete addresses; chunk size {chunk_size}")

    coords = {}
    stats = {"matched": 0, "no_match": 0, "malformed": 0, "out_of_bounds": 0}

    run_chunks(hospitals, coords, stats, chunk_size, "pass1")
    first_pass = len(coords)

    retries = build_city_retries(hospitals, coords)
    if retries:
        print(f"retrying {len(retries)} unmatched with the ZIP3's dominant city")
        stats["no_match"] = 0  # pass-1 misses are re-counted by the retry
        run_chunks(retries, coords, stats, chunk_size, "pass2")
        print(f"pass 2 recovered {len(coords) - first_pass}")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(coords, f, sort_keys=True, separators=(",", ":"))

    total = len(hospitals)
    print(
        f"\nwrote {len(coords)}/{total} coords ({100 * len(coords) / total:.1f}%) to {OUT_PATH}\n"
        f"  matched={stats['matched']} no_match={stats['no_match']} "
        f"malformed={stats['malformed']} out_of_bounds={stats['out_of_bounds']}"
    )
    if stats["out_of_bounds"]:
        print("  WARNING: out_of_bounds > 0 suggests a lat/lng transposition -- investigate.")


if __name__ == "__main__":
    main()
