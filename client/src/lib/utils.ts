import type { Event } from '../types';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function getEventStatus(event: Event): 'upcoming' | 'active' | 'completed' {
  if (event.status) return event.status;
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDate < today) return 'completed';
  if (eventDate.toDateString() === today.toDateString()) return 'active';
  return 'upcoming';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    upcoming: 'Предстоит',
    active: 'Сегодня',
    completed: 'Завершено'
  };
  return labels[status] || status;
}