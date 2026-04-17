import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Инициализация базы данных
const db = new Database('./database.db');

// Создаём таблицы если не существуют
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    capacity INTEGER,
    status TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// Инициализация демо данных
const initDemoData = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run('Демо Пользователь', 'demo@eventdesign.ru', 'demo1234', new Date().toISOString());

    const insertEvent = db.prepare(`
      INSERT INTO events (userId, title, description, category, date, time, location, capacity, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const demoEvents = [
      [1, 'Конференция IT-Weekend 2026', 'Крупнейшая ежегодная конференция по современным технологиям разработки.', 'Конференция', '2026-05-15', '10:00', 'Москва, Технопарк Сколково', 500, 'upcoming', new Date().toISOString()],
      [1, 'Весенний тимбилдинг', 'Корпоративное мероприятие на природе с активными играми.', 'Корпоратив', '2026-04-28', '12:00', 'Подмосковье, База отдыха «Сосны»', 80, 'upcoming', new Date().toISOString()],
      [1, 'Мастер-класс по каллиграфии', 'Погружение в искусство рукописного письма.', 'Мастер-класс', '2026-04-20', '15:00', 'СПб, Арт-пространство Севкабель', 25, 'active', new Date().toISOString()],
    ];

    demoEvents.forEach(event => insertEvent.run(...event));
  }
};
initDemoData();

// API Эндпоинты
// Пользователи
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, error: 'Неверный email или пароль' });
  }
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.json({ success: false, error: 'Пользователь уже существует' });

  const result = db.prepare('INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)')
    .run(name, email, password, new Date().toISOString());

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, user });
});

// Мероприятия
app.get('/api/events/:userId', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE userId = ? ORDER BY date ASC').all(req.params.userId);
  res.json(events);
});

app.get('/api/event/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(event || {});
});

app.post('/api/events', (req, res) => {
  const { userId, title, description, category, date, time, location, capacity } = req.body;
  const result = db.prepare(`
    INSERT INTO events (userId, title, description, category, date, time, location, capacity, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, title, description, category, date, time, location, capacity, new Date().toISOString());

  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/events/:id', (req, res) => {
  const { title, description, category, date, time, location, capacity } = req.body;
  db.prepare(`
    UPDATE events SET
      title = ?, description = ?, category = ?, date = ?, time = ?, location = ?, capacity = ?
    WHERE id = ?
  `).run(title, description, category, date, time, location, capacity, req.params.id);

  res.json({ success: true });
});

app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API сервер запущен на http://localhost:${PORT}`);
});