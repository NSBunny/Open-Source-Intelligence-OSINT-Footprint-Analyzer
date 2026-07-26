"""
TraceGuard 2.0 — Recommendation Engine
Generates actionable security recommendations based on findings.
Supports Groq (Llama 3.3 70B), Google Gemini, OpenAI, and template fallback.
"""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from config import settings

logger = logging.getLogger("traceguard.recommendation")


async def generate_recommendations(
    findings: dict[str, Any],
    risk_score: dict[str, Any],
) -> dict[str, Any]:
    """
    Produce a threat summary, attack vectors, and remediation steps.

    Parameters
    ----------
    findings   : combined scan findings (breaches, correlations, etc.)
    risk_score : output of calculate_risk_score()

    Returns
    -------
    dict with keys:
        threat_summary    – narrative string
        attack_vectors    – list of {name, probability, description}
        remediation_steps – ordered list of actionable steps
        source            – "groq" | "gemini" | "openai" | "template"
    """

    # Try configured AI provider first
    if settings.has_ai:
        try:
            if settings.AI_PROVIDER == "groq" and settings.has_groq:
                return await _groq_recommendations(findings, risk_score)
            elif settings.AI_PROVIDER == "gemini" and settings.has_gemini:
                return await _gemini_recommendations(findings, risk_score)
            elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
                return await _openai_recommendations(findings, risk_score)
            elif settings.has_groq:
                return await _groq_recommendations(findings, risk_score)
            elif settings.has_gemini:
                return await _gemini_recommendations(findings, risk_score)
        except Exception as exc:
            logger.warning("AI provider (%s) failed, using templates: %s", settings.AI_PROVIDER, exc)

    return _template_recommendations(findings, risk_score)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GROQ-POWERED RECOMMENDATIONS (Llama 3.3 70B Versatile)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def _groq_recommendations(
    findings: dict[str, Any],
    risk_score: dict[str, Any],
) -> dict[str, Any]:
    """Call Groq API (Llama 3.3 70B) for ultra-fast AI-powered OSINT analysis."""
    prompt = _build_system_prompt(findings, risk_score)

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "You are a elite cybersecurity analyst & OSINT threat intelligence engine. You respond strictly in valid JSON format."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 2048,
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    text = data["choices"][0]["message"]["content"]
    result = json.loads(text)
    result["source"] = "groq (llama-3.3-70b)"
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GEMINI-POWERED RECOMMENDATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def _gemini_recommendations(
    findings: dict[str, Any],
    risk_score: dict[str, Any],
) -> dict[str, Any]:
    """Call Gemini API for AI-powered analysis."""
    prompt = _build_system_prompt(findings, risk_score)

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    result = json.loads(text)
    result["source"] = "gemini-1.5-flash"
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OPENAI-POWERED RECOMMENDATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def _openai_recommendations(
    findings: dict[str, Any],
    risk_score: dict[str, Any],
) -> dict[str, Any]:
    """Call OpenAI API for AI-powered analysis."""
    prompt = _build_system_prompt(findings, risk_score)

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are an elite cybersecurity analyst. Respond strictly in JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    text = data["choices"][0]["message"]["content"]
    result = json.loads(text)
    result["source"] = "openai (gpt-4o-mini)"
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT BUILDER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _build_system_prompt(findings: dict[str, Any], risk_score: dict[str, Any]) -> str:
    """Construct a structured prompt for AI models."""

    breach_names = [
        b["name"]
        for b in findings.get("breach_results", {}).get("breaches", [])
    ]
    score = risk_score.get("score", 0)
    category = risk_score.get("category", "UNKNOWN")

    return f"""You are an elite cybersecurity analyst & OSINT threat intelligence advisor specializing in digital footprint risk assessments.

Analyze these OSINT findings for a target digital identity:
- Risk Score: {score}/100 ({category})
- Breaches Found: {', '.join(breach_names) or 'None'}
- Risk Breakdown: {json.dumps(risk_score.get('breakdown', {}), indent=2)}

Return a JSON object with EXACTLY these fields:
{{
  "threat_summary": "A 2-3 paragraph narrative threat assessment summarizing the digital footprint, key vulnerabilities, and risk posture.",
  "attack_vectors": [
    {{"name": "Vector name (e.g. Credential Stuffing)", "probability": "HIGH|MEDIUM|LOW", "description": "How an attacker could exploit this specific footprint"}}
  ],
  "remediation_steps": [
    "Step 1: Specific, prioritized action step...",
    "Step 2: Specific action step..."
  ]
}}

Be highly specific, professional, actionable, and reference the actual target footprint findings. Include at least 4 realistic attack vectors and 6 prioritized remediation steps."""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEMPLATE-BASED RECOMMENDATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _template_recommendations(
    findings: dict[str, Any],
    risk_score: dict[str, Any],
) -> dict[str, Any]:
    """Generate template-based recommendations without an AI API."""

    score = risk_score.get("score", 0)
    category = risk_score.get("category", "UNKNOWN")
    breaches = findings.get("breach_results", {}).get("breaches", [])
    correlations = findings.get("correlation_results", {})
    mentions = correlations.get("web_mentions", [])

    breach_names = [b["name"] for b in breaches]
    high_breaches = [b["name"] for b in breaches if b.get("severity") in ("HIGH", "CRITICAL")]

    threat_summary = (
        f"The target identity has a digital footprint risk score of {score}/100 "
        f"({category}). Analysis identified {len(breaches)} data breach exposures "
        f"({', '.join(breach_names)}), of which {len(high_breaches)} are classified "
        f"as high severity. "
    )

    if mentions:
        critical_mentions = [m for m in mentions if m.get("riskLevel") in ("HIGH", "CRITICAL")]
        threat_summary += (
            f"Additionally, {len(mentions)} web mentions were discovered, "
            f"including {len(critical_mentions)} high-risk exposures containing "
            f"sensitive personal data such as physical addresses, phone numbers, "
            f"and credential fragments. "
        )

    profiles = correlations.get("social_profiles", [])
    if profiles:
        threat_summary += (
            f"Cross-platform correlation identified {len(profiles)} linked "
            f"social profiles with an average confidence of "
            f"{correlations.get('identity_summary', {}).get('overall_confidence', 0)}%. "
            f"This level of exposure creates a substantial attack surface for "
            f"social engineering, credential stuffing, and targeted phishing."
        )

    attack_vectors = _build_attack_vectors(breaches, mentions, profiles)
    remediation_steps = _build_remediation_steps(breaches, mentions, category)

    return {
        "threat_summary": threat_summary,
        "attack_vectors": attack_vectors,
        "remediation_steps": remediation_steps,
        "source": "template",
    }


