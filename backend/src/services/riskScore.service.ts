// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Risk Score 2.0 Calculation Engine
//
// Formula:
//   Score = 0.35 × Breach Severity
//         + 0.25 × Sensitive Data Exposure
//         + 0.20 × Public Mentions
//         + 0.10 × Profile Correlation
//         + 0.10 × Confidence
// ─────────────────────────────────────────────────────────────

import {
  BreachRecord,
  DataExposure,
  WebMention,
  SocialProfile,
  RiskScore,
  RiskScoreBreakdown,
  RiskTier,
  SeverityLevel,
} from '../types';

// ── Severity → numeric mapping ───────────────────────────────

const SEVERITY_WEIGHT: Record<SeverityLevel, number> = {
  CRITICAL: 100,
  HIGH: 80,
  MEDIUM: 55,
  LOW: 30,
  INFO: 10,
};

// ── Individual dimension scorers ─────────────────────────────

/**
 * Breach Severity (0–100)
 * Considers number of breaches, their severity, how recent they are,
 * and the volume of exposed records.
 */
function scoreBreachSeverity(breaches: BreachRecord[]): number {
  if (breaches.length === 0) return 0;

  const now = Date.now();

  let totalScore = 0;
  for (const b of breaches) {
    const severityPts = SEVERITY_WEIGHT[b.severity];

    // Recency factor: breaches in the last 2 years score higher
    const ageYears =
      (now - new Date(b.breachDate).getTime()) / (365.25 * 24 * 3600 * 1000);
    const recencyFactor = Math.max(0.4, 1 - ageYears * 0.05);

    // Scale factor based on breach magnitude
    const scaleFactor = Math.min(1, Math.log10(b.pwnCount + 1) / 9);

    totalScore += severityPts * recencyFactor * scaleFactor;
  }

  // Normalize: 4 HIGH breaches ≈ 80–90
  const normalized = Math.min(100, (totalScore / breaches.length) * (1 + breaches.length * 0.12));
  return Math.round(normalized);
}

/**
 * Sensitive Data Exposure (0–100)
 * Higher score for more severe / more numerous exposures.
 */
function scoreSensitiveData(exposures: DataExposure[]): number {
  if (exposures.length === 0) return 0;

  let total = 0;
  for (const e of exposures) {
    const base = SEVERITY_WEIGHT[e.severity];
    const redactedPenalty = e.isRedacted ? 0.6 : 1.0; // redacted data is less risky
    total += base * redactedPenalty;
  }

  const avg = total / exposures.length;
  const volumeBoost = Math.min(1.5, 1 + exposures.length * 0.08);
  return Math.round(Math.min(100, avg * volumeBoost));
}

/**
 * Public Mentions (0–100)
 * Weighted by relevance score and sentiment.
 */
function scorePublicMentions(mentions: WebMention[]): number {
  if (mentions.length === 0) return 0;

  let total = 0;
  for (const m of mentions) {
    const sentimentWeight =
      m.sentiment === 'negative' ? 1.4
        : m.sentiment === 'neutral' ? 1.0
        : 0.6;                       // positive mentions are less "risky"
    total += m.relevanceScore * sentimentWeight * 100;
  }

  const avg = total / mentions.length;
  const volumeBoost = Math.min(1.3, 1 + mentions.length * 0.06);
  return Math.round(Math.min(100, avg * volumeBoost));
}

/**
 * Profile Correlation (0–100)
 * Measures cross-platform linkability.
 */
function scoreProfileCorrelation(profiles: SocialProfile[]): number {
  if (profiles.length === 0) return 0;

  let score = profiles.length * 25;        // base: 25 pts per profile

  // Bonus for matching usernames across platforms
  const usernames = profiles.map((p) => p.username.toLowerCase());
  const uniqueUsernames = new Set(usernames);
  if (uniqueUsernames.size < usernames.length) {
    score += 15; // same username across platforms → easier correlation
  }

  // Bonus for bio / metadata richness
  for (const p of profiles) {
    if (p.bio) score += 5;
    if (p.metadata && Object.keys(p.metadata).length > 3) score += 5;
  }

  return Math.round(Math.min(100, score));
}

/**
 * Confidence (0–100)
 * How much data did we actually gather?  More data → higher confidence.
 */
function scoreConfidence(
  breaches: BreachRecord[],
  exposures: DataExposure[],
  mentions: WebMention[],
  profiles: SocialProfile[],
): number {
  const dataPoints =
    breaches.length * 3 +
    exposures.length * 2 +
    mentions.length * 1.5 +
    profiles.length * 2;

  // 30+ data points → 100% confidence
  return Math.round(Math.min(100, (dataPoints / 30) * 100));
}

// ── Tier Determination ───────────────────────────────────────

function determineTier(score: number): RiskTier {
  if (score >= 85) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

// ── Public API ───────────────────────────────────────────────

export function calculateRiskScore(
  breaches: BreachRecord[],
  exposures: DataExposure[],
  mentions: WebMention[],
  profiles: SocialProfile[],
): RiskScore {
  const breakdown: RiskScoreBreakdown = {
    breachSeverity: scoreBreachSeverity(breaches),
    sensitiveDataExposure: scoreSensitiveData(exposures),
    publicMentions: scorePublicMentions(mentions),
    profileCorrelation: scoreProfileCorrelation(profiles),
    confidence: scoreConfidence(breaches, exposures, mentions, profiles),
  };

  const overall = Math.round(
    0.35 * breakdown.breachSeverity +
    0.25 * breakdown.sensitiveDataExposure +
    0.20 * breakdown.publicMentions +
    0.10 * breakdown.profileCorrelation +
    0.10 * breakdown.confidence,
  );

  return {
    overall: Math.min(100, overall),
    tier: determineTier(overall),
    breakdown,
    trend: 'stable',
    lastUpdated: new Date().toISOString(),
  };
}
