import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import driveRoutes from './routes/driveRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

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
  res.status(err?.status || 500).json({
    ok: false,
    message: err?.message || 'Internal server error',
    messageBn: err?.message || 'সার্ভারে একটি সমস্যা হয়েছে',
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
