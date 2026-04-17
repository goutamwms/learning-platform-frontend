export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  lesson_count?: number;
}

export interface Course {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  category_id: number;
  course_id: number | null;
  title: string;
  slug: string;
  content: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithContent extends Category {
  courses: CourseWithLessons[];
  direct_lessons: Lesson[];
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export type SaveStatus = 'idle' | 'saving...' | 'saved' | 'error';
