import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Storage } from '../lib/storage';
import type { Event } from '../types';

const CATEGORIES = ['Конференция', 'Корпоратив', 'Мастер-класс', 'Свадьба', 'Презентация', 'Другое'];

const eventSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  description: z.string().optional(),
  category: z.string().min(1, 'Выберите категорию'),
  date: z.string().min(1, 'Укажите дату'),
  time: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().nullable().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { id?: string };
  const [isEdit, setIsEdit] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      date: '',
      time: '',
      location: '',
      capacity: null,
    },
  });

  useEffect(() => {
    if (search.id) {
      setIsEdit(true);
      const event = Storage.getEventById(Number(search.id));
      if (event) {
        form.reset({
          title: event.title,
          description: event.description || '',
          category: event.category,
          date: event.date,
          time: event.time || '',
          location: event.location || '',
          capacity: event.capacity || null,
        });
      }
    }
  }, [search.id, form]);

  const onSubmit = (data: EventFormData) => {
    const eventData = {
      ...data,
      capacity: data.capacity || null,
    };

    let result;
    if (isEdit && search.id) {
      result = Storage.updateEvent(Number(search.id), eventData);
    } else {
      result = Storage.createEvent(eventData);
    }

    if (result.success) {
      alert(isEdit ? 'Изменения сохранены' : 'Мероприятие создано!');
      navigate({ to: '/' });
    } else {
      alert(result.error);
    }
  };

  const handleDelete = () => {
    if (confirm('Удалить мероприятие? Это действие нельзя отменить.') && search.id) {
      Storage.deleteEvent(Number(search.id));
      alert('Мероприятие удалено');
      navigate({ to: '/' });
    }
  };

  return (
    <div className="container-medium">
      <div className="page-header fade-up" style={{ marginBottom: '32px' }}>
        <div className="page-header-text">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
            <ArrowLeft size={14} />
            К списку мероприятий
          </Link>
          <h1>
            {isEdit ? 'Редактировать' : 'Новое'} <span className="italic-accent">мероприятие.</span>
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="fade-up">
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">Основное</h3>
            <p className="form-section-subtitle">Название и описание вашего мероприятия</p>

            <div className={`form-group ${form.formState.errors.title ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="title">Название мероприятия *</label>
              <input
                type="text"
                id="title"
                className="form-input"
                placeholder="Например: Весенняя конференция 2026"
                {...form.register('title')}
              />
              <div className="form-error">{form.formState.errors.title?.message}</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Описание</label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Краткое описание, цели и особенности мероприятия..."
                {...form.register('description')}
              />
              <div className="form-hint">Рекомендуем 2-3 предложения, чтобы было понятно о чём речь</div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Категория</h3>
            <p className="form-section-subtitle">Выберите тип мероприятия</p>

            <div className="category-selector">
              {CATEGORIES.map(cat => (
                <label className="category-option" key={cat}>
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    {...form.register('category')}
                  />
                  <span className="category-option-label">{cat}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.category && (
              <div className="form-error" style={{ display: 'block', marginTop: '12px' }}>
                {form.formState.errors.category.message}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Дата и место</h3>
            <p className="form-section-subtitle">Когда и где пройдёт мероприятие</p>

            <div className="form-row">
              <div className={`form-group ${form.formState.errors.date ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="date">Дата *</label>
                <input
                  type="date"
                  id="date"
                  className="form-input"
                  {...form.register('date')}
                />
                <div className="form-error">{form.formState.errors.date?.message}</div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="time">Время</label>
                <input
                  type="time"
                  id="time"
                  className="form-input"
                  {...form.register('time')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Место проведения</label>
              <input
                type="text"
                id="location"
                className="form-input"
                placeholder="Город, адрес или название площадки"
                {...form.register('location')}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="capacity">Вместимость (количество участников)</label>
              <input
                type="number"
                id="capacity"
                className="form-input"
                placeholder="Например: 100"
                min="1"
                {...form.register('capacity', { valueAsNumber: true })}
              />
              <div className="form-hint">Оставьте пустым, если нет ограничений</div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          {isEdit && (
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} />
              Удалить
            </button>
          )}
          <div className="form-actions-end">
            <Link to="/" className="btn btn-secondary">Отмена</Link>
            <button type="submit" className="btn btn-primary">
              Сохранить
              <Check size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}