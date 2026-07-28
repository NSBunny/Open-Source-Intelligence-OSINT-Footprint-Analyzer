/**
 * TraceGuard 2.0 — Backend Response Transformer
 *
 * The Express backend returns scan results in its own schema (with fields like
 * riskScore.overall, riskScore.tier, target, etc.), but the frontend ScanResult
 * type uses a different schema (riskScore.score, riskScore.category, query, graph,
 * threatSummary, etc.).
 *
 * This module bridges that gap by transforming the raw Express response into the
 * frontend-expected ScanResult shape.
 */

import type { ScanResult, Breach, SocialProfile, WebMention, TimelineEvent, GraphNode, GraphEdge, AttackVector, RemediationStep } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformBackendResult(raw: any, scanId: string, targetEmail?: string): ScanResult {
  const email = raw.target || targetEmail || "unknown@example.com";
  const username = email.split("@")[0] || "user";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  // ── Map breaches ────────────────────────────────────────────────
  const breaches: Breach[] = (raw.breaches || []).map((b: any, i: number) => ({
    id: b.id || `b-${i}`,
    name: b.name || "Unknown Breach",
    date: b.breachDate || b.date || "2023-01-01",
    severity: (b.severity || "medium").toLowerCase() as Breach["severity"],
    dataClasses: b.dataClasses || ["Email addresses"],
    pwnCount: b.pwnCount || 0,
    description: b.description || "Data exposed in breach.",
  }));

  // ── Map social profiles ─────────────────────────────────────────
  const socialProfiles: SocialProfile[] = (raw.socialProfiles || []).map((p: any, i: number) => ({
    id: p.id || `sp-${i}`,
    platform: p.platform || "Unknown",
    username: p.username || username,
    profileUrl: p.url || p.profileUrl || "#",
    displayName: p.displayName || p.username || displayName,
    bio: p.bio || "",
    avatarUrl: p.profileImageUrl || p.avatarUrl || undefined,
    followers: p.followers || 0,
    confidence: p.confidence || 80,
  }));

  // ── Map web mentions ────────────────────────────────────────────
  const webMentions: WebMention[] = (raw.webMentions || []).map((m: any, i: number) => ({
    id: m.id || `wm-${i}`,
    title: m.title || "Web Mention",
    url: m.url || "#",
    snippet: m.snippet || m.description || "",
    source: m.source || "Web",
    type: (m.type || "blog") as WebMention["type"],
    foundDate: m.dateFound || m.foundDate || new Date().toISOString(),
  }));

  // ── Map risk score ──────────────────────────────────────────────
  const rawScore = raw.riskScore?.overall ?? raw.riskScore?.score ?? 50;
  const rawTier = (raw.riskScore?.tier || raw.riskScore?.category || "MODERATE").toUpperCase();
  const breakdown = raw.riskScore?.breakdown || {};

  const riskScore = {
    score: rawScore,
    category: rawTier as "SAFE" | "MODERATE" | "HIGH" | "CRITICAL",
    breakdown: {
      breachSeverity: breakdown.breachSeverity ?? breakdown.breach_severity ?? 50,
      sensitiveData: breakdown.sensitiveDataExposure ?? breakdown.sensitive_data ?? 50,
      publicMentions: breakdown.publicMentions ?? breakdown.public_mentions ?? 50,
      profileCorrelation: breakdown.profileCorrelation ?? breakdown.correlation ?? 50,
      confidence: breakdown.confidence ?? 75,
    },
    methodology: "Score = 0.35×Breach + 0.25×Data + 0.20×Mentions + 0.10×Correlation + 0.10×Confidence",
  };

  // ── Map timeline ────────────────────────────────────────────────
  const timeline: TimelineEvent[] = (raw.timeline || []).map((t: any, i: number) => ({
    id: t.id || `tl-${i}`,
    date: t.date || t.timestamp || new Date().toISOString(),
    title: t.event || t.title || "Event",
    description: t.description || t.event || "",
    type: _inferTimelineType(t.event || t.title || ""),
    severity: (t.severity || "low").toLowerCase() as TimelineEvent["severity"],
    icon: _inferTimelineIcon(t.event || t.title || ""),
  }));

  // ── Build exposure graph from available data ────────────────────
  const graph = _buildGraphFromData(email, username, breaches, socialProfiles, webMentions);

  // ── Map attack vectors / threat summary ─────────────────────────
  const attackVectors: AttackVector[] = (raw.attackVectors || []).map((v: any) => ({
    name: v.name || "Attack Vector",
    probability: (v.severity || v.probability || "MEDIUM").toUpperCase() as AttackVector["probability"],
    description: v.description || "Potential attack vector identified.",
  }));

  const threatSummary = {
    criticalRisks: attackVectors.filter(v => v.probability === "HIGH" || v.probability === "CRITICAL").map(v => v.name),
    attackVectors,
    summary: raw.threatSummary?.summary || `Digital footprint analysis reveals a ${rawTier} risk posture with ${breaches.length} breach(es) detected across ${socialProfiles.length} linked profiles.`,
  };

  // ── Map remediation steps ───────────────────────────────────────
  const remediationSteps: RemediationStep[] = (raw.remediationSteps || []).map((s: any, i: number) => ({
    id: s.id?.toString() || `rs-${i}`,
    step: i + 1,
    title: s.title || `Step ${i + 1}`,
    description: s.description || "",
    priority: (s.priority || "medium").toLowerCase() as RemediationStep["priority"],
  }));

  return {
    id: scanId,
    query: {
      email,
      name: displayName,
      username,
    },
    status: "complete",
    progress: [],
    riskScore,
    breaches,
    socialProfiles,
    webMentions,
    timeline,
    graph,
    threatSummary,
    remediationSteps,
    createdAt: raw.startedAt || new Date().toISOString(),
    expiresAt: raw.expiresAt || new Date(Date.now() + 3600000).toISOString(),
  };
}


