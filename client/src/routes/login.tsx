import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Storage } from '../lib/storage';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    const result = Storage.loginUser(data.email, data.password);
    if (result.success) {
      alert('Добро пожаловать, ' + result.user!.name + '!');
      navigate({ to: '/' });
    } else {
      alert(result.error);
    }
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const result = Storage.registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.success) {
      alert('Аккаунт создан! Добро пожаловать.');
      navigate({ to: '/' });
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-logo">
          EventDesign<span style={{ color: '#6BAA8A' }}>.</span>
        </div>

        <div className="auth-visual-content">
          <h1>Организуйте события, <em>которые помнят.</em></h1>
          <p>Планируйте мероприятия, управляйте категориями и формируйте отчёты — всё в одном элегантном пространстве.</p>
        </div>

        <div className="auth-visual-footer">
          <span>© 2026 EventDesign</span>
          <span>Версия 1.0</span>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-inner fade-up">
          <h2>Добро пожаловать</h2>
          <p className="subtitle">Войдите в аккаунт или создайте новый, чтобы начать планировать мероприятия.</p>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Вход
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Регистрация
            </button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="auth-form">
              <div className={`form-group ${loginForm.formState.errors.email ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  className="form-input"
                  placeholder="your@email.com"
                  {...loginForm.register('email')}
                />
                <div className="form-error">{loginForm.formState.errors.email?.message}</div>
              </div>

              <div className={`form-group ${loginForm.formState.errors.password ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="login-password">Пароль</label>
                <input
                  type="password"
                  id="login-password"
                  className="form-input"
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                />
                <div className="form-error">{loginForm.formState.errors.password?.message}</div>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Войти
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              <div className="auth-divider">или</div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Попробовать с демо-аккаунтом: <br />
                <strong style={{ color: 'var(--text-secondary)' }}>demo@eventdesign.ru</strong> / <strong style={{ color: 'var(--text-secondary)' }}>demo1234</strong>
              </p>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="auth-form">
              <div className={`form-group ${registerForm.formState.errors.name ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="register-name">Имя</label>
                <input
                  type="text"
                  id="register-name"
                  className="form-input"
                  placeholder="Иван Иванов"
                  {...registerForm.register('name')}
                />
                <div className="form-error">{registerForm.formState.errors.name?.message}</div>
              </div>

              <div className={`form-group ${registerForm.formState.errors.email ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  className="form-input"
                  placeholder="your@email.com"
                  {...registerForm.register('email')}
                />
                <div className="form-error">{registerForm.formState.errors.email?.message}</div>
              </div>

              <div className={`form-group ${registerForm.formState.errors.password ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="register-password">Пароль</label>
                <input
                  type="password"
                  id="register-password"
                  className="form-input"
                  placeholder="Минимум 6 символов"
                  {...registerForm.register('password')}
                />
                <div className="form-error">{registerForm.formState.errors.password?.message}</div>
              </div>

              <div className={`form-group ${registerForm.formState.errors.passwordConfirm ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="register-password-confirm">Повторите пароль</label>
                <input
                  type="password"
                  id="register-password-confirm"
                  className="form-input"
                  placeholder="••••••••"
                  {...registerForm.register('passwordConfirm')}
                />
                <div className="form-error">{registerForm.formState.errors.passwordConfirm?.message}</div>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Создать аккаунт
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}