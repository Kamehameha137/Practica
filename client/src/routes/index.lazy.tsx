import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Storage } from '../lib/storage';
import { PageHeader } from '../components/layout/PageHeader';
import { EventCard } from '../components/events/EventCard';
import { EmptyState } from '../components/events/EmptyState';
import type { Event } from '../types';

const CATEGORIES = ['all', 'Конференция', 'Корпоратив', 'Мастер-класс', 'Свадьба', 'Презентация', 'Другое'];

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      if (data.success) {
        const serverEvents: Event[] = data.events || [];
        // Если на сервере нет ивентов — подтягиваем mock из localStorage
        if (serverEvents.length === 0) {
          const mocks = Storage.getMockEvents();
          setEvents(mocks);
        } else {
          setEvents(serverEvents);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки ивентов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить мероприятие? Это действие нельзя отменить.')) return;

    // Если это mock — удаляем из localStorage
    if (id < 0) {
      Storage.removeMockEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      return;
    }

    // Иначе — с сервера
    try {
      const data = await api.deleteEvent(id);
      if (data.success) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const filteredEvents = events
    .filter((e) => activeCategory === 'all' || e.category === activeCategory)
    .filter((e) =>
      search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="container">
      <PageHeader
        eyebrow="Ваши события"
        title={<>Мероприятия, <span className="italic-accent">которые вы создаёте.</span></>}
        action={
          <Link to="/create" className="btn btn-primary">
            <Plus size={16} />
            Новое мероприятие
          </Link>
        }
      />

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
          {CATEGORIES.map((cat) => (
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

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ animation: 'spin 1s linear infinite' }}>◌</div>
          <h3>Загрузка...</h3>
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState hasSearch={search !== '' || activeCategory !== 'all'} />
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              onClick={() => navigate({ to: '/create', search: { id: String(event.id) } })}
              onDelete={(e) => handleDelete(event.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}