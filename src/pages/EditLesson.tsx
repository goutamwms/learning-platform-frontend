import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories, useCourses, useLessonById, useUpdateLesson, useDeleteLesson } from '../hooks';
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
  
  const [lessonData, setLessonData] = useState<{
    id: number;
    category_id: number;
    course_id: number | null;
    title: string;
    slug: string;
    content: string;
  } | null>(null);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  
  const category = categories?.find((c) => c.id === lessonData?.category_id);
  const { data: courses } = useCourses(lessonData?.category_id || 0);
  
  useEffect(() => {
    if (lesson) {
      setLessonData(lesson as typeof lessonData);
      setTitle(lesson.title);
      setSlug(lesson.slug);
      setContent(lesson.content || '');
      setCourseId(lesson.course_id || '');
      setCategoryId(lesson.category_id);
    }
  }, [lesson]);

  const { saveStatus } = useAutoSave(
    content,
    lessonData?.id || null,
    async (newContent) => {
      if (!lessonData?.id) return;
      await updateLesson.mutateAsync({
        id: lessonData.id,
        data: { content: newContent },
      });
    },
    500
  );

  const handleTitleBlur = () => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  };

  const handleSaveMetadata = async () => {
    if (!lessonData?.id) return;
    try {
      await updateLesson.mutateAsync({
        id: lessonData.id,
        data: { title, slug },
      });
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  };

  const handleCategoryChange = (newCategoryId: number) => {
    setCategoryId(newCategoryId);
    setCourseId('');
    if (lessonData?.id) {
      updateLesson.mutate({
        id: lessonData.id,
        data: { category_id: newCategoryId },
      });
    }
  };

  const handleCourseChange = (newCourseId: number | '') => {
    setCourseId(newCourseId);
    if (lessonData?.id) {
      updateLesson.mutate({
        id: lessonData.id,
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
    if (!lessonData?.id || deleteConfirmText !== lesson.title) return;
    try {
      await deleteLesson.mutateAsync(lessonData.id);
      navigate('/admin');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const categorySlug = categories?.find(c => c.id === lessonData?.category_id)?.slug;
  const courseSlug = courses?.find(c => c.id === lessonData?.course_id)?.slug;

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

  if (!lessonData) {
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
          <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">
            Edit Lesson
          </h1>
          {category && (
            <p className="text-sm text-[#6b6375] dark:text-[#9ca3af]">
              {category.title}
              {courses?.find((c) => c.id === courseId) && 
                ` > ${courses.find((c) => c.id === courseId)?.title}`
              }
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
              value={categoryId}
              onChange={(e) => handleCategoryChange(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#1a1b1f] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            >
              <option value="">Select Category</option>
              {categories?.map((cat) => (
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
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full px-3 py-2 rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#1a1b1f] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            >
              <option value="">No Subcategory (Direct Lesson)</option>
              {courses?.map((course) => (
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
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSaveMetadata();
            }
          }}
        />

        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={handleSaveMetadata}
          onKeyDown={(e) => {
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
          <RichEditor content={content} onChange={setContent} />
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#16171d] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-[#08060d] dark:text-[#f3f4f6] mb-4">
              Delete Lesson
            </h2>
            <p className="text-[#6b6375] dark:text-[#9ca3af] mb-4">
              Are you sure you want to delete "{lessonData?.title}"? This action cannot be undone.
            </p>
            <p className="text-sm text-[#6b6375] dark:text-[#9ca3af] mb-2">
              Type <span className="font-medium text-[#08060d] dark:text-[#f3f4f6]">{lessonData?.title}</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
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
                disabled={deleteConfirmText !== lessonData?.title || deleteLesson.isPending}
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
