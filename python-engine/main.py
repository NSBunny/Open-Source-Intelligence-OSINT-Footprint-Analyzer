"""
TraceGuard 2.0 — Python OSINT Engine
FastAPI application that orchestrates all scan modules and returns
combined results with exposure graph, risk scores, and recommendations.

Run:  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import settings
from modules.breach.engine import scan_breaches
from modules.correlation.engine import correlate
from modules.graph.builder import build_exposure_graph
from modules.risk.scorer import calculate_risk_score
from modules.recommendation.engine import generate_recommendations
from modules.live_prober import probe_email_live
from modules.shodan_engine import scan_shodan

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-28s  %(levelname)-7s  %(message)s",
)
logger = logging.getLogger("traceguard.main")

# ── FastAPI App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="TraceGuard 2.0 — OSINT Engine",
    description=(
        "Async Python engine that powers breach detection, identity "
        "correlation, exposure graph generation, risk scoring, and "
        "AI-driven security recommendations."
    ),
    version="2.0.0",
)

# ── CORS (allow Express backend + React dev server) ───────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REQUEST / RESPONSE MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ScanRequest(BaseModel):
    email: str = Field(..., description="Target email address", examples=["demo@traceguard.io"])
    name: str = Field("", description="Target full name")
    username: str = Field("", description="Target username / handle")
    phone: str = Field("", description="Target phone number")


class ScanResponse(BaseModel):
    success: bool
    scan_id: str
    duration_ms: int
    input: dict[str, str]
    breach_results: dict[str, Any]
    correlation_results: dict[str, Any]
    risk_score: dict[str, Any]
    recommendations: dict[str, Any]
    exposure_graph: dict[str, Any]
    metadata: dict[str, Any]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/health")
async def health_check():
    """Health-check endpoint used by the Express backend."""
    return {
        "status": "healthy",
        "engine": "TraceGuard OSINT Engine v2.0",
        "mock_mode": settings.USE_MOCK_DATA,
        "apis": {
            "leakcheck": "configured" if settings.has_leakcheck else "not_configured",
            "gemini": "configured" if settings.has_gemini else "not_configured",
        },
    }


@app.post("/scan", response_model=ScanResponse)
async def run_scan(request: ScanRequest):
    """
    Run a full OSINT scan — the primary endpoint.

    1. Breach detection + identity correlation run concurrently
    2. Risk score is calculated from combined findings
    3. Recommendations are generated (AI or template)
    4. Exposure graph is built from everything
    """
    start = time.perf_counter()
    scan_id = f"scan-{int(time.time())}"

    logger.info(
        "▶ Scan %s started  email=%s  username=%s  name=%s",
        scan_id,
        request.email,
        request.username,
        request.name,
    )

    try:
        # ── Phase 1: Concurrent data collection ───────────────────────
        breach_task = scan_breaches(request.email)
        corr_task = correlate(
            email=request.email,
            username=request.username,
            name=request.name,
            findings=None,  # first pass — no findings yet
        )
        live_task = probe_email_live(request.email, request.username)
        shodan_task = scan_shodan(request.email)

        breach_results, correlation_results, live_results, shodan_results = await asyncio.gather(
            breach_task,
            corr_task,
            live_task,
            shodan_task,
            return_exceptions=True
        )

        # Merge live prober findings if successful
        if isinstance(live_results, dict):
            live_breaches = live_results.get("breaches", [])
            if live_breaches and isinstance(breach_results, dict):
                breach_results["breaches"] = (breach_results.get("breaches", []) or []) + live_breaches
                breach_results["total"] = len(breach_results["breaches"])

            live_social = live_results.get("social_profiles", [])
            if live_social and isinstance(correlation_results, dict):
                correlation_results["social_profiles"] = (correlation_results.get("social_profiles", []) or []) + live_social

            live_mentions = live_results.get("web_mentions", [])
            if live_mentions and isinstance(correlation_results, dict):
                correlation_results["web_mentions"] = (correlation_results.get("web_mentions", []) or []) + live_mentions

        # ── Phase 2: Risk scoring ─────────────────────────────────────
        combined_findings = {
            "breach_results": breach_results,
            "correlation_results": correlation_results,
        }
        risk_score = calculate_risk_score(combined_findings)

        # ── Phase 3: Recommendations ─────────────────────────────────
        recommendations = await generate_recommendations(
            combined_findings,
            risk_score,
        )

        # ── Phase 4: Exposure graph (the killer feature) ─────────────
        graph_input = {
            **combined_findings,
            "risk_score": risk_score,
        }
        exposure_graph = build_exposure_graph(graph_input)

        # ── Assemble response ─────────────────────────────────────────
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        logger.info(
            "✓ Scan %s completed in %d ms  score=%d (%s)",
            scan_id,
            elapsed_ms,
            risk_score["score"],
            risk_score["category"],
        )

        return ScanResponse(
            success=True,
            scan_id=scan_id,
            duration_ms=elapsed_ms,
            input={
                "email": request.email,
                "name": request.name,
                "username": request.username,
                "phone": request.phone,
            },
            breach_results=breach_results,
            correlation_results=correlation_results,
            risk_score=risk_score,
            recommendations=recommendations,
            exposure_graph=exposure_graph,
            metadata={
                "engine_version": "2.0.0",
                "mock_mode": settings.USE_MOCK_DATA,
                "data_sources": {
                    "breaches": breach_results.get("source", "unknown"),
                    "recommendations": recommendations.get("source", "unknown"),
                },
                "graph_stats": exposure_graph.get("stats", {}),
            },
        )

    except Exception as exc:
        logger.exception("✗ Scan %s failed: %s", scan_id, exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STARTUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.on_event("startup")
async def on_startup():
    logger.info("═" * 60)
    logger.info("  TraceGuard 2.0 — OSINT Engine starting")
    logger.info("  Mock mode : %s", settings.USE_MOCK_DATA)
    logger.info("  LeakCheck : %s", "✓" if settings.has_leakcheck else "✗ (using mock)")
    logger.info("  Gemini    : %s", "✓" if settings.has_gemini else "✗ (using templates)")
    logger.info("═" * 60)


# ── Dev entry-point ────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
