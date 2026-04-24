export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Event {
  id: number;
  userId?: number;
  title: string;
  description?: string;
  category: string;
  date: string;
  time?: string;
  location?: string;
  capacity?: number | null;
  status?: 'upcoming' | 'active' | 'completed';
  isExample?: boolean;
  createdAt?: string;
}

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}