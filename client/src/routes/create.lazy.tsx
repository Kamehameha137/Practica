import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { api } from '../lib/api';
import { Storage } from '../lib/storage';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';

const CATEGORIES = ['Конференция', 'Корпоратив', 'Мастер-класс', 'Свадьба', 'Презентация', 'Другое'];

const eventSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  description: z.string().optional(),
  category: z.string().min(1, 'Выберите категорию'),
  date: z.string().min(1, 'Укажите дату'),
  time: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive('Вместимость должна быть положительным числом').nullable().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { id?: string };
  const [isEdit, setIsEdit] = useState(false);
  const [isExample, setIsExample] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      const id = Number(search.id);
      setIsEdit(true);

      // Если это mock (id < 0) — берём из localStorage
      if (id < 0) {
        const mocks = Storage.getMockEvents();
        const mock = mocks.find(m => m.id === id);
        if (mock) {
          setIsExample(true);
          form.reset({
            title: mock.title,
            description: mock.description || '',
            category: mock.category,
            date: mock.date,
            time: mock.time || '',
            location: mock.location || '',
            capacity: mock.capacity || null,
          });
        }
        return;
      }

      // Иначе — с сервера
      api.getEvent(id).then((data) => {
        if (data.success && data.event) {
          const e = data.event;
          form.reset({
            title: e.title,
            description: e.description || '',
            category: e.category,
            date: e.date,
            time: e.time || '',
            location: e.location || '',
            capacity: e.capacity || null,
          });
        }
      });
    }
  }, [search.id, form]);

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        capacity: data.capacity === null ? null : Number(data.capacity),
      };

      let result;
      if (isEdit && search.id) {
        const id = Number(search.id);
        if (id < 0) {
          // Обновляем mock в localStorage
          const mocks = Storage.getMockEvents();
          const idx = mocks.findIndex(m => m.id === id);
          if (idx !== -1) {
            mocks[idx] = { ...mocks[idx], ...payload };
            Storage.setMockEvents(mocks);
            navigate({ to: '/' });
            return;
          }
        }
        result = await api.updateEvent(id, payload);
      } else {
        result = await api.createEvent(payload);
      }

      if (result?.success) {
        navigate({ to: '/' });
      } else {
        alert(result?.error || 'Ошибка сохранения');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить мероприятие? Это действие нельзя отменить.') || !search.id) return;
    const id = Number(search.id);

    if (id < 0) {
      Storage.removeMockEvent(id);
      navigate({ to: '/' });
      return;
    }

    try {
      const data = await api.deleteEvent(id);
      if (data.success) {
        navigate({ to: '/' });
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div className="container-medium">
      <div className="page-header fade-up" style={{ marginBottom: '32px' }}>
        <div className="page-header-text">
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              marginBottom: '12px',
            }}
          >
            <ArrowLeft size={14} />
            К списку мероприятий
          </Link>
          <h1>
            {isEdit ? 'Редактировать' : 'Новое'} <span className="italic-accent">мероприятие.</span>
            {isExample && <Badge variant="example" className="ml-2">ПРИМЕР</Badge>}
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="fade-up">
        <div className="form-card">
          <div className="form-section">
            <h3 className="form-section-title">Основное</h3>
            <p className="form-section-subtitle">Название и описание вашего мероприятия</p>

            <Input
              id="title"
              label="Название мероприятия *"
              placeholder="Например: Весенняя конференция 2026"
              error={form.formState.errors.title?.message}
              {...form.register('title')}
            />

            <Textarea
              id="description"
              label="Описание"
              placeholder="Краткое описание, цели и особенности мероприятия..."
              hint="Рекомендуем 2-3 предложения, чтобы было понятно о чём речь"
              {...form.register('description')}
            />
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Категория</h3>
            <p className="form-section-subtitle">Выберите тип мероприятия</p>

            <div className="category-selector">
              {CATEGORIES.map((cat) => (
                <label className="category-option" key={cat}>
                  <input
                    type="radio"
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
              <Input
                id="date"
                type="date"
                label="Дата *"
                error={form.formState.errors.date?.message}
                {...form.register('date')}
              />
              <Input
                id="time"
                type="time"
                label="Время"
                {...form.register('time')}
              />
            </div>

            <Input
              id="location"
              label="Место проведения"
              placeholder="Город, адрес или название площадки"
              {...form.register('location')}
            />

            <Input
              id="capacity"
              type="number"
              label="Вместимость (количество участников)"
              placeholder="Например: 100"
              hint="Оставьте пустым, если нет ограничений"
              {...form.register('capacity', {
                setValueAs: (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
              })}
            />
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
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
              <Check size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}