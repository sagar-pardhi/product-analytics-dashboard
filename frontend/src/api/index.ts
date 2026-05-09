import axios from 'axios';
import { ProductsResponse, AnalyticsData, CategoryCount } from '../types';

// Vite uses import.meta.env (prefix VITE_), CRA uses process.env (prefix REACT_APP_)
const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: apiBase });

export const importFile = async (file: File): Promise<{ imported: number; message: string }> => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const fetchProducts = async (params: Record<string, unknown>): Promise<ProductsResponse> => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const fetchCategories = async (): Promise<{ data: CategoryCount[] }> => {
  const { data } = await api.get('/categories');
  return data;
};

export const fetchAnalytics = async (): Promise<{ data: AnalyticsData }> => {
  const { data } = await api.get('/analytics');
  return data;
};
