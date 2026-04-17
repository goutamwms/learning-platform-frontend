import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Accordion } from './Accordion';
import type { CategoryWithContent, Lesson } from '../../types';

interface SidebarProps {
  category: CategoryWithContent;
  activeLessonSlug?: string;
  activeCourseSlug?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface LessonLinkProps {
  lesson: Lesson;
  categorySlug: string;
  courseSlug?: string;
  isActive: boolean;
  index: number;
  onClick?: () => void;
}

function LessonLink({
  lesson,
  categorySlug,
  courseSlug,
  isActive,
  index,
  onClick,
}: LessonLinkProps) {
  const href = courseSlug
    ? `/courses/${categorySlug}/${courseSlug}/${lesson.slug}`
    : `/courses/${categorySlug}/${lesson.slug}`;

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`block py-1.5 px-3 text-sm rounded transition-colors ${
        isActive ? 'bg-[#555] text-[rgb(221,221,221)]' : 'text-[rgb(221,221,221)] hover:bg-[#555]'
      }`}
    >
      <span className="mr-2 text-[#9ca3af] dark:text-[#6b6375]">{index}.</span>
      {lesson.title}
    </Link>
  );
}

export function Sidebar({
  category,
  activeLessonSlug,
  activeCourseSlug,
  searchQuery = '',
  onSearchChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: { lesson: Lesson; courseSlug?: string }[] = [];

    for (const lesson of category.direct_lessons) {
      if (lesson.title.toLowerCase().includes(query)) {
        results.push({ lesson, courseSlug: undefined });
      }
    }

    for (const course of category.courses) {
      for (const lesson of course.lessons) {
        if (lesson.title.toLowerCase().includes(query)) {
          results.push({ lesson, courseSlug: course.slug });
        }
      }
    }

    return results;
  }, [category, searchQuery]);

  const directLessonsWithIndex = category.direct_lessons.map((lesson, idx) => ({
    lesson,
    index: idx + 1,
  }));

  const coursesWithLessons = category.courses.map(course => ({
    course,
    lessonsWithIndex: course.lessons.map((lesson, idx) => ({
      lesson,
      index: category.direct_lessons.length + idx + 1,
    })),
  }));

  const filteredWithIndex = filteredLessons?.map((item, idx) => ({
    ...item,
    index: idx + 1,
    totalDirect: category.direct_lessons.length,
    totalInCourses: category.courses.reduce((acc, c) => acc + c.lessons.length, 0),
  }));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 p-3 bg-[#aa3bff] text-white rounded-full shadow-lg"
        aria-label="Open sidebar"
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          lg:w-64 lg:flex-shrink-0 lg:relative
          fixed lg:sticky top-0 left-0 h-screen z-50
          border-r border-[#e5e4e7] dark:border-[#2e303a] 
          bg-[#484848] 
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium !text-[#aaa] truncate">{category.title}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-[#f4f3ec] dark:hover:bg-[#2e303a] rounded"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={e => onSearchChange?.(e.target.value)}
              className="w-full px-3 py-2 pr-8 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[rgb(221,221,221)] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#9ca3af] hover:text-[#08060d] dark:hover:text-[#f3f4f6]"
                aria-label="Clear search"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {filteredLessons !== null ? (
            <div className="space-y-2">
              {filteredLessons.length > 0 ? (
                <>
                  <div className="text-xs text-[#9ca3af] dark:text-[#6b6375] mb-2 px-1">
                    {filteredLessons.length} result{filteredLessons.length !== 1 ? 's' : ''} found
                  </div>
                  {filteredWithIndex?.map(item => (
                    <LessonLink
                      key={item.lesson.id}
                      lesson={item.lesson}
                      categorySlug={category.slug}
                      courseSlug={item.courseSlug}
                      isActive={
                        item.lesson.slug === activeLessonSlug &&
                        activeCourseSlug === item.courseSlug
                      }
                      index={item.index}
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </>
              ) : (
                <div className="text-sm text-[#9ca3af] dark:text-[#6b6375] text-center py-4">
                  No lessons found
                </div>
              )}
            </div>
          ) : (
            <>
              {directLessonsWithIndex.length > 0 && (
                <div className="mb-4">
                  {directLessonsWithIndex.map(({ lesson, index }) => (
                    <LessonLink
                      key={lesson.id}
                      lesson={lesson}
                      categorySlug={category.slug}
                      courseSlug={undefined}
                      isActive={lesson.slug === activeLessonSlug && !activeCourseSlug}
                      index={index}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              )}

              {coursesWithLessons.map(({ course, lessonsWithIndex }) => (
                <Accordion
                  key={course.id}
                  title={course.title}
                  defaultOpen={course.lessons.some(
                    l => l.slug === activeLessonSlug && activeCourseSlug === course.slug
                  )}
                >
                  {lessonsWithIndex.map(({ lesson, index }) => (
                    <LessonLink
                      key={lesson.id}
                      lesson={lesson}
                      categorySlug={category.slug}
                      courseSlug={course.slug}
                      isActive={
                        lesson.slug === activeLessonSlug && activeCourseSlug === course.slug
                      }
                      index={index}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </Accordion>
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
