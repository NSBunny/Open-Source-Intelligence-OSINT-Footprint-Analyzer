// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Scan Routes
// ─────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  handleStartScan,
  handleGetScan,
  handleScanProgress,
  handleExportScan,
} from '../controllers/scan.controller';

const router = Router();

// POST   /api/scan              → Start a new scan
router.post('/', handleStartScan);

// GET    /api/scan/:id          → Retrieve scan result
router.get('/:id', handleGetScan);

// GET    /api/scan/:id/progress → Real-time SSE progress stream
router.get('/:id/progress', handleScanProgress);

// POST   /api/scan/:id/export   → Export scan report
router.post('/:id/export', handleExportScan);

export default router;
