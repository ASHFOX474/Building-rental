import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import driveRoutes from './routes/driveRoutes.js';

/**
 * Build the Express API app (health + Google Drive routes).
 * Used both by the standalone server (src/index.js, port 4000) and mounted
 * directly inside the Vite dev server as middleware (client/vite.config.js),
 * so `/api/*` works on localhost:5173 without any proxy to port 4000.
 */
export function createApp() {
  const app = express();

  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/drive', driveRoutes);

  app.use((err, _req, res, _next) => {
    console.error('[server error]', err);
    if (res.headersSent) return;
    res.status(err?.status || 500).json({
      ok: false,
      message: err?.message || 'Internal server error',
      messageBn: err?.message || 'সার্ভারে একটি সমস্যা হয়েছে',
    });
  });

  return app;
}

export default createApp;
