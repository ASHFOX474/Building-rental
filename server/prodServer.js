import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './src/app.js';
import { initDatabase } from './src/services/dbService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load local `server/.env` if it exists (for local production testing) without
 * overriding environment variables injected by Render.com or the shell.
 * Never throws when `.env` is absent in cloud deployments.
 */
function loadLocalEnvIfPresent() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnvIfPresent();

/** Resolve the built Vite frontend directory (`client/dist` or root `dist`). */
function resolveDistDir() {
  const candidates = [
    path.resolve(__dirname, '../client/dist'),
    path.resolve(__dirname, '../dist'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      return dir;
    }
  }
  return candidates[0];
}

const DIST_DIR = resolveDistDir();
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// 1. Mount all existing `/api/health`, `/api/db/*`, and `/api/drive/*` routes
const app = createApp();

// 2. Return JSON 404 for unknown `/api/*` paths instead of falling through to SPA HTML
app.use('/api', (_req, res) => {
  res.status(404).json({
    ok: false,
    message: 'API route not found',
  });
});

// 3. Serve built Vite frontend static assets from `dist`
app.use(
  express.static(DIST_DIR, {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html') || filePath.endsWith(`${path.sep}sw.js`)) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    },
  })
);

let cachedIndexHtml = null;

function readIndexHtmlTemplate() {
  if (cachedIndexHtml !== null) return cachedIndexHtml;
  if (!fs.existsSync(INDEX_HTML_PATH)) return null;
  cachedIndexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  return cachedIndexHtml;
}

function resolveRequestOrigin(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  const host = String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim();
  const isLocalHost =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0');

  // Render/HTTPS reverse proxies send x-forwarded-proto=https; default to https on non-local hosts
  const proto = forwardedProto || (isLocalHost ? req.protocol || 'http' : 'https');
  if (host) {
    return `${proto}://${host}`;
  }
  return (process.env.RENDER_EXTERNAL_URL || 'https://localhost').replace(/\/+$/, '');
}

// 4. Catch-all SPA fallback (Express 4 & Express 5 compatible regex) for all non-`/api` routes
//    Replaces `__ORIGIN__` dynamically with the live request origin (`https://<host>`)
//    so Facebook, WhatsApp, Messenger, and Instagram scrapers receive valid absolute URLs.
app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
  const template = readIndexHtmlTemplate();
  if (!template) {
    return res.status(503).send(
      'Frontend build not found. Run "npm run build" before starting the production server.'
    );
  }
  const origin = resolveRequestOrigin(req);
  const html = template.replaceAll('__ORIGIN__', origin);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  return res.send(html);
});

// 5. Initialize Neon PostgreSQL tables on startup and bind to 0.0.0.0:${PORT}
async function startProductionServer() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('[prod] Database startup init warning:', err?.message || err);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`[prod] Moni Lodge unified server listening on http://${HOST}:${PORT}`);
    console.log(`[prod] Serving built frontend from: ${DIST_DIR}`);
  });

  const shutdown = (signal) => {
    console.log(`[prod] Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startProductionServer();
