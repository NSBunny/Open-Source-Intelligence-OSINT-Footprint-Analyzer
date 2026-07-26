// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Scan Controller (Request Handlers)
// ─────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import {
  startScan,
  getScan,
  subscribeProgress,
  exportScan,
} from '../services/scan.service';
import { ScanRequest, ExportRequest, ScanProgress } from '../types';

// ── POST /api/scan — Start a new scan ────────────────────────

export function handleStartScan(req: Request, res: Response): void {
  const body = req.body as Partial<ScanRequest>;

  if (!body.target || typeof body.target !== 'string' || body.target.trim().length === 0) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'A non-empty "target" field is required (email, domain, or username).',
    });
    return;
  }

  const target = body.target.trim();
  const depth = body.depth || 'standard';
  const validDepths = ['quick', 'standard', 'deep'];

  if (!validDepths.includes(depth)) {
    res.status(400).json({
      error: 'Validation Error',
      message: `Invalid depth "${depth}". Must be one of: ${validDepths.join(', ')}`,
    });
    return;
  }

  const scanId = startScan(target, depth as 'quick' | 'standard' | 'deep');

  res.status(202).json({
    scanId,
    status: 'queued',
    message: `Scan initiated for "${target}" with ${depth} depth`,
    progressUrl: `/api/scan/${scanId}/progress`,
    resultUrl: `/api/scan/${scanId}`,
  });
}

// ── GET /api/scan/:id — Retrieve scan result ─────────────────

export function handleGetScan(req: Request, res: Response): void {
  const id = req.params.id as string;
  const scan = getScan(id);

  if (!scan) {
    res.status(404).json({
      error: 'Not Found',
      message: `Scan "${id}" not found or has expired (results auto-expire after 1 hour).`,
    });
    return;
  }

  res.status(200).json(scan);
}

// ── GET /api/scan/:id/progress — SSE stream ──────────────────

export function handleScanProgress(req: Request, res: Response): void {
  const id = req.params.id as string;
  const scan = getScan(id);

  if (!scan) {
    res.status(404).json({
      error: 'Not Found',
      message: `Scan "${id}" not found or has expired.`,
    });
    return;
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',        // disable nginx buffering
  });

  // Send initial state
  const sendEvent = (event: ScanProgress) => {
    res.write(`event: progress\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // If the scan is already completed, send the final state and close
  if (scan.status === 'completed' || scan.status === 'failed') {
    sendEvent({
      scanId: id,
      status: scan.status,
      progress: scan.status === 'completed' ? 100 : 0,
      currentModule: scan.status === 'completed' ? 'done' : 'error',
      message: scan.status === 'completed'
        ? `Scan complete — Risk Score ${scan.riskScore.overall}/100 ${scan.riskScore.tier}`
        : 'Scan failed',
      timestamp: new Date().toISOString(),
    });
    res.write(`event: done\ndata: {}\n\n`);
    res.end();
    return;
  }

  // Subscribe to live progress
  const unsubscribe = subscribeProgress(id, (event) => {
    sendEvent(event);

    // Close the stream when scan completes or fails
    if (event.status === 'completed' || event.status === 'failed') {
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
      unsubscribe();
    }
  });

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15_000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}

// ── POST /api/scan/:id/export — Export scan report ───────────

export function handleExportScan(req: Request, res: Response): void {
  const id = req.params.id as string;
  const body = req.body as Partial<ExportRequest>;
  const format = body.format || 'json';
  const validFormats = ['json', 'csv', 'pdf'];

  if (!validFormats.includes(format)) {
    res.status(400).json({
      error: 'Validation Error',
      message: `Invalid format "${format}". Must be one of: ${validFormats.join(', ')}`,
    });
    return;
  }

  const result = exportScan(id, format as 'json' | 'csv' | 'pdf');

  if (!result) {
    const scan = getScan(id);
    if (!scan) {
      res.status(404).json({
        error: 'Not Found',
        message: `Scan "${id}" not found or has expired.`,
      });
    } else {
      res.status(409).json({
        error: 'Scan Not Ready',
        message: `Scan is still ${scan.status}. Export is only available after completion.`,
      });
    }
    return;
  }

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.status(200).send(result.data);
}
