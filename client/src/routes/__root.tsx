import { createRootRoute, Outlet, Navigate } from '@tanstack/react-router';
import { Navbar } from '../components/layout/Navbar';
import { Storage } from '../lib/storage';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const user = Storage.getCurrentUser();
  const pathname = window.location.pathname;

  if (!user && pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (user && pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app">
      {user && <Navbar />}
      <Outlet />
    </div>
  );
}