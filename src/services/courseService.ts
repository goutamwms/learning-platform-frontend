import { api } from './api';
import type { Course } from '../types';

export interface CourseWithCategory extends Course {
  category_title: string;
  lesson_count: number;
}

export interface CoursesResponse {
  items: CourseWithCategory[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface GetCoursesParams {
  skip?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  sort_by?: 'title' | 'created_at' | 'lesson_count';
  sort_order?: 'asc' | 'desc';
}

export const courseService = {
  getAll: (params: GetCoursesParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.set('skip', String(params.skip));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.category_id && !isNaN(params.category_id))
      searchParams.set('category_id', String(params.category_id));
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_order) searchParams.set('sort_order', params.sort_order);

    const query = searchParams.toString();
    return api.get<CoursesResponse>(`/courses${query ? `?${query}` : ''}`);
  },

  getByCategory: (categoryId: number) => api.get<Course[]>(`/categories/${categoryId}/courses`),

  getById: (id: number) => api.get<Course>(`/courses/${id}`),

  create: (data: { category_id: number; title: string; slug: string; description?: string }) =>
    api.post<Course>('/courses', data),

  update: (
    id: number,
    data: { title?: string; slug?: string; description?: string; category_id?: number }
  ) => api.put<Course>(`/courses/${id}`, data),

  delete: (id: number) => api.delete<void>(`/courses/${id}`),
};
