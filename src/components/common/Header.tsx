import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#16171d] border-b border-[#e5e4e7] dark:border-[#2e303a]">
      <div className="flex items-center justify-between h-14 px-4 max-w-[1400px] mx-auto">
        <Link to="/" className="flex items-center gap-2 font-medium text-[#08060d] dark:text-[#f3f4f6]">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Learning Platform
        </Link>
        <nav className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="text-sm font-medium text-[#6b6375] dark:text-[#9ca3af] hover:text-[#08060d] dark:hover:text-[#f3f4f6] transition-colors"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
