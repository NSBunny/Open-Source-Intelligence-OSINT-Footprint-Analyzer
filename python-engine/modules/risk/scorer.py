"""
TraceGuard 2.0 — Risk Scorer
Calculates a composite OSINT risk score (0-100) from scan findings.

Formula weights:
    0.35 × breach_severity
    0.25 × sensitive_data
    0.20 × public_mentions
    0.10 × correlation
    0.10 × confidence
"""

from __future__ import annotations

from typing import Any


def calculate_risk_score(findings: dict[str, Any]) -> dict[str, Any]:
    """
    Compute a weighted risk score from all scan findings.

    Returns
    -------
    dict with keys:
        score        – int 0-100
        category     – SAFE | MODERATE | HIGH | CRITICAL
        breakdown    – dict of component scores
        methodology  – human-readable explanation
    """

    breach_score = _score_breaches(findings.get("breach_results", {}))
    sensitive_score = _score_sensitive_data(findings.get("correlation_results", {}))
    mentions_score = _score_public_mentions(findings.get("correlation_results", {}))
    correlation_score = _score_correlation(findings.get("correlation_results", {}))
    confidence_score = _score_confidence(findings.get("correlation_results", {}))

    weighted = (
        0.35 * breach_score
        + 0.25 * sensitive_score
        + 0.20 * mentions_score
        + 0.10 * correlation_score
        + 0.10 * confidence_score
    )

    score = min(100, max(0, round(weighted)))
    category = _categorise(score)

    return {
        "score": score,
        "category": category,
        "breakdown": {
            "breach_severity": {
                "weight": 0.35,
                "raw_score": breach_score,
                "weighted": round(0.35 * breach_score, 2),
                "detail": _breach_detail(findings.get("breach_results", {})),
            },
            "sensitive_data_exposure": {
                "weight": 0.25,
                "raw_score": sensitive_score,
                "weighted": round(0.25 * sensitive_score, 2),
                "detail": "PII, credentials, and infrastructure info found online",
            },
            "public_mentions": {
                "weight": 0.20,
                "raw_score": mentions_score,
                "weighted": round(0.20 * mentions_score, 2),
                "detail": "Web footprint across forums, news, and social media",
            },
            "cross_platform_correlation": {
                "weight": 0.10,
                "raw_score": correlation_score,
                "weighted": round(0.10 * correlation_score, 2),
                "detail": "Strength of identity links between platforms",
            },
            "data_confidence": {
                "weight": 0.10,
                "raw_score": confidence_score,
                "weighted": round(0.10 * confidence_score, 2),
                "detail": "Overall reliability of collected intelligence",
            },
        },
        "methodology": (
            "TraceGuard Risk Score v2.0 — Composite score calculated as: "
            "0.35 × breach_severity + 0.25 × sensitive_data_exposure + "
            "0.20 × public_mentions + 0.10 × cross_platform_correlation + "
            "0.10 × data_confidence. Each component is normalised to 0-100 "
            "before weighting."
        ),
    }


# ── Component scorers ─────────────────────────────────────────────────────

_SEVERITY_WEIGHT = {"CRITICAL": 100, "HIGH": 80, "MEDIUM": 50, "LOW": 20}


def _score_breaches(breach_data: dict[str, Any]) -> float:
    """Score based on breach count and severity."""
    breaches = breach_data.get("breaches", [])
    if not breaches:
        return 0.0

    severity_total = sum(
        _SEVERITY_WEIGHT.get(b.get("severity", "LOW"), 20) for b in breaches
    )
    avg_severity = severity_total / len(breaches)

    # Amplify for many breaches (diminishing returns)
    count_factor = min(1.0, len(breaches) / 5)

    # Check for password exposure
    has_passwords = any(
        any("password" in dc.lower() for dc in b.get("dataClasses", []))
        for b in breaches
    )
    password_penalty = 15 if has_passwords else 0

    return min(100, avg_severity * count_factor + password_penalty)


def _score_sensitive_data(corr: dict[str, Any]) -> float:
    """Score based on types of sensitive data found in mentions."""
    mentions = corr.get("web_mentions", [])
    if not mentions:
        return 0.0

    risk_weights = {"CRITICAL": 100, "HIGH": 80, "MEDIUM": 40, "LOW": 10}
    sensitive_types: set[str] = set()
    risk_total = 0.0

    for m in mentions:
        risk_total += risk_weights.get(m.get("riskLevel", "LOW"), 10)
        sensitive_types.update(m.get("sensitiveData", []))

    avg_risk = risk_total / len(mentions)
    diversity_bonus = min(30, len(sensitive_types) * 4)

    return min(100, avg_risk + diversity_bonus)


def _score_public_mentions(corr: dict[str, Any]) -> float:
    """Score based on volume and reach of public mentions."""
    mentions = corr.get("web_mentions", [])
    profiles = corr.get("social_profiles", [])
    total = len(mentions) + len(profiles)
    if total == 0:
        return 0.0

    # More exposure = higher score (diminishing returns)
    return min(100, total * 10)


def _score_correlation(corr: dict[str, Any]) -> float:
    """Score based on cross-reference confidence."""
    xrefs = corr.get("correlations", {}).get("cross_references", [])
    if not xrefs:
        return 0.0

    avg_conf = sum(x.get("confidence", 0) for x in xrefs) / len(xrefs)
    link_bonus = min(30, len(xrefs) * 5)

    return min(100, avg_conf * 0.7 + link_bonus)


def _score_confidence(corr: dict[str, Any]) -> float:
    """Overall data confidence (higher = we trust the data more → higher risk if negative)."""
    profiles = corr.get("social_profiles", [])
    mentions = corr.get("web_mentions", [])
    all_items = profiles + mentions

    if not all_items:
        return 0.0

    confidences = [item.get("confidence", 50) for item in all_items]
    return sum(confidences) / len(confidences)


# ── Helpers ────────────────────────────────────────────────────────────────

def _categorise(score: int) -> str:
    if score <= 25:
        return "SAFE"
    if score <= 50:
        return "MODERATE"
    if score <= 75:
        return "HIGH"
    return "CRITICAL"


def _breach_detail(breach_data: dict[str, Any]) -> str:
    breaches = breach_data.get("breaches", [])
    if not breaches:
        return "No breaches detected"
    names = [b.get("name", "Unknown") for b in breaches]
    return f"{len(breaches)} breaches found: {', '.join(names)}"
