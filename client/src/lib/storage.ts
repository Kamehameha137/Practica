const THEME_KEY = 'eventdesign_theme';
const MOCK_EVENTS_KEY = 'eventdesign_mock_events';
// const MOCK_SHOWN_KEY = 'eventdesign_mock_shown';

export interface MockEvent {
  id: number;
  title: string;
  description?: string;
  category: string;
  date: string;
  time?: string;
  location?: string;
  capacity?: number | null;
  status?: 'upcoming' | 'active' | 'completed';
  isExample: true;
}

const MOCK_EVENTS_TEMPLATE: Omit<MockEvent, 'id'>[] = [
  {
    title: 'Пример: Корпоративная встреча',
    description: 'Это пример мероприятия. Вы можете отредактировать или удалить его.',
    category: 'Корпоратив',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: '18:00',
    location: 'Москва, офис компании',
    capacity: 50,
    status: 'upcoming',
    isExample: true,
  },
  {
    title: 'Пример: Мастер-класс по дизайну',
    description: 'Ещё один пример. Попробуйте создать своё собственное мероприятие!',
    category: 'Мастер-класс',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: '14:00',
    location: 'Онлайн, Zoom',
    capacity: 30,
    status: 'upcoming',
    isExample: true,
  },
  {
    title: 'Пример: Презентация продукта',
    description: 'Третий пример для демонстрации возможностей приложения.',
    category: 'Презентация',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    time: '10:00',
    location: 'СПб, Конференц-зал «Невский»',
    capacity: 100,
    status: 'upcoming',
    isExample: true,
  },
];

export const Storage = {
  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
  },

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Mock events
  getMockEvents(): MockEvent[] {
    const data = localStorage.getItem(MOCK_EVENTS_KEY);
    if (data) return JSON.parse(data);
    // Initialize on first access
    const mocks = MOCK_EVENTS_TEMPLATE.map((e, i) => ({ ...e, id: -1000 - i }));
    localStorage.setItem(MOCK_EVENTS_KEY, JSON.stringify(mocks));
    return mocks;
  },

  setMockEvents(events: MockEvent[]) {
    localStorage.setItem(MOCK_EVENTS_KEY, JSON.stringify(events));
  },

  removeMockEvent(id: number) {
    const events = this.getMockEvents().filter(e => e.id !== id);
    this.setMockEvents(events);
  },

  hasMockEvents(): boolean {
    return this.getMockEvents().length > 0;
  },
};

// Init theme
document.documentElement.setAttribute('data-theme', Storage.getTheme());