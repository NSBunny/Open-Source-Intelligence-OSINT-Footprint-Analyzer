"""
TraceGuard 2.0 — Exposure Graph Builder  ★ CORE MODULE ★
Transforms scan results into beautiful React Flow compatible graph JSON.

Node types : identity (center), platform, breach, document, mention, paste
Edge styles: animated for high-risk, colour-coded by severity
Layout     : radial — identity centre, breaches left, profiles right, mentions bottom
"""

from __future__ import annotations

import math
from typing import Any


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COLOUR PALETTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLORS = {
    "green": "#10b981",
    "yellow": "#f59e0b",
    "red": "#ef4444",
    "blue": "#3b82f6",
    "purple": "#8b5cf6",
    "cyan": "#06b6d4",
    "orange": "#f97316",
    "pink": "#ec4899",
    "slate": "#64748b",
    "identity": "#6366f1",  # indigo for the central node
}

SEVERITY_COLOR = {
    "CRITICAL": COLORS["red"],
    "HIGH": COLORS["red"],
    "MEDIUM": COLORS["yellow"],
    "LOW": COLORS["green"],
}

RISK_COLOR = {
    "CRITICAL": COLORS["red"],
    "HIGH": COLORS["orange"],
    "MEDIUM": COLORS["yellow"],
    "LOW": COLORS["green"],
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PUBLIC API
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_exposure_graph(scan_results: dict[str, Any]) -> dict[str, Any]:
    """
    Build a React Flow compatible graph from aggregated scan results.

    Parameters
    ----------
    scan_results : dict containing breach_results, correlation_results, risk_score

    Returns
    -------
    dict with keys:
        nodes – list of React Flow node objects
        edges – list of React Flow edge objects
        stats – graph statistics (node counts, edge counts by type)
    """

    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []

    identity = scan_results.get("correlation_results", {}).get("identity_summary", {})
    breaches = scan_results.get("breach_results", {}).get("breaches", [])
    profiles = scan_results.get("correlation_results", {}).get("social_profiles", [])
    mentions = scan_results.get("correlation_results", {}).get("web_mentions", [])
    correlations = scan_results.get("correlation_results", {}).get("correlations", {})
    risk = scan_results.get("risk_score", {})

    # ── 1. Identity Node (centre) ─────────────────────────────────────
    identity_node = _create_identity_node(identity, risk)
    nodes.append(identity_node)

    # ── 2. Breach Nodes (left arc) ────────────────────────────────────
    breach_positions = _radial_positions(
        count=len(breaches),
        center_x=-380,
        center_y=0,
        radius=180,
        start_angle=120,
        end_angle=240,
    )
    for i, breach in enumerate(breaches):
        node = _create_breach_node(breach, breach_positions[i])
        nodes.append(node)
        edges.append(_create_edge(
            source="identity-center",
            target=node["id"],
            label=_breach_edge_label(breach),
            severity=breach.get("severity", "MEDIUM"),
            edge_type="breach",
        ))

    # ── 3. Social Profile Nodes (right arc) ───────────────────────────
    profile_positions = _radial_positions(
        count=len(profiles),
        center_x=380,
        center_y=0,
        radius=180,
        start_angle=-60,
        end_angle=60,
    )
    for i, profile in enumerate(profiles):
        node = _create_profile_node(profile, profile_positions[i])
        nodes.append(node)
        edges.append(_create_edge(
            source="identity-center",
            target=node["id"],
            label=_profile_edge_label(profile),
            severity="LOW" if profile.get("confidence", 0) > 70 else "MEDIUM",
            edge_type="profile",
        ))

    # ── 4. Web Mention / Document Nodes (bottom arc) ──────────────────
    mention_positions = _radial_positions(
        count=len(mentions),
        center_x=0,
        center_y=400,
        radius=220,
        start_angle=240,
        end_angle=300,
    )
    for i, mention in enumerate(mentions):
        node = _create_mention_node(mention, mention_positions[i])
        nodes.append(node)
        edges.append(_create_edge(
            source="identity-center",
            target=node["id"],
            label=_mention_edge_label(mention),
            severity=mention.get("riskLevel", "LOW"),
            edge_type="mention",
        ))

    # ── 5. Cross-Reference Edges (between non-identity nodes) ─────────
    xref_edges = _build_cross_reference_edges(
        correlations.get("cross_references", []),
        nodes,
    )
    edges.extend(xref_edges)

    # ── 6. Graph Stats ────────────────────────────────────────────────
    stats = _build_stats(nodes, edges, breaches, profiles, mentions)

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": stats,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NODE CREATORS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _create_identity_node(
    identity: dict[str, Any],
    risk: dict[str, Any],
) -> dict[str, Any]:
    """Central identity node — the focal point of the graph."""
    score = risk.get("score", 0)
    category = risk.get("category", "UNKNOWN")

    # Pick colour based on risk category
    if category == "CRITICAL":
        border_color = COLORS["red"]
    elif category == "HIGH":
        border_color = COLORS["orange"]
    elif category == "MODERATE":
        border_color = COLORS["yellow"]
    else:
        border_color = COLORS["green"]

    return {
        "id": "identity-center",
        "type": "identity",
        "position": {"x": 0, "y": 0},
        "data": {
            "label": identity.get("name", "Unknown"),
            "email": identity.get("email", ""),
            "username": identity.get("username", ""),
            "riskScore": score,
            "riskCategory": category,
            "platformsFound": identity.get("platforms_found", 0),
            "mentionsFound": identity.get("mentions_found", 0),
            "icon": "user-shield",
            "color": COLORS["identity"],
            "borderColor": border_color,
            "size": "large",
        },
        "style": {
            "background": f"linear-gradient(135deg, {COLORS['identity']}22, {border_color}22)",
            "border": f"3px solid {border_color}",
            "borderRadius": "50%",
            "width": 140,
            "height": 140,
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "boxShadow": f"0 0 25px {border_color}44, 0 0 50px {border_color}22",
            "fontSize": "13px",
            "fontWeight": "bold",
            "color": "#f8fafc",
        },
    }


