import { createRootRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../lib/api';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  const checkAuth = () => {
    const token = api.getToken();
    if (!token) {
      setIsAuth(false);
      return;
    }
    api.me()
      .then((data) => setIsAuth(data.success))
      .catch(() => setIsAuth(false));
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth:changed', checkAuth);
    return () => window.removeEventListener('auth:changed', checkAuth);
  }, []);

  if (isAuth === null) {
    return <div className="auth-loading"><div className="empty-state-icon" style={{ animation: 'spin 1s linear infinite' }}>◌</div></div>;
  }

  const pathname = window.location.pathname;

  if (!isAuth && pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (isAuth && pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app">
      {isAuth && <Navbar />}
      <Outlet />
    </div>
  );
}