import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatDate, getEventStatus, getStatusLabel } from '../../lib/utils';
import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
  index: number;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function EventCard({ event, index, onClick, onDelete }: EventCardProps) {
  const status = getEventStatus(event);

  return (
    <div
      className="event-card"
      onClick={onClick}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="event-card-header">
        <span className="event-category">{event.category}</span>
        <div className="event-header-actions">
          {event.isExample ? <Badge variant="example">ПРИМЕР</Badge> : null}
          <button
            className="event-menu"
            onClick={onDelete}
            title="Удалить"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="event-title">{event.title}</h3>
      <p className="event-description">{event.description || 'Без описания'}</p>

      <div className="event-meta">
        <div className="event-meta-row">
          <Calendar size={14} />
          {formatDate(event.date)}{event.time ? `, ${event.time}` : ''}
        </div>
        <div className="event-meta-row">
          <MapPin size={14} />
          {event.location || 'Место не указано'}
        </div>
        <div className="event-meta-row" style={{ justifyContent: 'space-between' }}>
          <span className={`event-status status-${status}`}>
            {getStatusLabel(status)}
          </span>
          {event.capacity ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {event.capacity} мест
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}