import express from 'express';
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit';
import db from '../db/db.js';
import { authenticate } from '../helpers/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/xlsx', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE userId = ? ORDER BY date ASC').all(req.userId);
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.userId);

  const data = events.map(e => ({
    'ID': e.id,
    'Название': e.title,
    'Категория': e.category,
    'Дата': e.date,
    'Время': e.time || '-',
    'Место': e.location || '-',
    'Вместимость': e.capacity || '-',
    'Статус': e.status,
    'Описание': e.description || '-',
  }));

  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Мероприятия');

  ws['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 15 }, { wch: 12 },
    { wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 40 },
  ];

  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const filename = `EventDesign_Report_${user.name}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buf);
});

router.get('/pdf', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE userId = ? ORDER BY date ASC').all(req.userId);
  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.userId);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const filename = `EventDesign_Report_${user.name}_${new Date().toISOString().slice(0, 10)}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  doc.registerFont("chupep1", "../client/dist/fonts/OpenSans.ttf")
  doc.font("chupep1");

  doc.pipe(res);

  doc.fontSize(22).text('EventDesign — Отчёт по мероприятиям', 50, 50);
  doc.fontSize(12).fillColor('#666').text(`Пользователь: ${user.name} (${user.email})`, 50, 85);
  doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, 50, 102);
  doc.moveTo(50, 125).lineTo(550, 125).stroke('#ccc');

  let y = 150;

  if (events.length === 0) {
    doc.fontSize(14).fillColor('#999').text('Мероприятий пока нет.', 50, y);
  } else {
    events.forEach((event, i) => {
      if (y > 700) { doc.addPage(); y = 50; }

      doc.fontSize(14).fillColor('#333').text(`${i + 1}. ${event.title}`, 50, y);
      y += 22;

      doc.fontSize(10).fillColor('#666');
      doc.text(`Категория: ${event.category}`, 70, y); y += 14;
      doc.text(`Дата: ${event.date}${event.time ? ', ' + event.time : ''}`, 70, y); y += 14;
      if (event.location) { doc.text(`Место: ${event.location}`, 70, y); y += 14; }
      if (event.capacity) { doc.text(`Вместимость: ${event.capacity} чел.`, 70, y); y += 14; }
      doc.text(`Статус: ${event.status}`, 70, y); y += 14;
      if (event.description) { doc.text(`Описание: ${event.description}`, 70, y); y += 14; }
      y += 10;
      doc.moveTo(50, y).lineTo(550, y).stroke('#eee');
      y += 15;
    });
  }

  doc.end();
});

export default router;