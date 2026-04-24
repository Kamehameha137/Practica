import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { JWT_REFRESH_SECRET } from '../config.js';
import db from '../db/db.js';
import {
  generateTokens,
  authenticate,
  handleValidationErrors,
  storeRefreshToken,
  revokeRefreshToken,
  validateStoredRefreshToken,
  setRefreshCookie,
} from '../helpers/auth.js';

const router = express.Router();

router.post('/register',
  body('name').trim().notEmpty().withMessage('Введите имя').isLength({ min: 2 }).withMessage('Имя должно быть не менее 2 символов'),
  body('email').trim().isEmail().withMessage('Введите корректный email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  handleValidationErrors,
  async (req, res) => {
    const { name, email, password } = req.body;
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) {
      return res.status(409).json({ success: false, error: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)')
      .run(name, email, passwordHash, new Date().toISOString());

    const userId = result.lastInsertRowid;
    const { accessToken, refreshToken } = generateTokens(userId);
    storeRefreshToken(userId, refreshToken);
    setRefreshCookie(res, refreshToken);

    const user = db.prepare('SELECT id, name, email, createdAt FROM users WHERE id = ?').get(userId);
    res.json({ success: true, user, accessToken });
  }
);

router.post('/login',
  body('email').trim().isEmail().withMessage('Введите корректный email'),
  body('password').notEmpty().withMessage('Введите пароль'),
  handleValidationErrors,
  async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    storeRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      accessToken,
    });
  }
);

router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Refresh token не найден' });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'event-design-refresh-2026');
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Refresh token недействителен' });
  }

  const stored = validateStoredRefreshToken(refreshToken);
  if (!stored) {
    return res.status(401).json({ success: false, error: 'Refresh token отозван или истёк' });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
  revokeRefreshToken(refreshToken);
  storeRefreshToken(decoded.userId, newRefreshToken);
  setRefreshCookie(res, newRefreshToken);

  res.json({ success: true, accessToken });
});

router.post('/logout', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, email, createdAt FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Пользователь не найден' });
  }
  res.json({ success: true, user });
});

export default router;