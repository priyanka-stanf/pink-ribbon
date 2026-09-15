"""
Vercel serverless entrypoint for the PinkRibbon FastAPI app.

Vercel's Python runtime invokes the ASGI callable directly, so uvicorn is not used
here. backend/ goes on sys.path because its modules use flat imports
(e.g. `from models import PatientInput`).

Why the path shim below: Vercel's `routes` rewrite REPLACES the path delivered to the
lambda with the route's `dest`. Every API path therefore arrives as "/api/index.py",
which matches none of FastAPI's routes, and no request header carries the original
path (verified against the full header set Vercel sends). So vercel.json passes the
intended route explicitly as a `__route` query parameter and this shim restores it
onto the ASGI scope before delegating. Keep the two in sync.
"""

import os
import sys
from urllib.parse import parse_qsl, urlencode

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app as _app  # noqa: E402

_ROUTE_PARAM = "__route"


def _restore_path(scope):
    """Move the __route query parameter back onto scope['path']."""
    params = parse_qsl(scope.get("query_string", b"").decode(), keep_blank_values=True)
    route = next((v for k, v in params if k == _ROUTE_PARAM), None)
    if not route:
        return scope
    remaining = [(k, v) for k, v in params if k != _ROUTE_PARAM]
    scope = dict(scope)
    scope["path"] = route
    scope["raw_path"] = route.encode()
    scope["query_string"] = urlencode(remaining).encode()
    return scope


async def app(scope, receive, send):
    if scope["type"] == "http":
        scope = _restore_path(scope)
    await _app(scope, receive, send)
