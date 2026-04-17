import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, type GetCoursesParams, type CoursesResponse } from '../services';

export function useCourses(categoryId: number) {
  return useQuery({
    queryKey: ['courses', categoryId],
    queryFn: () => courseService.getByCategory(categoryId),
    staleTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });
}

export function useAllCourses(params: GetCoursesParams = {}) {
  const queryKey = ['allCourses', params];

  return useQuery<CoursesResponse>({
    queryKey,
    queryFn: () => courseService.getAll(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: previousData => previousData,
  });
}

export function useCourseById(id: number | null) {
  return useQuery({
    queryKey: ['courseById', id],
    queryFn: () => courseService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      category_id: number;
      title: string;
      slug: string;
      description?: string;
    }) => courseService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', variables.category_id] });
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; slug?: string; description?: string; category_id?: number };
    }) => courseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
