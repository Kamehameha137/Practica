import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Sun, Moon, /*Monitor*/ } from 'lucide-react';
// import { PageHeader } from '../components/layout/PageHeader';
import { Storage } from '../lib/storage';

const THEMES = [
  { key: 'dark' as const, label: 'Тёмная', icon: <Moon size={18} /> },
  { key: 'light' as const, label: 'Светлая', icon: <Sun size={18} /> },
];

export default function SettingsPage() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(Storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
    Storage.setTheme(t);
    setThemeState(t);
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
            Настройки <span className="italic-accent">интерфейса.</span>
          </h1>
        </div>
      </div>

      <div className="settings-section fade-up">
        <h3 className="form-section-title">Внешний вид</h3>
        <p className="form-section-subtitle">Выберите тему оформления приложения</p>

        <div className="theme-selector">
          {THEMES.map((t) => (
            <button
              key={t.key}
              className={`theme-option ${theme === t.key ? 'active' : ''}`}
              onClick={() => setTheme(t.key)}
            >
              <div className="theme-option-icon">{t.icon}</div>
              <span className="theme-option-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section fade-up" style={{ marginTop: '24px' }}>
        <h3 className="form-section-title">О приложении</h3>
        <p className="form-section-subtitle">Информация о текущей версии</p>

        <div className="about-card">
          <div className="about-item">
            <span className="about-label">Название</span>
            <span className="about-value">EventDesign</span>
          </div>
          <div className="about-item">
            <span className="about-label">Версия</span>
            <span className="about-value">1.0.0</span>
          </div>
          <div className="about-item">
            <span className="about-label">Авторы</span>
            <span className="about-value">xc.ananas & kamehameha137</span>
          </div>
        </div>
      </div>
    </div>
  );
}