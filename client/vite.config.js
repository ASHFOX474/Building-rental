import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(__dirname, '../server');

/** Load server/.env into process.env (without overriding already-set variables). */
function loadServerEnv() {
  const envPath = path.join(SERVER_DIR, '.env');
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

/**
 * Mounts the Express API (`/api/health`, `/api/drive/*` incl. `/api/drive/stream/:fileId`)
 * directly inside the Vite dev server, on the SAME port (localhost:5173).
 * No proxy to 127.0.0.1:4000 → no more ECONNREFUSED.
 */
function inProcessApiPlugin() {
  return {
    name: 'in-process-express-api',
    apply: 'serve',
    async configureServer(server) {
      const appModulePath = path.join(SERVER_DIR, 'src/app.js');
      if (!fs.existsSync(appModulePath)) {
        console.warn('[api] server/src/app.js not found — /api routes disabled');
        return;
      }

      loadServerEnv();

      let app;
      try {
        // Runtime import via file URL so Vite does NOT bundle the server code into the config
        // (keeps server/node_modules resolution for express/googleapis/multer).
        const mod = await import(pathToFileURL(appModulePath).href);
        app = mod.createApp();
        console.log('[api] Express API mounted inside Vite at /api (same port, no proxy)');
      } catch (err) {
        console.error('[api] Failed to load Express API inside Vite:', err);
        return;
      }

      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) return next();
        app(req, res, next);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), inProcessApiPlugin()],
});