// ── Helpers ────────────────────────────────────────────────────────────────

function _inferTimelineType(event: string): TimelineEvent["type"] {
  const lower = event.toLowerCase();
  if (lower.includes("breach") || lower.includes("leak") || lower.includes("dump")) return "breach";
  if (lower.includes("profile") || lower.includes("account") || lower.includes("created")) return "profile";
  if (lower.includes("paper") || lower.includes("resume") || lower.includes("document")) return "document";
  return "mention";
}

function _inferTimelineIcon(event: string): string {
  const lower = event.toLowerCase();
  if (lower.includes("breach")) return "🔓";
  if (lower.includes("profile") || lower.includes("created")) return "👤";
  if (lower.includes("paper") || lower.includes("document")) return "📄";
  if (lower.includes("dump") || lower.includes("paste")) return "⚠️";
  return "📋";
}

function _buildGraphFromData(
  email: string,
  username: string,
  breaches: Breach[],
  profiles: SocialProfile[],
  mentions: WebMention[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Center node — primary identity
  nodes.push({
    id: "identity",
    type: "default",
    position: { x: 400, y: 300 },
    data: {
      label: email,
      nodeType: "identity",
      risk: "moderate",
      details: "Primary Identity",
    },
  });

  // Breach nodes — positioned in upper-left arc
  breaches.forEach((b, i) => {
    const angle = (-Math.PI / 2) + (i * 0.5) - 0.5;
    const radius = 220;
    const nodeId = `breach-${i}`;
    nodes.push({
      id: nodeId,
      type: "default",
      position: {
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
      },
      data: {
        label: `${b.name} (${b.date.substring(0, 4)})`,
        nodeType: "breach",
        risk: b.severity === "critical" ? "critical" : b.severity === "high" ? "high" : "moderate",
        details: `${b.pwnCount.toLocaleString()} records`,
      },
    });
    edges.push({
      id: `e-identity-${nodeId}`,
      source: "identity",
      target: nodeId,
      label: "breached",
      animated: true,
      style: { stroke: b.severity === "high" || b.severity === "critical" ? "#ef4444" : "#f59e0b" },
    });
  });

  // Social profile nodes — positioned on right arc
  profiles.forEach((p, i) => {
    const angle = (Math.PI / 4) + (i * 0.5);
    const radius = 230;
    const nodeId = `social-${i}`;
    nodes.push({
      id: nodeId,
      type: "default",
      position: {
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
      },
      data: {
        label: p.platform,
        nodeType: "platform",
        risk: "safe",
        details: `@${p.username} • ${p.followers || 0} followers`,
      },
    });
    edges.push({
      id: `e-identity-${nodeId}`,
      source: "identity",
      target: nodeId,
      label: "username match",
      animated: false,
      style: { stroke: "#06b6d4" },
    });
  });

  // Web mention nodes — positioned in bottom arc
  mentions.forEach((m, i) => {
    const angle = (Math.PI / 2) + (i * 0.4) + 0.3;
    const radius = 240;
    const nodeId = `mention-${i}`;
    nodes.push({
      id: nodeId,
      type: "default",
      position: {
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
      },
      data: {
        label: m.source,
        nodeType: "mention",
        risk: "moderate",
        details: m.title,
      },
    });
    edges.push({
      id: `e-identity-${nodeId}`,
      source: "identity",
      target: nodeId,
      label: "mentioned",
      animated: false,
      style: { stroke: "#8b5cf6" },
    });
  });

  return { nodes, edges };
}
