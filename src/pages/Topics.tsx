import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { topicsApi, type Topic, type TopicsResponse } from '../services/api';
import { useAuth } from '../context/AuthContext';

function hasImages(topic: Topic): boolean {
  return topic.sections?.some(s => 
    s.section_type === 'image' && 
    s.section_metadata && 
    Array.isArray(s.section_metadata.images) && 
    s.section_metadata.images.length > 0
  ) ?? false;
}

function hasAttachments(topic: Topic): boolean {
  return topic.sections?.some(s => 
    s.section_type === 'file' && 
    s.section_metadata && 
    Array.isArray(s.section_metadata.files) && 
    s.section_metadata.files.length > 0
  ) ?? false;
}

export function Topics() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentSearchParams = useMemo(() => location.search, [location.search]);

  useEffect(() => {
    if (location.pathname === '/topics') {
      if (location.search) {
        sessionStorage.setItem('topicsParams', location.search.substring(1));
      } else {
        const saved = sessionStorage.getItem('topicsParams');
        if (saved) {
          setSearchParams(saved, { replace: true });
        }
      }
    }
  }, [location]);
  
  const getInitialValue = (key: string, defaultValue: string) => {
    if (searchParams.get(key)) return searchParams.get(key)!;
    const saved = sessionStorage.getItem('topicsParams');
    if (saved) {
      const params = new URLSearchParams(saved);
      if (params.get(key)) return params.get(key)!;
    }
    return defaultValue;
  };
  
  const getInitialTags = () => {
    const tagsParam = searchParams.get('tags') || getInitialValue('tags', '');
    return tagsParam ? tagsParam.split(',') : [];
  };
  
  const [search, setSearch] = useState(() => getInitialValue('q', ''));
  const [selectedTags, setSelectedTags] = useState<string[]>(getInitialTags);
  const [tagInput, setTagInput] = useState('');
  const [sortBy, setSortBy] = useState(() => getInitialValue('sort', 'created_at'));
  const [sortOrder, setSortOrder] = useState(() => getInitialValue('order', 'desc'));
  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(() => {
    return !!(searchParams.get('tags') || searchParams.get('letter') || getInitialValue('letter', '') !== 'ALL');
  });
  const [selectedLetter, setSelectedLetter] = useState(() => getInitialValue('letter', 'ALL'));
  const pageSize = 20;

  const letters = ['ALL', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'created_at') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    if (selectedLetter !== 'ALL') params.set('letter', selectedLetter);
    return params;
  };

  useEffect(() => {
    const params = updateUrlParams();
    sessionStorage.setItem('topicsParams', params.toString());
    setSearchParams(params, { replace: true });
  }, [search, selectedTags, sortBy, sortOrder, selectedLetter]);

  const { data, isLoading } = useQuery({
    queryKey: ['topics', search, selectedTags, sortBy, sortOrder, page, isAuthenticated, selectedLetter],
    queryFn: () => topicsApi.getAll({
      search: search || undefined,
      starts_with: selectedLetter !== 'ALL' ? selectedLetter : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      page_size: pageSize,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setShowAdvanced(true);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTags([]);
    setTagInput('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
    setSelectedLetter('ALL');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Topics</h1>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              to="/topics/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Topic
            </Link>
          )}
          <Link
            to="/"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="title">Title</option>
            <option value="view_count">Views</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:underline"
          >
            {showAdvanced ? 'Hide' : 'Advanced'} Search
          </button>

          {(search || selectedTags.length > 0 || selectedLetter !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="border-t pt-4 mt-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Filter by tags (type and press Enter):</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Filter by first letter:</p>
              <div className="flex flex-wrap gap-1">
                {letters.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`w-8 h-8 text-sm rounded transition-colors ${
                      selectedLetter === letter
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No topics found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {data?.items.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      to={`/topics/${topic.id}${currentSearchParams}`}
                      className="text-lg font-semibold hover:text-blue-600"
                    >
                      {topic.title}
                    </Link>
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {topic.description || 'No description'}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>by {topic.author_username}</span>
                      <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                      <span>{topic.view_count} views</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {topic.tag_names?.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${topic.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {topic.is_public ? 'Public' : 'Private'}
                    </span>
                    <div className="flex gap-2">
                      {hasImages(topic) && (
                        <span title="Has images" className="text-lg">🖼️</span>
                      )}
                      {hasAttachments(topic) && (
                        <span title="Has attachments" className="text-lg">📎</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data && data.total_pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {data.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}