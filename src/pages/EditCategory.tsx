import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategoryById, useUpdateCategory } from '../hooks';
import { Button, Input } from '../components/common';
import { generateSlug } from '../utils/slug';

export function EditCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateCategory = useUpdateCategory();
  const categoryId = id ? parseInt(id, 10) : null;
  const { data: category, isLoading } = useCategoryById(categoryId);
  const [localChanges, setLocalChanges] = useState<{
    title?: string;
    slug?: string;
    description?: string;
  }>({});

  const [errors, setErrors] = useState<{ title?: string; slug?: string }>({});

  const formData = useMemo(() => {
    const base = category
      ? {
          title: category.title,
          slug: category.slug,
          description: category.description || '',
        }
      : {
          title: '',
          slug: '',
          description: '',
        };
    return { ...base, ...localChanges };
  }, [category, localChanges]);

  const isDirty = useMemo(() => {
    if (!category) return false;
    return (
      formData.title !== category.title ||
      formData.slug !== category.slug ||
      formData.description !== (category.description || '')
    );
  }, [formData, category]);

  const handleSave = async () => {
    const newErrors: { title?: string; slug?: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateCategory.mutateAsync({
        id: categoryId!,
        data: { title: formData.title, slug: formData.slug, description: formData.description },
      });
      navigate('/admin');
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleTitleBlur = () => {
    if (formData.title && !formData.slug) {
      setLocalChanges(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-1/3" />
          <div className="h-4 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-2/3" />
          <div className="h-32 bg-[#f4f3ec] dark:bg-[#2e303a] rounded" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-[#6b6375] dark:text-[#9ca3af] mb-4">Category not found</p>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">Edit Category</h1>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Back
        </Button>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4"
      >
        <Input
          label="Title"
          value={formData.title}
          onChange={e => {
            setLocalChanges(prev => ({ ...prev, title: e.target.value }));
            setErrors(prev => ({ ...prev, title: undefined }));
          }}
          onBlur={handleTitleBlur}
          placeholder="e.g., Coding Patterns"
          error={errors.title}
        />

        <Input
          label="Slug"
          value={formData.slug}
          onChange={e => {
            setLocalChanges(prev => ({ ...prev, slug: e.target.value }));
            setErrors(prev => ({ ...prev, slug: undefined }));
          }}
          placeholder="e.g., coding-patterns"
          error={errors.slug}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={e => setLocalChanges(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            placeholder="A brief description of this category..."
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={updateCategory.isPending || !isDirty}>
            {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
