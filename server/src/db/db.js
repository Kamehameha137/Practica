import Database from 'better-sqlite3';
import { DB_FILE } from '../config.js';
import { mkdirSync } from 'node:fs';
import { dirname, normalize } from 'node:path';

const dir = dirname(normalize(DB_FILE));
mkdirSync(dir, { recursive: true });

const db = new Database(DB_FILE);
export default db;