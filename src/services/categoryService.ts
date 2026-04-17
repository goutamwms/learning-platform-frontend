import { api } from './api';
import type { Category, CategoryWithContent } from '../types';

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories'),

  getById: (id: number) => api.get<Category>(`/categories/by-id/${id}`),

  getBySlug: (slug: string) => api.get<CategoryWithContent>(`/categories/${slug}`),

  create: (data: { title: string; slug: string; description?: string }) =>
    api.post<Category>('/categories', data),

  update: (id: number, data: { title?: string; slug?: string; description?: string }) =>
    api.put<Category>(`/categories/${id}`, data),

  delete: (id: number) => api.delete<void>(`/categories/${id}`),
};
