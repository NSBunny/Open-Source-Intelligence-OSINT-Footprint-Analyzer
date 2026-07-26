"""
TraceGuard 2.0 — Correlation Engine
Cross-references findings across platforms and data sources to build
an identity-link map with confidence scores.
"""

from __future__ import annotations

import logging
from typing import Any

from modules.mock.data import (
    get_mock_correlations,
    get_mock_social_profiles,
    get_mock_web_mentions,
)
from config import settings

logger = logging.getLogger("traceguard.correlation")


async def correlate(
    email: str,
    username: str,
    name: str,
    findings: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Cross-reference an identity across platforms and data sources.

    Parameters
    ----------
    email    : target email
    username : target username (may be empty)
    name     : target full name (may be empty)
    findings : other scan results collected so far (breaches, etc.)

    Returns
    -------
    dict with keys:
        social_profiles – list of discovered profiles
        web_mentions    – list of web mentions / documents
        correlations    – cross-reference map with confidence scores
        identity_summary – aggregated identity cluster
    """

    if settings.USE_MOCK_DATA:
        return _mock_correlate(email, username, name)

    # ── Live correlation (best-effort) ─────────────────────────────────
    return await _live_correlate(email, username, name, findings or {})


# ── Live implementation (stubbed for future API integrations) ──────────────

async def _live_correlate(
    email: str,
    username: str,
    name: str,
    findings: dict[str, Any],
) -> dict[str, Any]:
    """
    Perform live cross-platform correlation.
    Currently falls back to mock data for platforms that don't have
    an API integration yet.
    """
    # TODO: integrate real APIs (GitHub, Hunter.io, Sherlock-style checks)
    logger.info("Live correlation not fully implemented; using enriched mock.")
    return _mock_correlate(email, username, name)


# ── Mock implementation ───────────────────────────────────────────────────

def _mock_correlate(email: str, username: str, name: str) -> dict[str, Any]:
    """Build a rich correlation map from mock data."""
    social_profiles = get_mock_social_profiles(username)
    web_mentions = get_mock_web_mentions()
    correlations = get_mock_correlations()

    # Override identity cluster with the provided input
    correlations["identity_cluster"]["primary_email"] = email or "demo@traceguard.io"
    if username:
        correlations["identity_cluster"]["aliases"].insert(0, username)

    # ── Build per-platform confidence map ──────────────────────────────
    platform_confidence: dict[str, float] = {}
    for profile in social_profiles:
        platform_confidence[profile["platform"]] = profile["confidence"]

    # ── Aggregate identity summary ─────────────────────────────────────
    identity_summary = {
        "email": email or "demo@traceguard.io",
        "username": username or "johndoe",
        "name": name or "John Doe",
        "platforms_found": len(social_profiles),
        "mentions_found": len(web_mentions),
        "breaches_linked": correlations.get("identity_cluster", {}).get(
            "linked_emails", []
        ),
        "overall_confidence": round(
            sum(platform_confidence.values()) / max(len(platform_confidence), 1), 1
        ),
        "risk_indicators": _extract_risk_indicators(web_mentions),
    }

    return {
        "social_profiles": social_profiles,
        "web_mentions": web_mentions,
        "correlations": correlations,
        "identity_summary": identity_summary,
        "platform_confidence": platform_confidence,
    }


# ── Helpers ────────────────────────────────────────────────────────────────

def _extract_risk_indicators(mentions: list[dict[str, Any]]) -> list[str]:
    """Pull out the most concerning risk signals from web mentions."""
    indicators: list[str] = []
    for m in mentions:
        if m.get("riskLevel") in ("HIGH", "CRITICAL"):
            for sd in m.get("sensitiveData", []):
                readable = sd.replace("_", " ").title()
                indicators.append(f"{readable} exposed ({m['source']})")
    return indicators
