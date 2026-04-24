import type { Event } from '../types';

// const API_BASE = 'http://localhost:7878/api'; //dev
const API_BASE = '/api'; //prod

let accessToken: string | null = localStorage.getItem('access_token');

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

async function doRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success && data.accessToken) {
      accessToken = data.accessToken;
      localStorage.setItem('access_token', accessToken as string);
      return accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await doRefresh();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
      } else {
        accessToken = null;
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Сессия истекла');
      }
    }

    return new Promise((resolve, reject) => {
      addRefreshSubscriber((token) => {
        fetch(url, {
          ...options,
          headers: {
            ...getHeaders(),
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
          },
          credentials: 'include',
        })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  return res;
}

// ==================== API МЕТОДЫ ====================

export const api = {
  setToken(token: string | null) {
    accessToken = token;
    if (token) localStorage.setItem('access_token', token);
    else localStorage.removeItem('access_token');
    // setTimeout для того чтобы React успел обработать перерендер после отправки формы
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('auth:changed'));
    }, 0);
  },

  getToken() {
    return accessToken;
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success && data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success && data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  },

  async logout() {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    this.setToken(null);
  },

  async me() {
    const res = await fetchWithAuth(`${API_BASE}/me`);
    return res.json();
  },

  // Events
  async getEvents() {
    const res = await fetchWithAuth(`${API_BASE}/events`);
    return res.json();
  },

  async getEvent(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/events/${id}`);
    return res.json();
  },

  async createEvent(event: Partial<Event>) {
    const res = await fetchWithAuth(`${API_BASE}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
    return res.json();
  },

  async updateEvent(id: number, event: Partial<Event>) {
    const res = await fetchWithAuth(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
    return res.json();
  },

  async deleteEvent(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Reports
  async downloadReport(format: 'xlsx' | 'pdf') {
    const res = await fetchWithAuth(`${API_BASE}/reports/${format}`);
    if (!res.ok) throw new Error('Ошибка генерации отчёта');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const disposition = res.headers.get('content-disposition');
    const filename = disposition?.match(/filename="(.+?)"/)?.[1] || `report.${format}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

