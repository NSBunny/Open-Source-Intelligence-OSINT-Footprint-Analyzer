// ─────────────────────────────────────────────────────────────
// TraceGuard 2.0 — Express Server Entry Point
// ─────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scan.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ── Middleware ────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:3000',         // Next.js frontend (dev)
    'http://127.0.0.1:3000',
    'http://localhost:5173',         // Vite (alternative)
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────

app.use('/api/scan', scanRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TraceGuard 2.0 Backend',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist.',
    availableEndpoints: [
      'GET  /api/health',
      'POST /api/scan',
      'GET  /api/scan/:id',
      'GET  /api/scan/:id/progress',
      'POST /api/scan/:id/export',
    ],
  });
});

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║                                              ║');
  console.log('  ║   🛡️  TraceGuard 2.0 — OSINT Analyzer        ║');
  console.log('  ║                                              ║');
  console.log(`  ║   Server:  http://localhost:${PORT}              ║`);
  console.log('  ║   Status:  Ready                             ║');
  console.log('  ║   Mode:    In-Memory (zero-storage)          ║');
  console.log('  ║   TTL:     60 minutes                        ║');
  console.log('  ║                                              ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});

export default app;