def _build_attack_vectors(
    breaches: list[dict],
    mentions: list[dict],
    profiles: list[dict],
) -> list[dict[str, str]]:
    vectors: list[dict[str, str]] = []

    has_passwords = any(
        any("password" in dc.lower() for dc in b.get("dataClasses", []))
        for b in breaches
    )
    if has_passwords:
        vectors.append({
            "name": "Credential Stuffing Attack",
            "probability": "HIGH",
            "description": (
                "Breached passwords from known exposures can be "
                "tested against active accounts. If passwords were reused, "
                "attackers gain immediate access to email, cloud storage, "
                "and development platforms."
            ),
        })

    if breaches:
        vectors.append({
            "name": "Targeted Spear Phishing",
            "probability": "HIGH",
            "description": (
                "Leaked personal details enable highly convincing phishing emails. "
                "An attacker could impersonate trusted platforms to harvest current credentials."
            ),
        })

    has_phone = any(
        any("phone" in dc.lower() for dc in b.get("dataClasses", []))
        for b in breaches
    )
    if has_phone:
        vectors.append({
            "name": "SIM Swapping / Vishing",
            "probability": "MEDIUM",
            "description": (
                "Exposed phone numbers enable SIM swap attacks, potentially bypassing SMS-based 2FA."
            ),
        })

    pii_mentions = [m for m in mentions if m.get("riskLevel") in ("HIGH", "CRITICAL")]
    if pii_mentions:
        vectors.append({
            "name": "Identity Theft / Doxxing",
            "probability": "HIGH",
            "description": (
                "Publicly accessible PII combined with breached credentials provides sufficient data for identity theft."
            ),
        })

    if len(profiles) >= 3:
        vectors.append({
            "name": "Social Engineering via Profile Correlation",
            "probability": "MEDIUM",
            "description": (
                "Multiple correlated social profiles allow attackers to build a comprehensive psychological profile for targeted social engineering."
            ),
        })

    return vectors


def _build_remediation_steps(
    breaches: list[dict],
    mentions: list[dict],
    category: str,
) -> list[str]:
    steps: list[str] = []

    if breaches:
        breach_names = ", ".join(b["name"] for b in breaches)
        steps.append(
            f"🔑 IMMEDIATE: Change passwords on all accounts associated with "
            f"breached services ({breach_names}). Use unique passwords of 16+ characters via a password manager."
        )

    steps.append(
        "🛡️ CRITICAL: Enable hardware-key or TOTP-based two-factor authentication "
        "on all accounts. Avoid SMS-based 2FA due to SIM-swap risk."
    )

    steps.append(
        "🔍 HIGH: Submit data removal requests to major data brokers and invoke GDPR/CCPA right-to-deletion."
    )

    steps.append(
        "🌐 MEDIUM: Audit all social media privacy settings and set profile visibility to private or connections-only."
    )

    steps.append(
        "📧 MEDIUM: Create compartmentalised email addresses and use aliasing services (SimpleLogin, Firefox Relay) for new signups."
    )

    steps.append(
        "📊 ONGOING: Set up continuous monitoring with Have I Been Pwned alerts and periodic TraceGuard re-scans."
    )

    if category in ("HIGH", "CRITICAL"):
        steps.append(
            "⚠️ URGENT: Consider a credit freeze with major bureaus to prevent identity-theft-based account creation."
        )

    return steps
