"""
Offline script: build data/zip_centroids.json, a {zip5: [lat, lng]} table for every
US ZCTA, used to anchor hospital search at the user's ZIP.

Source: US Census ZCTA Gazetteer (public domain, no API key). The INTPTLAT/INTPTLONG
columns are the ZCTA's interior point, which is the standard "centre of the ZIP" value.

Why this is needed: hospital search previously matched on the first 3 ZIP digits, which
is far too coarse -- ZIP3 943 contains only 3 hospitals, so a search from Stanford
missed San Mateo, San Francisco and San Jose entirely because they sit in different
ZIP3 prefixes. Anchoring on a real coordinate lets the search rank by actual distance.
A ZIP table is required rather than reusing hospital coordinates, because a user's ZIP
often contains no hospital at all.

Usage:  python build_zip_centroids.py
"""

import io
import json
import os
import zipfile

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(HERE, "..", "data", "zip_centroids.json")

GAZETTEER_URL = (
    "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/"
    "2024_Gazetteer/2024_Gaz_zcta_national.zip"
)
TIMEOUT = 300


def fetch_rows():
    """Yield (zip5, lat, lng) from the gazetteer archive."""
    resp = requests.get(GAZETTEER_URL, timeout=TIMEOUT)
    resp.raise_for_status()
    archive = zipfile.ZipFile(io.BytesIO(resp.content))
    raw = archive.read(archive.namelist()[0]).decode("utf-8-sig", errors="replace")

    lines = raw.splitlines()
    # Column names carry heavy trailing padding in this file, hence the strip().
    header = [c.strip() for c in lines[0].split("\t")]
    i_zip = header.index("GEOID")
    i_lat = header.index("INTPTLAT")
    i_lng = header.index("INTPTLONG")

    for line in lines[1:]:
        parts = line.split("\t")
        if len(parts) <= max(i_zip, i_lat, i_lng):
            continue
        zip5 = parts[i_zip].strip()
        try:
            lat = float(parts[i_lat].strip())
            lng = float(parts[i_lng].strip())
        except ValueError:
            continue
        if len(zip5) == 5 and zip5.isdigit():
            yield zip5, lat, lng


def main():
    centroids = {z: [round(lat, 5), round(lng, 5)] for z, lat, lng in fetch_rows()}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(centroids, f, sort_keys=True, separators=(",", ":"))
    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f"wrote {len(centroids)} ZIP centroids to {OUT_PATH} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
