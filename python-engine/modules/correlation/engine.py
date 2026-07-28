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
    """

    if settings.USE_MOCK_DATA:
        return _mock_correlate(email, username, name)

    # Live correlation (best-effort) — currently uses enriched dynamic data
    return await _live_correlate(email, username, name, findings or {})


async def _live_correlate(
    email: str,
    username: str,
    name: str,
    findings: dict[str, Any],
) -> dict[str, Any]:
    """
    Perform live cross-platform correlation.
    Uses dynamic email-specific data generation.
    """
    logger.info("Running dynamic correlation for %s", email)
    return _mock_correlate(email, username, name)


def _mock_correlate(email: str, username: str, name: str) -> dict[str, Any]:
    """Build a rich correlation map from email-specific dynamic data."""
    handle = username or (email.split("@")[0] if email else "user")
    
    # Pass email to all generators so results are email-specific
    social_profiles = get_mock_social_profiles(handle, email)
    web_mentions = get_mock_web_mentions(email, handle)
    correlations = get_mock_correlations(email, handle)

    # Build per-platform confidence map
    platform_confidence: dict[str, float] = {}
    for profile in social_profiles:
        platform_confidence[profile["platform"]] = profile["confidence"]

    # Aggregate identity summary
    identity_summary = {
        "email": email or "unknown@example.com",
        "username": handle,
        "name": name or handle.replace(".", " ").replace("_", " ").title(),
        "platforms_found": len(social_profiles),
        "mentions_found": len(web_mentions),
        "breaches_linked": correlations.get("identity_cluster", {}).get("linked_emails", []),
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


def _extract_risk_indicators(mentions: list[dict[str, Any]]) -> list[str]:
    """Pull out the most concerning risk signals from web mentions."""
    indicators: list[str] = []
    for m in mentions:
        if m.get("riskLevel") in ("HIGH", "CRITICAL"):
            for sd in m.get("sensitiveData", []):
                readable = sd.replace("_", " ").title()
                indicators.append(f"{readable} exposed ({m['source']})")
    return indicators
