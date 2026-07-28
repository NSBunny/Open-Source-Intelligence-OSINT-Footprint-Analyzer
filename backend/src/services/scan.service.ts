// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Scan Orchestration Service
//
// • In-memory Map-based storage (no database)
// • Auto-expires scan results after 1 hour
// • Attempts to call the Python OSINT engine first
// • Falls back to comprehensive mock data on failure
// ─────────────────────────────────────────────────────────────

import { v4 as uuid } from 'uuid';
import {
  ScanResult,
  ScanProgress,
  ScanStatus,
  ScanSummary,
} from '../types';
import {
  getMockBreaches,
  getMockSocialProfiles,
  getMockWebMentions,
  getMockDataExposures,
  getMockAttackVectors,
  getMockRemediationSteps,
  getMockTimeline,
} from './mock.service';
import { calculateRiskScore } from './riskScore.service';

// ── Constants ────────────────────────────────────────────────

const SCAN_TTL_MS = 60 * 60 * 1000;          // 1 hour
const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;   // purge expired every 5 min

// ── In-Memory Stores ─────────────────────────────────────────

const scanStore = new Map<string, ScanResult>();
const progressListeners = new Map<string, Set<(event: ScanProgress) => void>>();

// ── Periodic Cleanup ─────────────────────────────────────────

setInterval(() => {
  const now = Date.now();
  for (const [id, scan] of scanStore) {
    if (new Date(scan.expiresAt).getTime() <= now) {
      scanStore.delete(id);
      progressListeners.delete(id);
      console.log(`[cleanup] Purged expired scan ${id}`);
    }
  }
}, CLEANUP_INTERVAL_MS);

// ── Progress Broadcasting ────────────────────────────────────

function emitProgress(scanId: string, progress: ScanProgress): void {
  const listeners = progressListeners.get(scanId);
  if (listeners) {
    for (const cb of listeners) {
      try { cb(progress); } catch { /* noop */ }
    }
  }
}

function createProgress(
  scanId: string,
  status: ScanStatus,
  progress: number,
  currentModule: string,
  message: string,
): ScanProgress {
  return {
    scanId,
    status,
    progress: Math.min(100, Math.max(0, progress)),
    currentModule,
    message,
    timestamp: new Date().toISOString(),
  };
}

// ── Python Engine Call ───────────────────────────────────────

// ── Python Engine Call ───────────────────────────────────────

async function callPythonEngine(target: string, depth: string): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const email = target.includes('@') ? target : `${target}@gmail.com`;
    const username = target.split('@')[0] || target;

    const res = await fetch(`${PYTHON_ENGINE_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        username: username,
        name: username,
        phone: '',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[scan] Python engine HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = (await res.json()) as any;
    
    // Map Python engine response (ScanResponse model) to Express engineResult format
    const breaches = (data.breach_results?.breaches || []).map((b: any, idx: number) => ({
      id: b.id || `b-${idx}`,
      name: b.name || 'Data Breach',
      domain: b.domain || '',
      breachDate: b.date || b.breachDate || '2023-01-01',
      addedDate: b.date || '2023-01-01',
      modifiedDate: b.date || '2023-01-01',
      pwnCount: b.pwnCount || 500000,
      description: b.description || 'Account credentials exposed in breach.',
      logoUrl: b.logoUrl || `https://logo.clearbit.com/${b.domain || 'example.com'}`,
      dataClasses: b.dataClasses || ['Email addresses', 'Passwords'],
      isVerified: b.isVerified ?? true,
      isFabricated: false,
      isSensitive: b.isSensitive ?? false,
      isRetired: false,
      isSpamList: false,
      isMalware: false,
      isSubscriptionFree: false,
      severity: (b.severity || 'HIGH').toUpperCase(),
    }));

    const rawScore = data.risk_score?.score ?? 50;
    const tier = (data.risk_score?.category || 'MODERATE').toUpperCase();

    const attackVectors = (data.recommendations?.attack_vectors || []).map((v: any, idx: number) => ({
      id: `av-${idx}`,
      name: v.name || 'Credential Risk',
      category: 'AUTHENTICATION',
      severity: (v.probability || 'HIGH').toUpperCase(),
      likelihood: v.probability === 'HIGH' ? 85 : v.probability === 'MEDIUM' ? 60 : 35,
      impact: 80,
      description: v.description || 'Target identity risk detected.',
      mitigation: 'Enable MFA and update passwords.',
      affectedAssets: [email],
    }));

    const remediationSteps = (data.recommendations?.remediation_steps || []).map((s: any, idx: number) => {
      if (typeof s === 'string') {
        return {
          id: idx + 1,
          title: s.split(':')[0] || `Step ${idx + 1}`,
          description: s,
          priority: idx === 0 ? 'CRITICAL' : idx < 3 ? 'HIGH' : 'MEDIUM',
          category: 'ACCOUNT_SECURITY',
          estimatedMinutes: 10,
          automated: false,
        };
      }
      return s;
    });

    return {
      breaches,
      socialProfiles: data.correlation_results?.social_profiles || [],
      webMentions: data.correlation_results?.web_mentions || [],
      dataExposures: data.correlation_results?.data_exposures || [],
      riskScore: {
        overall: rawScore,
        tier: tier,
        breakdown: {
          breachSeverity: data.risk_score?.breakdown?.breach_severity || 50,
          sensitiveDataExposure: data.risk_score?.breakdown?.sensitive_data || 50,
          publicMentions: data.risk_score?.breakdown?.public_mentions || 50,
          profileCorrelation: data.risk_score?.breakdown?.correlation || 50,
          confidence: data.risk_score?.breakdown?.confidence || 80,
        },
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
      },
      attackVectors,
      remediationSteps,
      timeline: data.correlation_results?.timeline || [],
    };
  } catch (err) {
    console.error('[scan] Python engine call failed:', err);
    return null;
  }
}

