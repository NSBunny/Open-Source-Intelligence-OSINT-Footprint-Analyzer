"""
TraceGuard 2.0 — Shodan Threat Intelligence Module
Queries the Shodan API for open ports, exposed services, SSL certificates,
and host vulnerabilities associated with a target domain or IP.
"""

from __future__ import annotations

import logging
from typing import Any
import httpx

from config import settings

logger = logging.getLogger("traceguard.shodan")


async def scan_shodan(target: str) -> dict[str, Any]:
    """
    Query Shodan for threat intelligence on a domain or IP.
    """
    if not settings.SHODAN_API_KEY:
        logger.info("Shodan API key not provided, skipping Shodan scan.")
        return {"shodan_found": False, "hosts": []}

    domain = target.split("@")[-1] if "@" in target else target
    url = "https://api.shodan.io/shodan/host/search"
    params = {
        "key": settings.SHODAN_API_KEY,
        "query": f"hostname:{domain}" if not domain.replace(".", "").isdigit() else domain,
    }

    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            res = await client.get(url, params=params)
            if res.status_code == 200:
                data = res.json()
                matches = data.get("matches", [])
                hosts = []
                for m in matches[:5]:
                    hosts.append({
                        "ip": m.get("ip_str", ""),
                        "port": m.get("port", 0),
                        "org": m.get("org", "Unknown"),
                        "product": m.get("product", "Exposed Service"),
                        "vulns": list(m.get("vulns", {}).keys()),
                        "location": f"{m.get('location', {}).get('city', '')}, {m.get('location', {}).get('country_name', '')}",
                    })
                return {
                    "shodan_found": True,
                    "total_hosts": data.get("total", 0),
                    "hosts": hosts,
                    "query": domain,
                }
        except Exception as exc:
            logger.warning("Shodan API query failed: %s", exc)

    return {"shodan_found": False, "hosts": []}
