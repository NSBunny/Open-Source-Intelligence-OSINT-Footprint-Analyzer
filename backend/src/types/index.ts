// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — TypeScript Interfaces
// ─────────────────────────────────────────────────────────────

/** Scan lifecycle states */
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';

/** Severity / threat levels */
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

/** Risk tier derived from numerical score */
export type RiskTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// ── Request / Response ───────────────────────────────────────

export interface ScanRequest {
  /** The email, domain, or username to investigate */
  target: string;
  /** Optional scan depth: quick (breaches only), standard (default), deep (everything) */
  depth?: 'quick' | 'standard' | 'deep';
  /** Optional modules to enable */
  modules?: string[];
}

export interface ExportRequest {
  format: 'json' | 'csv' | 'pdf';
}

// ── Breach Data ──────────────────────────────────────────────

export interface BreachRecord {
  id: string;
  name: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  modifiedDate: string;
  pwnCount: number;
  description: string;
  dataClasses: string[];
  isVerified: boolean;
  isSensitive: boolean;
  severity: SeverityLevel;
  logoUrl?: string;
}

// ── Social Profile ───────────────────────────────────────────

export interface SocialProfile {
  platform: string;
  username: string;
  url: string;
  bio?: string;
  followers?: number;
  following?: number;
  posts?: number;
  isVerified: boolean;
  lastActive?: string;
  profileImageUrl?: string;
  metadata?: Record<string, string | number | boolean>;
}

// ── Web Mention ──────────────────────────────────────────────

export interface WebMention {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  publishedDate?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
  category: string;
}

// ── Sensitive Data Exposure ──────────────────────────────────

export interface DataExposure {
  type: string;
  value: string;
  source: string;
  severity: SeverityLevel;
  firstSeen: string;
  lastSeen: string;
  isRedacted: boolean;
}

// ── Attack Vector ────────────────────────────────────────────

export interface AttackVector {
  name: string;
  severity: SeverityLevel;
  likelihood: number;          // 0–100
  description: string;
  mitigations: string[];
  relatedBreaches?: string[];
}

// ── Remediation Step ─────────────────────────────────────────

export interface RemediationStep {
  id: number;
  priority: SeverityLevel;
  title: string;
  description: string;
  effort: 'minimal' | 'moderate' | 'significant';
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionUrl?: string;
}

// ── Risk Score 2.0 ───────────────────────────────────────────

export interface RiskScoreBreakdown {
  breachSeverity: number;      // 0–100
  sensitiveDataExposure: number;
  publicMentions: number;
  profileCorrelation: number;
  confidence: number;
}

export interface RiskScore {
  overall: number;             // 0–100
  tier: RiskTier;
  breakdown: RiskScoreBreakdown;
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
}

// ── Timeline Event ───────────────────────────────────────────

export interface TimelineEvent {
  date: string;
  type: 'breach' | 'exposure' | 'mention' | 'profile_update';
  title: string;
  description: string;
  severity: SeverityLevel;
  source: string;
}

// ── Scan Progress (SSE) ──────────────────────────────────────

export interface ScanProgress {
  scanId: string;
  status: ScanStatus;
  progress: number;            // 0–100
  currentModule: string;
  message: string;
  timestamp: string;
}

// ── Full Scan Result ─────────────────────────────────────────

export interface ScanResult {
  id: string;
  target: string;
  status: ScanStatus;
  depth: 'quick' | 'standard' | 'deep';
  startedAt: string;
  completedAt?: string;
  expiresAt: string;           // TTL — auto-purge after 1 hour

  // Core findings
  breaches: BreachRecord[];
  socialProfiles: SocialProfile[];
  webMentions: WebMention[];
  dataExposures: DataExposure[];

  // Analysis
  riskScore: RiskScore;
  attackVectors: AttackVector[];
  remediationSteps: RemediationStep[];
  timeline: TimelineEvent[];

  // Metadata
  summary: ScanSummary;
}

export interface ScanSummary {
  totalBreaches: number;
  totalExposedRecords: number;
  totalSocialProfiles: number;
  totalWebMentions: number;
  totalDataExposures: number;
  highestSeverity: SeverityLevel;
  oldestBreach: string;
  newestBreach: string;
  executionTimeMs: number;
}