def _create_breach_node(
    breach: dict[str, Any],
    position: dict[str, float],
) -> dict[str, Any]:
    """A breach node — shown on the left side of the graph."""
    severity = breach.get("severity", "MEDIUM")
    color = SEVERITY_COLOR.get(severity, COLORS["yellow"])
    pwn_count = breach.get("pwnCount", 0)
    pwn_label = _format_count(pwn_count)

    return {
        "id": breach.get("id", f"breach-{breach['name'].lower()}"),
        "type": "breach",
        "position": position,
        "data": {
            "label": breach["name"],
            "date": breach.get("date", "Unknown"),
            "severity": severity,
            "pwnCount": pwn_count,
            "pwnCountFormatted": pwn_label,
            "dataClasses": breach.get("dataClasses", []),
            "description": breach.get("description", ""),
            "icon": "shield-alert",
            "color": color,
            "logoUrl": breach.get("logoUrl", ""),
        },
        "style": {
            "background": f"{color}15",
            "border": f"2px solid {color}",
            "borderRadius": "12px",
            "padding": "12px 16px",
            "minWidth": 150,
            "boxShadow": f"0 4px 15px {color}30",
            "fontSize": "12px",
            "color": "#f1f5f9",
        },
    }


def _create_profile_node(
    profile: dict[str, Any],
    position: dict[str, float],
) -> dict[str, Any]:
    """A social platform node — shown on the right side."""
    confidence = profile.get("confidence", 50)
    if confidence >= 85:
        color = COLORS["blue"]
    elif confidence >= 70:
        color = COLORS["cyan"]
    else:
        color = COLORS["slate"]

    platform = profile.get("platform", "Unknown")
    icon_map = {
        "GitHub": "github",
        "LinkedIn": "linkedin",
        "Twitter / X": "twitter",
        "Personal Blog": "globe",
    }

    return {
        "id": profile.get("id", f"social-{platform.lower().replace(' ', '-')}"),
        "type": "platform",
        "position": position,
        "data": {
            "label": platform,
            "username": profile.get("username", ""),
            "profileUrl": profile.get("profileUrl", ""),
            "bio": profile.get("bio", ""),
            "confidence": confidence,
            "matchType": profile.get("matchType", ""),
            "lastActive": profile.get("lastActive", ""),
            "metadata": profile.get("metadata", {}),
            "icon": icon_map.get(platform, "user"),
            "color": color,
        },
        "style": {
            "background": f"{color}15",
            "border": f"2px solid {color}",
            "borderRadius": "12px",
            "padding": "12px 16px",
            "minWidth": 140,
            "boxShadow": f"0 4px 15px {color}25",
            "fontSize": "12px",
            "color": "#f1f5f9",
        },
    }


