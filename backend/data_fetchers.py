"""
Free public APIs only: PubMed NCBI E-utilities, no paid or commercial APIs.
Rate limit: 3 requests/second without API key; with API key higher. We use no key for compliance.
Provenance: fetched data must be cached and cited (PMID, query date).
"""

import time
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

# Rate limit: 3 req/s without key. Sleep between batches.
NCBI_RATE_DELAY = 0.34


def _fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "PinkRibbon/1.0 (research)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def pubmed_search(
    query: str,
    retmax: int = 20,
    mindate: Optional[str] = None,
    article_type: Optional[List[str]] = None,
) -> List[str]:
    """
    Search PubMed. Free. Returns list of PMIDs.
    query: e.g. "breast cancer adjuvant chemotherapy meta-analysis"
    mindate: YYYY/MM/DD
    article_type: filter e.g. ["Randomized Controlled Trial", "Meta-Analysis"]
    """
    params: Dict[str, str] = {
        "db": "pubmed",
        "term": query,
        "retmax": str(retmax),
        "retmode": "json",
    }
    if mindate:
        params["mindate"] = mindate
    if article_type:
        params["article_type"] = " ".join(article_type)
    qs = urllib.parse.urlencode(params)
    url = f"{BASE_URL}/esearch.fcgi?{qs}"
    time.sleep(NCBI_RATE_DELAY)
    data = _fetch(url)
    import json
    try:
        j = json.loads(data)
        idlist = j.get("esearchresult", {}).get("idlist", [])
        return idlist
    except Exception:
        return []


def pubmed_summary(pmids: List[str]) -> List[Dict[str, Any]]:
    """Fetch summaries for PMIDs. Free. Returns list of dicts with title, source, pubdate, etc."""
    if not pmids:
        return []
    ids = ",".join(pmids[:200])
    url = f"{BASE_URL}/esummary.fcgi?db=pubmed&id={ids}&retmode=json"
    time.sleep(NCBI_RATE_DELAY)
    data = _fetch(url)
    import json
    try:
        j = json.loads(data)
        result = j.get("result", {})
        return [result[k] for k in result if k != "uids" and isinstance(result[k], dict)]
    except Exception:
        return []


def fetch_treatment_effect_citations(treatment_class: str) -> List[Dict[str, Any]]:
    """
    Optional: fetch recent RCT/meta-analysis citations for a treatment class for provenance.
    Does not parse effect sizes; params_treatment_effects uses curated values with PMID.
    Returns list of {pmid, title, source, pubdate} for documentation.
    """
    query = f"breast cancer {treatment_class} (randomized controlled trial[pt] OR meta-analysis[pt])"
    mindate = "2014/01/01"  # last 10 years
    pmids = pubmed_search(query, retmax=10, mindate=mindate)
    if not pmids:
        return []
    return pubmed_summary(pmids)
