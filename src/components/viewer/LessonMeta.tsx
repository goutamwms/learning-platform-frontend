import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../common';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface LessonMetaProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  lastUpdated?: string;
  lessonId?: number;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function LessonMeta({
  title,
  breadcrumbs,
  lastUpdated,
  lessonId,
  onDelete,
  showDelete,
}: LessonMetaProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mb-6">
      <nav className="flex items-center gap-2 text-sm text-[#6b6375] dark:text-[#9ca3af] mb-2">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-[#e5e4e7] dark:text-[#2e303a]">/</span>}
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-[#aa3bff] dark:hover:text-[#c084fc]">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#08060d] dark:text-[#f3f4f6]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">{title}</h1>
        <div className="flex items-center gap-2">
          {lessonId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/admin/lessons/${lessonId}/edit`)}
            >
              Edit
            </Button>
          )}
          {showDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      {lastUpdated && (
        <p className="mt-2 text-sm text-[#6b6375] dark:text-[#9ca3af]">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
    </div>
  );
}
