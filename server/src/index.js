import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db/init.js';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import reportsRouter from './routes/reports.js';
import { PORT } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/reports', reportsRouter);

//static files from client/dist
app.use(express.static(path.join(__dirname, '../../client/dist')));

// SPA fallback -- serve index.html for any non-API route
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Внутренняя ошибка сервера',
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
