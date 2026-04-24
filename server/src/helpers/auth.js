import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_MS,
} from '../config.js';
import db from '../db/db.js';

export function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Требуется авторизация' });
  }
  const token = authHeader.slice(7);
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Токен недействителен или истёк' });
  }
  req.userId = decoded.userId;
  next();
}

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
}

export function storeRefreshToken(userId, refreshToken) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();
  db.prepare('INSERT INTO refresh_tokens (userId, token, expiresAt, createdAt) VALUES (?, ?, ?, ?)')
    .run(userId, refreshToken, expiresAt, new Date().toISOString());
}

export function revokeRefreshToken(token) {
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
}

export function validateStoredRefreshToken(token) {
  return db.prepare('SELECT * FROM refresh_tokens WHERE token = ? AND expiresAt > ?')
    .get(token, new Date().toISOString());
}

export function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
  });
}