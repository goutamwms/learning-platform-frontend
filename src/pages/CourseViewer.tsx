import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCategory, useLesson, useDeleteLesson } from '../hooks';
import { Header, Sidebar, Button } from '../components/common';
import { LessonContent, LessonMeta } from '../components/viewer';

export function CourseViewer() {
  const params = useParams();
  const navigate = useNavigate();
  
  const categorySlug = params.categorySlug;
  const courseSlug = params.courseSlug;
  const lessonSlug = params.lessonSlug;

  const { data: category, isLoading, error: categoryError } = useCategory(categorySlug || '');
  
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useLesson({
    categorySlug: categorySlug || '',
    lessonSlug: lessonSlug || '',
    courseSlug,
  });

  const deleteLesson = useDeleteLesson();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');

  useEffect(() => {
    if (category && !lessonSlug) {
      const firstLesson = findFirstLesson(category);
      if (firstLesson) {
        if (firstLesson.courseSlug) {
          navigate(`/courses/${categorySlug}/${firstLesson.courseSlug}/${firstLesson.lessonSlug}`, { replace: true });
        } else {
          navigate(`/courses/${categorySlug}/${firstLesson.lessonSlug}`, { replace: true });
        }
      }
    }
  }, [category, lessonSlug, navigate, categorySlug]);

  const handleDelete = async () => {
    if (!lesson || deleteConfirmText !== lesson.title) return;
    try {
      setShowDeleteConfirm(false);
      await deleteLesson.mutateAsync(lesson.id);
      navigate(`/courses/${categorySlug}`, { replace: true });
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      setShowDeleteConfirm(true);
    }
  };

  const findNextLesson = () => {
    if (!category || !lesson) return null;
    
    for (const course of category.courses) {
      const lessonIndex = course.lessons.findIndex((l) => l.slug === lessonSlug);
      if (lessonIndex !== -1) {
        if (lessonIndex < course.lessons.length - 1) {
          return { lessonSlug: course.lessons[lessonIndex + 1].slug, courseSlug: course.slug };
        }
      }
    }
    
    const directIndex = category.direct_lessons.findIndex((l) => l.slug === lessonSlug);
    if (directIndex !== -1 && directIndex < category.direct_lessons.length - 1) {
      return { lessonSlug: category.direct_lessons[directIndex + 1].slug, courseSlug: undefined };
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="w-64 flex-shrink-0 bg-[#fafafa] dark:bg-[#1a1b1f] border-r border-[#e5e4e7] dark:border-[#2e303a] p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-3/4" />
              <div className="h-4 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-1/2" />
              <div className="h-4 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-2/3" />
            </div>
          </aside>
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-1/2" />
              <div className="h-4 bg-[#f4f3ec] dark:bg-[#2e303a] rounded w-1/4" />
              <div className="h-64 bg-[#f4f3ec] dark:bg-[#2e303a] rounded" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">
              Category not found
            </h1>
            <p className="text-[#6b6375] dark:text-[#9ca3af] mt-2">
              The category you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (lessonError || (!lessonLoading && !lesson && lessonSlug)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">
              Lesson not found
            </h1>
            <p className="text-[#6b6375] dark:text-[#9ca3af] mt-2">
              The lesson you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => navigate(`/courses/${categorySlug}`)}
              className="mt-4 px-4 py-2 bg-[#aa3bff] text-white rounded-lg hover:bg-[#9333ea] transition-colors"
            >
              Back to {category?.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lessonSlug || !lesson) {
    return null;
  }

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: category.title, href: `/courses/${category.slug}` },
  ];
  
  if (courseSlug) {
    const course = category.courses.find((c) => c.slug === courseSlug);
    if (course) {
      breadcrumbs.push({ label: course.title });
    }
  }
  
  breadcrumbs.push({ label: lesson.title });

  const getCurrentCourseId = () => {
    if (!courseSlug) return undefined;
    const course = category.courses.find(c => c.slug === courseSlug);
    return course?.id;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar 
          category={category} 
          activeLessonSlug={lessonSlug} 
          activeCourseSlug={courseSlug}
          searchQuery={sidebarSearch}
          onSearchChange={setSidebarSearch}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <LessonMeta
                  title={lesson.title}
                  breadcrumbs={breadcrumbs}
                  lastUpdated={lesson.updated_at}
                  lessonId={lesson.id}
                  showDelete={true}
                  onDelete={() => {
                    setDeleteConfirmText('');
                    setShowDeleteConfirm(true);
                  }}
                />
              </div>
              <Link
                to={`/admin/lessons/new?category=${category.id}${courseSlug ? `&course=${getCurrentCourseId()}` : ''}`}
                className="ml-4 px-4 py-2 bg-[#aa3bff] text-white text-sm font-medium rounded-lg hover:bg-[#9333ea] transition-colors whitespace-nowrap"
              >
                + Add Lesson
              </Link>
            </div>
            {lesson.content ? (
              <LessonContent content={lesson.content} />
            ) : (
              <div className="text-center py-12 text-[#6b6375] dark:text-[#9ca3af]">
                <p>No content yet. Edit this lesson to add content.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#16171d] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-[#08060d] dark:text-[#f3f4f6] mb-4">
              Delete Lesson
            </h2>
            <p className="text-[#6b6375] dark:text-[#9ca3af] mb-4">
              Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
            </p>
            <p className="text-sm text-[#6b6375] dark:text-[#9ca3af] mb-2">
              Type <span className="font-medium text-[#08060d] dark:text-[#f3f4f6]">{lesson.title}</span> to confirm:
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
                disabled={deleteConfirmText !== lesson.title || deleteLesson.isPending}
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

function findFirstLesson(category: ReturnType<typeof useCategory>['data']) {
  if (!category) return null;
  
  for (const course of category.courses) {
    if (course.lessons.length > 0) {
      return {
        lessonSlug: course.lessons[0].slug,
        courseSlug: course.slug,
      };
    }
  }
  
  if (category.direct_lessons.length > 0) {
    return {
      lessonSlug: category.direct_lessons[0].slug,
      courseSlug: undefined,
    };
  }
  
  return null;
}
