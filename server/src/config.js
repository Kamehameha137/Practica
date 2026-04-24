// export const PORT = process.env.PORT || 3001;
export const PORT = process.env.PORT || 80;
export const JWT_SECRET = process.env.JWT_SECRET || 'event-design-secret-2026';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'event-design-refresh-2026';
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
export const DB_FILE = process.env.DB_FILE || './database.db';