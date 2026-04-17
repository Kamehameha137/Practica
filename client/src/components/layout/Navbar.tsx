import { Link, useLocation } from '@tanstack/react-router';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Storage } from '../../lib/storage';

export function Navbar() {
  const location = useLocation();
  const user = Storage.getCurrentUser();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const toggleTheme = () => {
    const newTheme = Storage.getTheme() === 'light' ? 'dark' : 'light';
    Storage.setTheme(newTheme);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    if (confirm('Вы действительно хотите выйти?')) {
      Storage.logout();
      window.location.href = '/login';
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
            <button className="theme-toggle" onClick={toggleTheme} title="Переключить тему">
              {Storage.getTheme() === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
          <li>
            <div className="user-avatar" onClick={handleLogout} title={`${user.name} — выйти`}>
              {initials}
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}