import { createRootRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../lib/api';
import { ModalConfirm } from '../components/ui/Modal';

// Глобальный контекст модальных окон
interface ModalContextType {
  showModal: (options: {
    title: string;
    message: string;
    onConfirm: () => void;
  }) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showModal = useCallback((options: { title: string; message: string; onConfirm: () => void }) => {
    setModalState({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(null);
  }, []);

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
    <ModalContext.Provider value={{ showModal, hideModal }}>
      <div className="app">
        {isAuth && <Navbar />}
        <Outlet />
      </div>

      {/* Глобальное модальное окно, рендерится над всем приложением */}
      {modalState && (
        <ModalConfirm
          isOpen={modalState.isOpen}
          close={hideModal}
          title={modalState.title}
          onConfirm={() => {
            modalState.onConfirm();
            hideModal();
          }}
        >
          {modalState.message}
        </ModalConfirm>
      )}
    </ModalContext.Provider>
  );
}