def _create_mention_node(
    mention: dict[str, Any],
    position: dict[str, float],
) -> dict[str, Any]:
    """A web mention / document / paste node — shown at the bottom."""
    risk_level = mention.get("riskLevel", "LOW")
    mention_type = mention.get("type", "mention")
    color = RISK_COLOR.get(risk_level, COLORS["green"])

    type_map = {
        "document": "document",
        "mention": "mention",
        "paste": "paste",
    }
    icon_map = {
        "document": "file-text",
        "mention": "search",
        "paste": "clipboard",
    }

    return {
        "id": mention.get("id", f"mention-{mention_type}"),
        "type": type_map.get(mention_type, "mention"),
        "position": position,
        "data": {
            "label": mention.get("title", "Web Mention"),
            "url": mention.get("url", ""),
            "source": mention.get("source", ""),
            "snippet": mention.get("snippet", ""),
            "riskLevel": risk_level,
            "sensitiveData": mention.get("sensitiveData", []),
            "dateFound": mention.get("dateFound", ""),
            "confidence": mention.get("confidence", 50),
            "icon": icon_map.get(mention_type, "search"),
            "color": color,
        },
        "style": {
            "background": f"{color}12",
            "border": f"2px solid {color}88",
            "borderRadius": "10px",
            "padding": "10px 14px",
            "minWidth": 130,
            "boxShadow": f"0 3px 12px {color}20",
            "fontSize": "11px",
            "color": "#e2e8f0",
        },
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EDGE CREATORS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _create_edge(
    source: str,
    target: str,
    label: str,
    severity: str = "LOW",
    edge_type: str = "default",
) -> dict[str, Any]:
    """Create a React Flow edge with style based on severity."""
    color = SEVERITY_COLOR.get(severity, COLORS["slate"])
    is_animated = severity in ("HIGH", "CRITICAL")

    # Thicker edges for higher severity
    stroke_width_map = {"CRITICAL": 3, "HIGH": 2.5, "MEDIUM": 2, "LOW": 1.5}
    stroke_width = stroke_width_map.get(severity, 1.5)

    return {
        "id": f"edge-{source}-{target}",
        "source": source,
        "target": target,
        "label": label,
        "animated": is_animated,
        "type": "smoothstep",
        "style": {
            "stroke": color,
            "strokeWidth": stroke_width,
            "opacity": 0.8,
        },
        "labelStyle": {
            "fill": color,
            "fontWeight": 600,
            "fontSize": "10px",
            "background": "#0f172a",
            "padding": "2px 6px",
            "borderRadius": "4px",
        },
        "labelBgStyle": {
            "fill": "#0f172aee",
            "stroke": color,
            "strokeWidth": 0.5,
            "borderRadius": "4px",
        },
        "markerEnd": {
            "type": "arrowclosed",
            "color": color,
            "width": 16,
            "height": 16,
        },
        "data": {
            "edgeType": edge_type,
            "severity": severity,
        },
    }


def _build_cross_reference_edges(
    xrefs: list[dict[str, Any]],
    nodes: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Create edges between non-identity nodes based on correlation data.
    These represent discovered links between platforms/breaches.
    """
    edges: list[dict[str, Any]] = []

    # Build a lookup: platform/source name → node id
    name_to_id: dict[str, str] = {}
    for node in nodes:
        label = node.get("data", {}).get("label", "")
        name_to_id[label] = node["id"]
        # Also map source names for mentions
        source = node.get("data", {}).get("source", "")
        if source:
            name_to_id[source] = node["id"]

    for xref in xrefs:
        src_name = xref.get("source", "")
        tgt_name = xref.get("target", "")
        src_id = name_to_id.get(src_name)
        tgt_id = name_to_id.get(tgt_name)

        if not src_id or not tgt_id or src_id == tgt_id:
            continue

        confidence = xref.get("confidence", 50)
        link_type = xref.get("link_type", "unknown")

        severity = "HIGH" if confidence >= 90 else ("MEDIUM" if confidence >= 70 else "LOW")
        label = link_type.replace("_", " ").title()

        edge = _create_edge(
            source=src_id,
            target=tgt_id,
            label=label,
            severity=severity,
            edge_type="correlation",
        )
        # Add correlation-specific data
        edge["data"]["confidence"] = confidence
        edge["data"]["evidence"] = xref.get("evidence", "")
        # Use dashed stroke for cross-reference edges
        edge["style"]["strokeDasharray"] = "6 3"
        edge["style"]["opacity"] = 0.6

        edges.append(edge)

    return edges


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EDGE LABELS (contextual)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _breach_edge_label(breach: dict[str, Any]) -> str:
    """Generate a meaningful edge label for breach connections."""
    data_classes = [dc.lower() for dc in breach.get("dataClasses", [])]
    if any("password" in dc for dc in data_classes):
        return "🔓 password leaked"
    if any("phone" in dc for dc in data_classes):
        return "📱 phone exposed"
    if any("email" in dc for dc in data_classes):
        return "📧 email found"
    return "⚠️ data exposed"


def _profile_edge_label(profile: dict[str, Any]) -> str:
    """Generate an edge label for profile connections."""
    match_type = profile.get("matchType", "")
    labels = {
        "username_exact": "👤 username match",
        "email_verified": "✉️ email verified",
        "username_partial": "🔍 partial match",
        "domain_whois": "🌐 WHOIS link",
    }
    return labels.get(match_type, "🔗 linked")


def _mention_edge_label(mention: dict[str, Any]) -> str:
    """Generate an edge label for web mention connections."""
    mention_type = mention.get("type", "mention")
    risk = mention.get("riskLevel", "LOW")
    labels = {
        "document": "📄 document found",
        "paste": "⚡ paste detected",
        "mention": "💬 mentioned",
    }
    base = labels.get(mention_type, "🔗 reference")
    if risk in ("HIGH", "CRITICAL"):
        return f"{base} ⚠️"
    return base


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYOUT HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _radial_positions(
    count: int,
    center_x: float,
    center_y: float,
    radius: float,
    start_angle: float = 0,
    end_angle: float = 360,
) -> list[dict[str, float]]:
    """
    Distribute *count* nodes along a radial arc.

    Angles are in degrees, measured clockwise from 12-o'clock.
    Returns list of {x, y} positions.
    """
    if count == 0:
        return []
    if count == 1:
        mid_angle = math.radians((start_angle + end_angle) / 2)
        return [{"x": center_x + radius * math.sin(mid_angle),
                 "y": center_y - radius * math.cos(mid_angle)}]

    positions: list[dict[str, float]] = []
    span = end_angle - start_angle
    step = span / (count - 1) if count > 1 else 0

    for i in range(count):
        angle_deg = start_angle + step * i
        angle_rad = math.radians(angle_deg)
        x = center_x + radius * math.sin(angle_rad)
        y = center_y - radius * math.cos(angle_rad)
        positions.append({"x": round(x, 1), "y": round(y, 1)})

    return positions


def _format_count(n: int) -> str:
    """Format large numbers: 152445165 → '152.4M'."""
    if n >= 1_000_000_000:
        return f"{n / 1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STATS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _build_stats(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
    breaches: list[dict[str, Any]],
    profiles: list[dict[str, Any]],
    mentions: list[dict[str, Any]],
) -> dict[str, Any]:
    """Compute summary statistics about the graph."""
    edge_types: dict[str, int] = {}
    animated_count = 0
    for edge in edges:
        et = edge.get("data", {}).get("edgeType", "unknown")
        edge_types[et] = edge_types.get(et, 0) + 1
        if edge.get("animated"):
            animated_count += 1

    node_types: dict[str, int] = {}
    for node in nodes:
        nt = node.get("type", "unknown")
        node_types[nt] = node_types.get(nt, 0) + 1

    return {
        "totalNodes": len(nodes),
        "totalEdges": len(edges),
        "nodeTypes": node_types,
        "edgeTypes": edge_types,
        "animatedEdges": animated_count,
        "breachCount": len(breaches),
        "profileCount": len(profiles),
        "mentionCount": len(mentions),
        "highRiskConnections": animated_count,
    }
