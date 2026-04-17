import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Plus, Trash2, Calendar, MapPin } from 'lucide-react';
import { Storage } from '../lib/storage';
import { formatDate, getEventStatus, getStatusLabel } from '../lib/utils';
import type { Event } from '../types';

const CATEGORIES = ['all', 'Конференция', 'Корпоратив', 'Мастер-класс', 'Свадьба', 'Презентация'];

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(Storage.getUserEvents());
  };

  const filteredEvents = events
    .filter(e => activeCategory === 'all' || e.category === activeCategory)
    .filter(e => 
      search === '' || 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить мероприятие? Это действие нельзя отменить.')) {
      Storage.deleteEvent(id);
      loadEvents();
    }
  };

  return (
    <div className="container">
      <div className="page-header fade-up">
        <div className="page-header-text">
          <span className="eyebrow">Ваши события</span>
          <h1>Мероприятия, <span className="italic-accent">которые вы создаёте.</span></h1>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={16} />
          Новое мероприятие
        </Link>
      </div>

      <div className="filters fade-up">
        <div className="search-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'Все' : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◌</div>
          <h3>Мероприятий пока нет</h3>
          <p style={{ marginBottom: '24px' }}>Создайте первое мероприятие, чтобы начать планировать</p>
          <Link to="/create" className="btn btn-primary">
            Создать мероприятие
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event, index) => {
            const status = getEventStatus(event);
            return (
              <div
                key={event.id}
                className="event-card"
                onClick={() => navigate({ to: '/create', search: { id: event.id } })}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="event-card-header">
                  <span className="event-category">{event.category}</span>
                  <button
                    className="event-menu"
                    onClick={(e) => handleDelete(event.id, e)}
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
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
                    {event.capacity && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {event.capacity} мест
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}