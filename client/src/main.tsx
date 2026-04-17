import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider, createRoute as createRouteFunc } from '@tanstack/react-router';
import './index.css';

// Импортируем роуты
import { Route as rootRoute } from './routes/__root';
import LoginPage from './routes/login';

const indexRoute = createRouteFunc({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => import('./routes/index.lazy').then(mod => <mod.default />),
});

const createRoute = createRouteFunc({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: () => import('./routes/create.lazy').then(mod => <mod.default />),
});

const loginRoute = createRouteFunc({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Создаём роутер
const routeTree = rootRoute.addChildren([
  indexRoute,
  createRoute,
  loginRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);