import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCategories,
  useCourses,
  useLessonById,
  useUpdateLesson,
  useDeleteLesson,
} from '../hooks';
import { Button, Input } from '../components/common';
import { RichEditor } from '../components/editor';
import { SaveIndicator } from '../components/common';
import { useAutoSave } from '../hooks';
import { generateSlug } from '../utils/slug';

export function EditLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const { data: categories } = useCategories();
  const lessonId = id ? parseInt(id, 10) : null;
  const { data: lesson, isLoading } = useLessonById(lessonId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [localChanges, setLocalChanges] = useState<{
    title?: string;
    slug?: string;
    content?: string;
    category_id?: number | '';
    course_id?: number | '';
  }>({});

  const formData = useMemo(() => {
    if (!lesson) return null;
    return {
      id: lesson.id,
      category_id: lesson.category_id,
      course_id: lesson.course_id || null,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content || '',
    };
  }, [lesson]);

  const mergedData = useMemo(() => {
    if (!formData) return null;
    return {
      ...formData,
      ...localChanges,
      category_id:
        localChanges.category_id !== undefined ? localChanges.category_id : formData.category_id,
      course_id: localChanges.course_id !== undefined ? localChanges.course_id : formData.course_id,
      title: localChanges.title ?? formData.title,
      slug: localChanges.slug ?? formData.slug,
      content: localChanges.content ?? formData.content,
    };
  }, [formData, localChanges]);

  const category = categories?.find(c => c.id === mergedData?.category_id);
  const { data: courses } = useCourses(mergedData?.category_id || 0);

  const { saveStatus } = useAutoSave(
    mergedData?.content || '',
    mergedData?.id || null,
    async newContent => {
      if (!mergedData?.id) return;
      await updateLesson.mutateAsync({
        id: mergedData.id,
        data: { content: newContent },
      });
    },
    500
  );

  const handleTitleBlur = () => {
    if (mergedData?.title && !mergedData?.slug) {
      setLocalChanges(prev => ({ ...prev, slug: generateSlug(mergedData.title!) }));
    }
  };

  const handleSaveMetadata = async () => {
    if (!mergedData?.id) return;
    try {
      await updateLesson.mutateAsync({
        id: mergedData.id,
        data: { title: mergedData.title, slug: mergedData.slug },
      });
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  };

  const handleCategoryChange = (newCategoryId: number) => {
    setLocalChanges(prev => ({ ...prev, category_id: newCategoryId, course_id: '' }));
    if (mergedData?.id) {
      updateLesson.mutate({
        id: mergedData.id,
        data: { category_id: newCategoryId },
      });
    }
  };

  const handleCourseChange = (newCourseId: number | '') => {
    setLocalChanges(prev => ({ ...prev, course_id: newCourseId }));
    if (mergedData?.id) {
      updateLesson.mutate({
        id: mergedData.id,
        data: { course_id: newCourseId || null },
      });
    }
  };

  const handleBack = () => {
    if (categorySlug && lesson?.slug) {
      const url = lesson.course_id
        ? `/courses/${categorySlug}/${courseSlug}/${lesson.slug}`
        : `/courses/${categorySlug}/${lesson.slug}`;
      navigate(url);
    } else {
      navigate(-1);
    }
  };

  const handleDelete = async () => {
    if (!mergedData?.id || deleteConfirmText !== mergedData.title) return;
    try {
      await deleteLesson.mutateAsync(mergedData.id);
      navigate('/admin');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const categorySlug = categories?.find(c => c.id === mergedData?.category_id)?.slug;
  const courseSlug = courses?.find(c => c.id === mergedData?.course_id)?.slug;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-1/3" />
          <div className="h-4 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-2/3" />
          <div className="h-64 bg-[#f4f3ec] dark:bg-[#2e303a] rounded" />
        </div>
      </div>
    );
  }

  if (!mergedData) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-[#6b6375] dark:text-[#9ca3af]">Lesson not found</p>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">Edit Lesson</h1>
          {category && (
            <p className="text-sm text-[#6b6375] dark:text-[#9ca3af]">
              {category.title}
              {courses?.find(c => c.id === mergedData?.course_id) &&
                ` > ${courses.find(c => c.id === mergedData?.course_id)?.title}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator status={saveStatus} />
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteConfirm(true);
            }}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete Lesson
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6] mb-1">
              Category
            </label>
            <select
              value={mergedData?.category_id ?? ''}
              onChange={e => handleCategoryChange(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#1a1b1f] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            >
              <option value="">Select Category</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6] mb-1">
              Subcategory (Course)
            </label>
            <select
              value={mergedData?.course_id ?? ''}
              onChange={e => handleCourseChange(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#1a1b1f] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            >
              <option value="">No Subcategory (Direct Lesson)</option>
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
          value={mergedData?.title ?? ''}
          onChange={e => setLocalChanges(prev => ({ ...prev, title: e.target.value }))}
          onBlur={handleTitleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSaveMetadata();
            }
          }}
        />

        <Input
          label="Slug"
          value={mergedData?.slug ?? ''}
          onChange={e => setLocalChanges(prev => ({ ...prev, slug: e.target.value }))}
          onBlur={handleSaveMetadata}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSaveMetadata();
            }
          }}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            Content
          </label>
          <RichEditor
            content={mergedData?.content ?? ''}
            onChange={val => setLocalChanges(prev => ({ ...prev, content: val }))}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#16171d] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-[#08060d] dark:text-[#f3f4f6] mb-4">
              Delete Lesson
            </h2>
            <p className="text-[#6b6375] dark:text-[#9ca3af] mb-4">
              Are you sure you want to delete "{mergedData?.title}"? This action cannot be undone.
            </p>
            <p className="text-sm text-[#6b6375] dark:text-[#9ca3af] mb-2">
              Type{' '}
              <span className="font-medium text-[#08060d] dark:text-[#f3f4f6]">
                {mergedData?.title}
              </span>{' '}
              to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type lesson title to confirm"
              className="w-full px-3 py-2 mb-4 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteConfirmText !== mergedData?.title || deleteLesson.isPending}
                className="bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300"
              >
                {deleteLesson.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