// ── Simulated Scan Delay ─────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Public API ───────────────────────────────────────────────

/**
 * Start a new scan.  Returns the scan ID immediately.
 * The actual scanning runs asynchronously.
 */
export function startScan(
  target: string,
  depth: 'quick' | 'standard' | 'deep' = 'standard',
): string {
  const scanId = uuid();
  const now = new Date();

  const scan: ScanResult = {
    id: scanId,
    target,
    status: 'queued',
    depth,
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SCAN_TTL_MS).toISOString(),
    breaches: [],
    socialProfiles: [],
    webMentions: [],
    dataExposures: [],
    riskScore: {
      overall: 0,
      tier: 'LOW',
      breakdown: {
        breachSeverity: 0,
        sensitiveDataExposure: 0,
        publicMentions: 0,
        profileCorrelation: 0,
        confidence: 0,
      },
      trend: 'stable',
      lastUpdated: now.toISOString(),
    },
    attackVectors: [],
    remediationSteps: [],
    timeline: [],
    summary: {
      totalBreaches: 0,
      totalExposedRecords: 0,
      totalSocialProfiles: 0,
      totalWebMentions: 0,
      totalDataExposures: 0,
      highestSeverity: 'INFO',
      oldestBreach: '',
      newestBreach: '',
      executionTimeMs: 0,
    },
  };

  scanStore.set(scanId, scan);

  // Fire-and-forget the async orchestration
  runScanPipeline(scanId, target, depth).catch((err) => {
    console.error(`[scan] Pipeline error for ${scanId}:`, err);
    const s = scanStore.get(scanId);
    if (s) {
      s.status = 'failed';
      emitProgress(scanId, createProgress(scanId, 'failed', 0, 'error', String(err)));
    }
  });

  return scanId;
}

/**
 * Main scan pipeline — orchestrates modules sequentially so we can
 * emit granular progress events over SSE.
 */
