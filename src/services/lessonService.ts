import { api } from './api';
import type { Lesson } from '../types';

export const lessonService = {
  getBySlug: (categorySlug: string, lessonSlug: string, courseSlug?: string) => {
    if (courseSlug) {
      return api.get<Lesson>(`/lessons/${categorySlug}/${courseSlug}/${lessonSlug}`);
    }
    return api.get<Lesson>(`/lessons/${categorySlug}/${lessonSlug}`);
  },

  getById: (id: number) => {
    return api.get<Lesson>(`/lessons/${id}`);
  },

  create: (data: {
    category_id: number;
    course_id?: number | null;
    title: string;
    slug: string;
    content?: string;
  }) => api.post<Lesson>('/lessons', data),

  update: (
    id: number,
    data: {
      title?: string;
      slug?: string;
      content?: string;
      category_id?: number;
      course_id?: number | null;
    }
  ) => api.put<Lesson>(`/lessons/${id}`, data),

  delete: (id: number) => api.delete<void>(`/lessons/${id}`),
};
