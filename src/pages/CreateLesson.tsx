import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories, useCourses, useCreateLesson } from '../hooks';
import { Button, Input } from '../components/common';
import { RichEditor } from '../components/editor';
import { SaveIndicator } from '../components/common';
import { useAutoSave } from '../hooks';
import { generateSlug } from '../utils/slug';

export function CreateLesson() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createLesson = useCreateLesson();
  const { data: categories } = useCategories();

  const [categoryId, setCategoryId] = useState<number | ''>(
    Number(searchParams.get('category')) || ''
  );
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');

  const { data: courses } = useCourses(categoryId as number);

  const [errors, setErrors] = useState<{ category?: string; title?: string; slug?: string }>({});

  const { saveStatus } = useAutoSave(content, null, async () => {}, 500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { category?: string; title?: string; slug?: string } = {};
    if (!categoryId) newErrors.category = 'Please select a category';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const lesson = await createLesson.mutateAsync({
        category_id: categoryId as number,
        course_id: courseId || null,
        title,
        slug,
        content,
      });

      const category = categories?.find(c => c.id === categoryId);
      if (category && courseId) {
        const course = courses?.find(c => c.id === courseId);
        if (course) {
          navigate(`/courses/${category.slug}/${course.slug}/${lesson.slug}`);
        } else {
          navigate(`/courses/${category.slug}/${lesson.slug}`);
        }
      } else if (category) {
        navigate(`/courses/${category.slug}/${lesson.slug}`);
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Failed to create lesson:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">Create Lesson</h1>
        <SaveIndicator status={saveStatus} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
              Category
            </label>
            <select
              value={categoryId}
              onChange={e => {
                setCategoryId(e.target.value ? Number(e.target.value) : '');
                setCourseId('');
                setErrors(prev => ({ ...prev, category: undefined }));
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff] ${
                errors.category ? 'border-red-500' : 'border-[#e5e4e7] dark:border-[#2e303a]'
              }`}
            >
              <option value="">Select a category...</option>
              {categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
              Subcategory (optional)
            </label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value ? Number(e.target.value) : '')}
              disabled={!categoryId || !courses?.length}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff] disabled:opacity-50"
            >
              <option value="">None (direct lesson)</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Title"
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            setErrors(prev => ({ ...prev, title: undefined }));
          }}
          onBlur={() => {
            if (title && !slug) {
              setSlug(generateSlug(title));
            }
          }}
          placeholder="e.g., Introduction to Two Pointers"
          error={errors.title}
        />

        <Input
          label="Slug"
          value={slug}
          onChange={e => {
            setSlug(e.target.value);
            setErrors(prev => ({ ...prev, slug: undefined }));
          }}
          placeholder="e.g., introduction-to-two-pointers"
          error={errors.slug}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            Content
          </label>
          <RichEditor content={content} onChange={setContent} />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" disabled={createLesson.isPending}>
            {createLesson.isPending ? 'Creating...' : 'Create Lesson'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
