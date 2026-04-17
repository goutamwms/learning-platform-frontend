import { Link, useNavigate } from 'react-router-dom';
import type { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    navigate(`/courses/${category.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="block p-6 bg-white dark:bg-[#16171d] border border-[#e5e4e7] dark:border-[#2e303a] rounded-xl hover:border-[#aa3bff] dark:hover:border-[#c084fc] transition-colors group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#08060d] dark:text-[#f3f4f6] group-hover:text-[#aa3bff] dark:group-hover:text-[#c084fc] transition-colors">
            {category.title}
          </h3>
          {category.description && (
            <p className="mt-2 text-sm text-[#6b6375] dark:text-[#9ca3af] line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-[#f4f3ec] dark:bg-[#2e303a] rounded-lg">
          <svg className="w-4 h-4 text-[#6b6375] dark:text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="text-sm font-medium text-[#08060d] dark:text-[#f3f4f6]">
            {category.lesson_count ?? 0}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Link
          to={`/admin/lessons/new?category=${category.id}`}
          className="text-[#aa3bff] hover:underline relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          Add lesson
        </Link>
        <span className="text-[#e5e4e7] dark:text-[#2e303a]">|</span>
        <Link
          to={`/admin/subcategories/new?category=${category.id}`}
          className="text-[#aa3bff] hover:underline relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          Add subcategory
        </Link>
        <span className="text-[#e5e4e7] dark:text-[#2e303a]">|</span>
        <Link
          to={`/admin/categories/${category.id}/edit`}
          className="text-[#aa3bff] hover:underline relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          Edit
        </Link>
        <span className="text-[#e5e4e7] dark:text-[#2e303a]">|</span>
        <Link
          to={`/admin/subcategories?category=${category.id}`}
          className="text-[#aa3bff] hover:underline relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          Subcategories
        </Link>
      </div>
    </div>
  );
}
