"""
TraceGuard 2.0 — Breach Detection Engine
Scans for data breaches associated with an email address.
Uses LeakCheck public API when available, falls back to mock data.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from config import settings
from modules.mock.data import get_mock_breaches

logger = logging.getLogger("traceguard.breach")


async def scan_breaches(email: str) -> dict[str, Any]:
    """
    Scan for breaches linked to *email*.

    Returns
    -------
    dict with keys:
        breaches  – list of breach records
        total     – number of breaches found
        source    – "leakcheck_api" | "mock"
    """

    # ── Try live LeakCheck API first ────────────────────────────────────
    if settings.has_leakcheck and not settings.USE_MOCK_DATA:
        try:
            return await _leakcheck_scan(email)
        except Exception as exc:
            logger.warning("LeakCheck API failed, falling back to mock: %s", exc)

    # ── Mock fallback ──────────────────────────────────────────────────
    return _mock_scan(email)


# ── LeakCheck implementation ───────────────────────────────────────────────

async def _leakcheck_scan(email: str) -> dict[str, Any]:
    """Call the LeakCheck public API."""
    url = "https://leakcheck.io/api/public"
    params = {"check": email}
    headers = {}

    if settings.LEAKCHECK_API_KEY:
        headers["X-API-Key"] = settings.LEAKCHECK_API_KEY

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    breaches: list[dict[str, Any]] = []
    raw_results = data if isinstance(data, list) else data.get("result", [])

    for idx, item in enumerate(raw_results):
        breaches.append(
            {
                "id": f"breach-api-{idx}",
                "name": item.get("name", item.get("source", f"Unknown-{idx}")),
                "domain": item.get("domain", ""),
                "date": item.get("date", "Unknown"),
                "severity": _infer_severity(item),
                "pwnCount": item.get("pwnCount", 0),
                "dataClasses": item.get("dataClasses", []),
                "description": item.get("description", ""),
                "affectedEmail": email,
                "isVerified": item.get("isVerified", False),
                "isSensitive": item.get("isSensitive", False),
            }
        )

    return {
        "breaches": breaches,
        "total": len(breaches),
        "source": "leakcheck_api",
    }


# ── Mock implementation ───────────────────────────────────────────────────

def _mock_scan(email: str) -> dict[str, Any]:
    """Return rich mock breach data."""
    breaches = get_mock_breaches(email)
    return {
        "breaches": breaches,
        "total": len(breaches),
        "source": "mock",
    }


# ── Helpers ────────────────────────────────────────────────────────────────

def _infer_severity(item: dict[str, Any]) -> str:
    """Heuristic severity from data classes and breach size."""
    data_classes = [d.lower() for d in item.get("dataClasses", [])]
    has_passwords = any("password" in d for d in data_classes)
    has_phone = any("phone" in d for d in data_classes)
    pwn = item.get("pwnCount", 0)

    if has_passwords and (has_phone or pwn > 100_000_000):
        return "HIGH"
    if has_passwords or pwn > 50_000_000:
        return "MEDIUM"
    return "LOW"