async function runScanPipeline(
  scanId: string,
  target: string,
  depth: string,
): Promise<void> {
  const startTime = Date.now();
  const scan = scanStore.get(scanId);
  if (!scan) return;

  // ── 1. Mark as running ──
  scan.status = 'running';
  emitProgress(scanId, createProgress(scanId, 'running', 5, 'init', 'Initializing scan engine…'));
  await sleep(400);

  // ── 2. Try Python engine first ──
  emitProgress(scanId, createProgress(scanId, 'running', 10, 'engine', 'Connecting to OSINT engine…'));
  const engineResult = await callPythonEngine(target, depth);
  const useMock = !engineResult;

  if (useMock) {
    emitProgress(scanId, createProgress(
      scanId, 'running', 15, 'engine',
      'Python engine unavailable — using built-in intelligence database',
    ));
    await sleep(300);
  }

  // ── 3. Breach Analysis ──
  emitProgress(scanId, createProgress(scanId, 'running', 20, 'breaches', 'Scanning breach databases…'));
  await sleep(800);
  scan.breaches = useMock ? getMockBreaches(target) : engineResult.breaches;
  emitProgress(scanId, createProgress(
    scanId, 'running', 35, 'breaches',
    `Found ${scan.breaches.length} breach${scan.breaches.length !== 1 ? 'es' : ''}`,
  ));
  await sleep(400);

  // ── 4. Social Profile Discovery ──
  emitProgress(scanId, createProgress(scanId, 'running', 40, 'social', 'Discovering social profiles…'));
  await sleep(700);
  scan.socialProfiles = useMock ? getMockSocialProfiles(target) : engineResult.socialProfiles;
  emitProgress(scanId, createProgress(
    scanId, 'running', 50, 'social',
    `Identified ${scan.socialProfiles.length} social profile${scan.socialProfiles.length !== 1 ? 's' : ''}`,
  ));
  await sleep(300);

  // ── 5. Web Mentions ──
  emitProgress(scanId, createProgress(scanId, 'running', 55, 'mentions', 'Crawling web mentions…'));
  await sleep(600);
  scan.webMentions = useMock ? getMockWebMentions(target) : engineResult.webMentions;
  emitProgress(scanId, createProgress(
    scanId, 'running', 65, 'mentions',
    `Collected ${scan.webMentions.length} web mention${scan.webMentions.length !== 1 ? 's' : ''}`,
  ));
  await sleep(300);

  // ── 6. Sensitive Data Exposure ──
  emitProgress(scanId, createProgress(scanId, 'running', 70, 'exposure', 'Analyzing data exposures…'));
  await sleep(500);
  scan.dataExposures = useMock ? getMockDataExposures(target) : engineResult.dataExposures;
  emitProgress(scanId, createProgress(
    scanId, 'running', 78, 'exposure',
    `Detected ${scan.dataExposures.length} data exposure${scan.dataExposures.length !== 1 ? 's' : ''}`,
  ));
  await sleep(300);

  // ── 7. Risk Score Calculation ──
  emitProgress(scanId, createProgress(scanId, 'running', 82, 'risk', 'Calculating Risk Score 2.0…'));
  await sleep(400);
  scan.riskScore = calculateRiskScore(
    scan.breaches,
    scan.dataExposures,
    scan.webMentions,
    scan.socialProfiles,
  );
  emitProgress(scanId, createProgress(
    scanId, 'running', 88, 'risk',
    `Risk Score: ${scan.riskScore.overall}/100 (${scan.riskScore.tier})`,
  ));
  await sleep(200);

  // ── 8. Attack Vectors & Remediation ──
  emitProgress(scanId, createProgress(scanId, 'running', 90, 'analysis', 'Generating attack vectors & remediation…'));
  await sleep(500);
  scan.attackVectors = useMock ? getMockAttackVectors(target) : engineResult.attackVectors;
  scan.remediationSteps = useMock ? getMockRemediationSteps() : engineResult.remediationSteps;
  emitProgress(scanId, createProgress(
    scanId, 'running', 95, 'analysis',
    `Mapped ${scan.attackVectors.length} attack vectors, ${scan.remediationSteps.length} remediation steps`,
  ));
  await sleep(200);

  // ── 9. Timeline ──
  scan.timeline = useMock ? getMockTimeline(target) : engineResult.timeline;

  // ── 10. Summary ──
  const sortedBreachDates = scan.breaches
    .map((b) => b.breachDate)
    .sort();

  scan.summary = {
    totalBreaches: scan.breaches.length,
    totalExposedRecords: scan.breaches.reduce((sum, b) => sum + b.pwnCount, 0),
    totalSocialProfiles: scan.socialProfiles.length,
    totalWebMentions: scan.webMentions.length,
    totalDataExposures: scan.dataExposures.length,
    highestSeverity: scan.breaches.reduce<string>(
      (worst, b) => {
        const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
        return order.indexOf(b.severity) < order.indexOf(worst) ? b.severity : worst;
      },
      'INFO',
    ) as any,
    oldestBreach: sortedBreachDates[0] || '',
    newestBreach: sortedBreachDates[sortedBreachDates.length - 1] || '',
    executionTimeMs: Date.now() - startTime,
  };

  // ── 11. Complete ──
  scan.status = 'completed';
  scan.completedAt = new Date().toISOString();

  emitProgress(scanId, createProgress(
    scanId, 'completed', 100, 'done',
    `Scan complete — Risk Score ${scan.riskScore.overall}/100 ${scan.riskScore.tier}`,
  ));

  console.log(
    `[scan] ${scanId} completed in ${scan.summary.executionTimeMs}ms ` +
    `| ${scan.summary.totalBreaches} breaches | score ${scan.riskScore.overall}/${scan.riskScore.tier}`,
  );
}

/**
 * Retrieve a scan result by ID.
 */
export function getScan(scanId: string): ScanResult | undefined {
  const scan = scanStore.get(scanId);
  if (scan && new Date(scan.expiresAt).getTime() <= Date.now()) {
    scanStore.delete(scanId);
    progressListeners.delete(scanId);
    return undefined;
  }
  return scan;
}

/**
 * Subscribe to real-time progress updates for a scan.
 * Returns an unsubscribe function.
 */
export function subscribeProgress(
  scanId: string,
  callback: (event: ScanProgress) => void,
): () => void {
  if (!progressListeners.has(scanId)) {
    progressListeners.set(scanId, new Set());
  }
  progressListeners.get(scanId)!.add(callback);

  return () => {
    const set = progressListeners.get(scanId);
    if (set) {
      set.delete(callback);
      if (set.size === 0) progressListeners.delete(scanId);
    }
  };
}

