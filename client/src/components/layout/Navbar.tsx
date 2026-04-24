import { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Sun, Moon, LogOut, Settings, FileSpreadsheet, FileText } from 'lucide-react';
import { Storage } from '../../lib/storage';
import { api } from '../../lib/api';
import type { User } from '../../types';

export function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState(Storage.getTheme());

  useEffect(() => {
    api.me().then((data) => {
      if (data.success) setUser(data.user);
    }).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handler = () => setTheme(Storage.getTheme());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    Storage.setTheme(newTheme);
    setTheme(newTheme);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = async () => {
    if (confirm('Вы действительно хотите выйти?')) {
      await api.logout();
      window.location.href = '/login';
    }
  };

  const handleDownload = async (format: 'xlsx' | 'pdf') => {
    try {
      await api.downloadReport(format);
    } catch (err) {
      alert('Ошибка при скачивании отчёта');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          EventDesign<span className="logo-dot"></span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Мероприятия
            </Link>
          </li>
          <li>
            <Link
              to="/create"
              className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`}
            >
              Создать
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
            >
              <Settings size={16} />
            </Link>
          </li>
          <li>
            <div className="nav-dropdown">
              <button className="theme-toggle" onClick={() => handleDownload('xlsx')} title="Скачать XLSX">
                <FileSpreadsheet size={18} />
              </button>
            </div>
          </li>
          <li>
            <button className="theme-toggle" onClick={() => handleDownload('pdf')} title="Скачать PDF">
              <FileText size={18} />
            </button>
          </li>
          <li>
            <button className="theme-toggle" onClick={toggleTheme} title="Переключить тему">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
          <li>
            <div className="user-avatar" onClick={handleLogout} title={`${user.name} — выйти`}>
              {initials}
              <LogOut size={12} className="user-avatar-icon" />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}