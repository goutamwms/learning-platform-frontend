import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseById, useCategories, useUpdateCourse } from '../hooks';
import { Button, Input } from '../components/common';
import { generateSlug } from '../utils/slug';

export function EditSubcategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateCourse = useUpdateCourse();
  const courseId = id ? parseInt(id, 10) : null;
  const { data: course, isLoading } = useCourseById(courseId);
  const { data: categories } = useCategories();

  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ category?: string; title?: string; slug?: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (course) {
      setCategoryId(course.category_id);
      setTitle(course.title);
      setSlug(course.slug);
      setDescription(course.description || '');
    }
  }, [course]);

  useEffect(() => {
    if (course) {
      const hasChanges =
        categoryId !== course.category_id ||
        title !== course.title ||
        slug !== course.slug ||
        description !== (course.description || '');
      setIsDirty(hasChanges);
    }
  }, [categoryId, title, slug, description, course]);

  const handleSave = async () => {
    const newErrors: { category?: string; title?: string; slug?: string } = {};
    if (!categoryId) newErrors.category = 'Please select a category';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateCourse.mutateAsync({
        id: courseId!,
        data: { category_id: categoryId as number, title, slug, description },
      });
      setIsDirty(false);
      navigate('/admin');
    } catch (error) {
      console.error('Failed to update subcategory:', error);
    }
  };

  const handleTitleBlur = () => {
    if (title && !slug) {
      setSlug(generateSlug(title));
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

  if (!course) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-[#6b6375] dark:text-[#9ca3af] mb-4">Subcategory not found</p>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">
          Edit Subcategory
        </h1>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Back
        </Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            Parent Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : '');
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff] ${
              errors.category ? 'border-red-500' : 'border-[#e5e4e7] dark:border-[#2e303a]'
            }`}
          >
            <option value="">Select a category...</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          onBlur={handleTitleBlur}
          placeholder="e.g., Two Pointers"
          error={errors.title}
        />

        <Input
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setErrors((prev) => ({ ...prev, slug: undefined }));
          }}
          placeholder="e.g., two-pointers"
          error={errors.slug}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            placeholder="A brief description of this subcategory..."
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={updateCourse.isPending || !isDirty}>
            {updateCourse.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
