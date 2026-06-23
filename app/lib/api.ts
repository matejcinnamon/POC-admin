import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  token: string;
  email: string;
  userId: string;
  isAdmin?: boolean;
}

export interface PaginatedResponse<T> {
  [key: string]: T[] | any;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getUsers = async (page = 1, limit = 20) => {
  const { data } = await api.get('/admin/users', { params: { page, limit } });
  return data;
};

export const getUserInvoices = async (userId: string, page = 1, limit = 20) => {
  const { data } = await api.get(`/admin/users/${userId}/invoices`, { params: { page, limit } });
  return data;
};

export const getAllInvoices = async (page = 1, limit = 20) => {
  const { data } = await api.get('/admin/invoices', { params: { page, limit } });
  return data;
};

export const setUserAdmin = async (userId: string, isAdmin: boolean) => {
  const { data } = await api.patch(`/admin/users/${userId}/admin`, { isAdmin });
  return data;
};

export default api;
