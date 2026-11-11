import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// TODO: mount routes
// app.use('/api/public', publicRoutes);
// app.use('/api/admin', adminRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
