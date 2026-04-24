import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api';
import { Input } from '../components/ui/Input';

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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirm: '' },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await api.login(data.email, data.password);
      if (result.success) {
        navigate({ to: '/' });
      } else {
        alert(result.error || 'Ошибка входа');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await api.register(data.name, data.email, data.password);
      if (result.success) {
        navigate({ to: '/' });
      } else {
        alert(result.error || 'Ошибка регистрации');
      }
    } finally {
      setIsLoading(false);
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
            <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
              Вход
            </button>
            <button className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
              Регистрация
            </button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="auth-form">
              <Input
                type="email"
                id="login-email"
                label="Email"
                placeholder="your@email.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Input
                type="password"
                id="login-password"
                label="Пароль"
                placeholder="••••••••"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                {isLoading ? 'Вход...' : 'Войти'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="auth-form">
              <Input
                type="text"
                id="register-name"
                label="Имя"
                placeholder="Иван Иванов"
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register('name')}
              />
              <Input
                type="email"
                id="register-email"
                label="Email"
                placeholder="your@email.com"
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <Input
                type="password"
                id="register-password"
                label="Пароль"
                placeholder="Минимум 6 символов"
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register('password')}
              />
              <Input
                type="password"
                id="register-password-confirm"
                label="Повторите пароль"
                placeholder="••••••••"
                error={registerForm.formState.errors.passwordConfirm?.message}
                {...registerForm.register('passwordConfirm')}
              />
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                {isLoading ? 'Создание...' : 'Создать аккаунт'}
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