import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '../services';
import type { Lesson } from '../types';

interface UseLessonParams {
  categorySlug: string;
  lessonSlug: string;
  courseSlug?: string;
}

export function useLesson(params: UseLessonParams) {
  return useQuery<Lesson>({
    queryKey: ['lesson', params],
    queryFn: () => lessonService.getBySlug(params.categorySlug, params.lessonSlug, params.courseSlug),
    staleTime: 10 * 60 * 1000,
  });
}

export function useLessonById(id: number | null) {
  return useQuery<Lesson>({
    queryKey: ['lessonById', id],
    queryFn: () => lessonService.getById(id!),
    enabled: id !== null,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      category_id: number;
      course_id?: number | null;
      title: string;
      slug: string;
      content?: string;
    }) => lessonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { title?: string; slug?: string; content?: string; category_id?: number; course_id?: number | null } }) =>
      lessonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['lessonById'] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => lessonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
      queryClient.invalidateQueries({ queryKey: ['lessonById'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
  });
}
