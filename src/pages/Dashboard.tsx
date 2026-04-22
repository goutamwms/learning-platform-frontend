import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { CategoryGrid } from '../components/dashboard';
import { Button } from '../components/common';

export function Dashboard() {
  const { data: categories, isLoading, error } = useCategories();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories?.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#08060d] dark:text-[#f3f4f6]">Dashboard</h1>
          <p className="text-sm text-[#6b6375] dark:text-[#9ca3af] mt-1">
            Manage your learning content
          </p>
        </div>
        <div className={`flex gap-3 ${isLoading ? 'opacity-50 hidden' : ''}`} >
          {!isAuthenticated && (
            <>
              <Link to="/login" className="flex items-center gap-1 text-blue-600 hover:underline px-3 py-2">
                Login
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/admin/categories/new">
              <Button>New Category</Button>
            </Link>
          )}
          <Link to="/topics">
            <Button variant="secondary">Topics</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-sm rounded-lg border border-[#e5e4e7] dark:border-[#2e303a] bg-white dark:bg-[#16171d] text-[#08060d] dark:text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#aa3bff]"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[#f4f3ec] dark:bg-[#2e303a] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          Failed to load categories. Please try again.
        </div>
      )}

      {filteredCategories && <CategoryGrid categories={filteredCategories} />}
    </div>
  );
}
