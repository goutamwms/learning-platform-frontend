import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services';
import type { Category, CategoryWithContent } from '../types';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(slug: string) {
  return useQuery<CategoryWithContent>({
    queryKey: ['category', slug],
    queryFn: () => categoryService.getBySlug(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryById(id: number | null) {
  return useQuery<Category>({
    queryKey: ['categoryById', id],
    queryFn: () => categoryService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; slug: string; description?: string }) =>
      categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; slug?: string; description?: string };
    }) => categoryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
