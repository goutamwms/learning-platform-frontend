import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, type DashboardStats } from '../services/api';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 uppercase">Total Users</h3>
              <p className="text-3xl font-bold">{stats.total_users}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 uppercase">Total Topics</h3>
              <p className="text-3xl font-bold">{stats.total_topics}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 uppercase">Public Topics</h3>
              <p className="text-3xl font-bold">{stats.public_topics}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm text-gray-500 uppercase">Total Views</h3>
              <p className="text-3xl font-bold">{stats.total_views}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
              <div className="space-y-3">
                {stats.recent_users.map((u) => (
                  <div key={u.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{u.username}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </div>
                ))}
                {stats.recent_users.length === 0 && (
                  <p className="text-gray-500">No users yet</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Topics</h2>
              <div className="space-y-3">
                {stats.recent_topics.map((t) => (
                  <div key={t.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-sm text-gray-500">by {t.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{t.view_count} views</p>
                      <span className={`px-2 py-1 text-xs rounded ${t.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {t.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.recent_topics.length === 0 && (
                  <p className="text-gray-500">No topics yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}