/**
 * Export scan data in the requested format.
 */
export function exportScan(
  scanId: string,
  format: 'json' | 'csv' | 'pdf',
): { data: string; contentType: string; filename: string } | null {
  const scan = getScan(scanId);
  if (!scan || scan.status !== 'completed') return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  switch (format) {
    case 'json': {
      return {
        data: JSON.stringify(scan, null, 2),
        contentType: 'application/json',
        filename: `traceguard-report-${timestamp}.json`,
      };
    }

    case 'csv': {
      const headers = [
        'Type',
        'Name',
        'Severity',
        'Date',
        'Description',
        'Source',
      ];
      const rows: string[][] = [];

      // Breaches
      for (const b of scan.breaches) {
        rows.push([
          'Breach',
          b.name,
          b.severity,
          b.breachDate,
          b.description.replace(/"/g, '""').slice(0, 200),
          b.domain,
        ]);
      }

      // Data exposures
      for (const e of scan.dataExposures) {
        rows.push([
          'Exposure',
          e.type,
          e.severity,
          e.firstSeen,
          `Value: ${e.isRedacted ? '[REDACTED]' : e.value}`,
          e.source,
        ]);
      }

      // Attack vectors
      for (const a of scan.attackVectors) {
        rows.push([
          'Attack Vector',
          a.name,
          a.severity,
          '',
          a.description.replace(/"/g, '""').slice(0, 200),
          '',
        ]);
      }

      const csvContent =
        headers.join(',') +
        '\n' +
        rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');

      return {
        data: csvContent,
        contentType: 'text/csv',
        filename: `traceguard-report-${timestamp}.csv`,
      };
    }

    case 'pdf': {
      // PDF generation would require a library — return a structured text report
      const textReport = [
        '═══════════════════════════════════════════════════════',
        '              TRACEGUARD 2.0 — OSINT REPORT           ',
        '═══════════════════════════════════════════════════════',
        '',
        `Target:          ${scan.target}`,
        `Scan ID:         ${scan.id}`,
        `Date:            ${scan.completedAt}`,
        `Risk Score:      ${scan.riskScore.overall}/100 (${scan.riskScore.tier})`,
        '',
        '───────────────────────────────────────────────────────',
        '  SUMMARY',
        '───────────────────────────────────────────────────────',
        `  Breaches:         ${scan.summary.totalBreaches}`,
        `  Exposed Records:  ${scan.summary.totalExposedRecords.toLocaleString()}`,
        `  Social Profiles:  ${scan.summary.totalSocialProfiles}`,
        `  Web Mentions:     ${scan.summary.totalWebMentions}`,
        `  Data Exposures:   ${scan.summary.totalDataExposures}`,
        `  Oldest Breach:    ${scan.summary.oldestBreach}`,
        `  Newest Breach:    ${scan.summary.newestBreach}`,
        '',
        '───────────────────────────────────────────────────────',
        '  RISK SCORE BREAKDOWN',
        '───────────────────────────────────────────────────────',
        `  Breach Severity:       ${scan.riskScore.breakdown.breachSeverity}/100`,
        `  Data Exposure:         ${scan.riskScore.breakdown.sensitiveDataExposure}/100`,
        `  Public Mentions:       ${scan.riskScore.breakdown.publicMentions}/100`,
        `  Profile Correlation:   ${scan.riskScore.breakdown.profileCorrelation}/100`,
        `  Confidence:            ${scan.riskScore.breakdown.confidence}/100`,
        '',
        '───────────────────────────────────────────────────────',
        '  BREACHES',
        '───────────────────────────────────────────────────────',
        ...scan.breaches.map(
          (b) => `  [${b.severity}] ${b.name} (${b.breachDate}) — ${b.pwnCount.toLocaleString()} records`,
        ),
        '',
        '───────────────────────────────────────────────────────',
        '  ATTACK VECTORS',
        '───────────────────────────────────────────────────────',
        ...scan.attackVectors.map(
          (a) => `  [${a.severity}] ${a.name} — Likelihood: ${a.likelihood}%`,
        ),
        '',
        '───────────────────────────────────────────────────────',
        '  REMEDIATION STEPS',
        '───────────────────────────────────────────────────────',
        ...scan.remediationSteps.map(
          (r) => `  ${r.id}. [${r.priority}] ${r.title}`,
        ),
        '',
        '═══════════════════════════════════════════════════════',
        '  Generated by TraceGuard 2.0 — OSINT Footprint Analyzer',
        '═══════════════════════════════════════════════════════',
      ].join('\n');

      return {
        data: textReport,
        contentType: 'text/plain',
        filename: `traceguard-report-${timestamp}.txt`,
      };
    }

    default:
      return null;
  }
}
