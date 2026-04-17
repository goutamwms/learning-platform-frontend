import { useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAllCourses, useCategories, useUpdateCourse, useDeleteCourse } from '../hooks';
import { Button } from '../components/common';
import { generateSlug } from '../utils/slug';

const PAGE_SIZE = 10;

type SortField = 'title' | 'created_at' | 'lesson_count';
type SortOrder = 'asc' | 'desc';

const SortIcon = ({
  field,
  sortField,
  sortOrder,
}: {
  field: SortField;
  sortField: SortField;
  sortOrder: SortOrder;
}) => (
  <span className={`ml-1 ${sortField === field ? 'text-[#aa3bff]' : 'text-[#9ca3af]'}`}>
    {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
  </span>
);

export function Subcategories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');
  const categoryFilter =
    categoryParam && !isNaN(Number(categoryParam)) ? Number(categoryParam) : undefined;
  const page = Number(searchParams.get('page') || '1');

  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get('sort_by') as SortField) || 'title'
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get('sort_order') as SortOrder) || 'asc'
  );
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const search = useMemo(() => searchParams.get('search') || '', [searchParams]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    title: string;
    slug: string;
    description: string;
    category_id: number;
  } | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categories } = useCategories();

  const { data, isLoading, isFetching } = useAllCourses({
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category_id: categoryFilter,
    sort_by: sortField,
    sort_order: sortOrder,
  });

  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        if (value) {
          newParams.set('search', value);
        } else {
          newParams.delete('search');
        }
        return newParams;
      });
    }, 300);
  };

  const handleSort = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort_by', field);
      newParams.set('sort_order', newOrder);
      newParams.set('page', '1');
      return newParams;
    });
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '1');
      if (categoryId) {
        newParams.set('category', String(categoryId));
      } else {
        newParams.delete('category');
      }
      return newParams;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', String(newPage));
      return newParams;
    });
  };

  const startEditing = useCallback(
    (course: {
      id: number;
      title: string;
      slug: string;
      description: string | null;
      category_id: number;
    }) => {
      setEditingId(course.id);
      setEditValues({
        title: course.title,
        slug: course.slug,
        description: course.description || '',
        category_id: course.category_id,
      });
    },
    []
  );

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditValues(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingId || !editValues) return;

    if (!editValues.title.trim() || !editValues.slug.trim()) return;

    try {
      await updateCourse.mutateAsync({
        id: editingId,
        data: {
          title: editValues.title,
          slug: editValues.slug,
          description: editValues.description || undefined,
          category_id: editValues.category_id,
        },
      });
      setEditingId(null);
      setEditValues(null);
    } catch (error) {
      console.error('Failed to update subcategory:', error);
    }
  }, [editingId, editValues, updateCourse]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteCourse.mutateAsync(id);
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Failed to delete subcategory:', error);
      }
    },
    [deleteCourse]
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  /*
  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`ml-1 ${sortField === field ? 'text-[#aa3bff]' : 'text-[#9ca3af]'}`}>
      {sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
  */

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-1/4" />
          <div className="h-12 bg-[#f4f3ec] dark:bg-[#2e303a] rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#f4f3ec] dark:bg-[#2e303a] rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">
            Subcategories
          </h1>
          <p className="text-sm text-[#6b6375] dark:text-[#9ca3af] mt-1">
            {data?.total ?? 0} total subcategories
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
          />
        </div>
        <select
          value={categoryFilter || ''}
          onChange={e => handleCategoryFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-4 py-2 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
        >
          <option value="">All Categories</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-[#16171d] border border-[#e5e4e7] dark:border-[#2e303a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e4e7] dark:border-[#2e303a] bg-[#f4f3ec] dark:bg-[#1a1b1f]">
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[#08060d] dark:text-[#f3f4f6] cursor-pointer hover:bg-[#e5e4e7] dark:hover:bg-[#2e303a]"
                  onClick={() => handleSort('title')}
                >
                  Title <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
                  Category
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[#08060d] dark:text-[#f3f4f6] cursor-pointer hover:bg-[#e5e4e7] dark:hover:bg-[#2e303a]"
                  onClick={() => handleSort('lesson_count')}
                >
                  Lessons{' '}
                  <SortIcon field="lesson_count" sortField={sortField} sortOrder={sortOrder} />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-[#08060d] dark:text-[#f3f4f6] cursor-pointer hover:bg-[#e5e4e7] dark:hover:bg-[#2e303a]"
                  onClick={() => handleSort('created_at')}
                >
                  Created{' '}
                  <SortIcon field="created_at" sortField={sortField} sortOrder={sortOrder} />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e4e7] dark:divide-[#2e303a]">
              {data?.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[#6b6375] dark:text-[#9ca3af]"
                  >
                    {search ? 'No subcategories match your search' : 'No subcategories found'}
                  </td>
                </tr>
              ) : (
                data?.items.map(course => (
                  <tr
                    key={course.id}
                    className={`${isFetching ? 'opacity-50' : ''} hover:bg-[#f4f3ec] dark:hover:bg-[#1a1b1f] transition-colors`}
                  >
                    <td className="px-4 py-3">
                      {editingId === course.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editValues?.title || ''}
                            onChange={e =>
                              setEditValues(prev =>
                                prev ? { ...prev, title: e.target.value } : null
                              )
                            }
                            onBlur={() => {
                              if (editValues && !editValues.slug && editValues.title) {
                                setEditValues(prev =>
                                  prev ? { ...prev, slug: generateSlug(editValues.title) } : null
                                );
                              }
                            }}
                            className="w-full px-2 py-1 text-sm rounded border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editValues?.slug || ''}
                            onChange={e =>
                              setEditValues(prev =>
                                prev ? { ...prev, slug: e.target.value } : null
                              )
                            }
                            className="w-full px-2 py-1 text-sm rounded border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
                            placeholder="slug"
                          />
                          <textarea
                            value={editValues?.description || ''}
                            onChange={e =>
                              setEditValues(prev =>
                                prev ? { ...prev, description: e.target.value } : null
                              )
                            }
                            className="w-full px-2 py-1 text-sm rounded border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff] resize-none"
                            rows={2}
                            placeholder="Description (optional)"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-[#08060d] dark:text-[#f3f4f6]">
                            {course.title}
                          </div>
                          {course.description && (
                            <div className="text-sm text-[#6b6375] dark:text-[#9ca3af] truncate max-w-xs">
                              {course.description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === course.id ? (
                        <select
                          value={editValues?.category_id || ''}
                          onChange={e =>
                            setEditValues(prev =>
                              prev ? { ...prev, category_id: Number(e.target.value) } : null
                            )
                          }
                          className="px-2 py-1 text-sm rounded border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
                        >
                          {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-[#6b6375] dark:text-[#9ca3af]">
                          {course.category_title}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 text-sm font-medium rounded-full bg-[#f4f3ec] dark:bg-[#2e303a] text-[#08060d] dark:text-[#f3f4f6]">
                        {course.lesson_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6b6375] dark:text-[#9ca3af]">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === course.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" onClick={saveEdit} disabled={updateCourse.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      ) : deleteConfirmId === course.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDelete(course.id)}
                            disabled={deleteCourse.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditing(course)}
                            className="text-sm text-[#aa3bff] hover:underline"
                          >
                            Edit
                          </button>
                          <span className="text-[#e5e4e7] dark:text-[#2e303a]">|</span>
                          <button
                            onClick={() => navigate(`/admin/lessons/new?course=${course.id}`)}
                            className="text-sm text-[#aa3bff] hover:underline"
                          >
                            Add Lesson
                          </button>
                          <span className="text-[#e5e4e7] dark:text-[#2e303a]">|</span>
                          <button
                            onClick={() => setDeleteConfirmId(course.id)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e4e7] dark:border-[#2e303a] bg-[#f4f3ec] dark:bg-[#1a1b1f]">
            <div className="text-sm text-[#6b6375] dark:text-[#9ca3af]">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, data?.total || 0)}{' '}
              of {data?.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 text-sm rounded ${
                        page === pageNum
                          ? 'bg-[#aa3bff] text-white'
                          : 'text-[#08060d] dark:text-[#f3f4f6] hover:bg-[#e5e4e7] dark:hover:bg-[#2e303a]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
