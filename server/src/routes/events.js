import express from 'express';
import { body } from 'express-validator';
import db from '../db/db.js';
import { authenticate, handleValidationErrors } from '../helpers/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const events = db.prepare(`
    SELECT id, userId, title, description, category, date, time, location, capacity, status, createdAt
    FROM events WHERE userId = ? ORDER BY date ASC
  `).all(req.userId);
  res.json({ success: true, events });
});

router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND userId = ?').get(req.params.id, req.userId);
  if (!event) {
    return res.status(404).json({ success: false, error: 'Мероприятие не найдено' });
  }
  res.json({ success: true, event });
});

router.post('/',
  body('title').trim().notEmpty().withMessage('Введите название'),
  body('category').trim().notEmpty().withMessage('Выберите категорию'),
  body('date').trim().notEmpty().withMessage('Укажите дату').isISO8601().withMessage('Некорректная дата'),
  handleValidationErrors,
  (req, res) => {
    const { title, description, category, date, time, location, capacity, status } = req.body;
    const result = db.prepare(`
      INSERT INTO events (userId, title, description, category, date, time, location, capacity, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.userId, title, description || null, category, date, time || null, location || null, capacity || null, status || 'upcoming', new Date().toISOString());

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, event });
  }
);

router.put('/:id',
  body('title').optional().trim().notEmpty().withMessage('Название не может быть пустым'),
  body('date').optional().trim().isISO8601().withMessage('Некорректная дата'),
  handleValidationErrors,
  (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ? AND userId = ?').get(req.params.id, req.userId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Мероприятие не найдено' });
    }

    const fields = ['title', 'description', 'category', 'date', 'time', 'location', 'capacity', 'status'];
    const updates = [];
    const values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Нет данных для обновления' });
    }

    values.push(req.params.id);
    db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json({ success: true, event: updated });
  }
);

router.delete('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND userId = ?').get(req.params.id, req.userId);
  if (!event) {
    return res.status(404).json({ success: false, error: 'Мероприятие не найдено' });
  }
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;