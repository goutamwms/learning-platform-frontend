import { Link } from 'react-router-dom';
import { Button } from './Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0f1014] p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-[#e5e4e7] dark:text-[#2e303a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-[#08060d] dark:text-[#f3f4f6] mb-4">404</h1>
        <h2 className="text-xl font-semibold text-[#08060d] dark:text-[#f3f4f6] mb-2">
          Page Not Found
        </h2>
        <p className="text-[#6b6375] dark:text-[#9ca3af] mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-[#6b6375] dark:text-[#9ca3af] hover:text-[#08060d] dark:hover:text-[#f3f4f6] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
