import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { topicsApi, type Topic } from '../services/api';

export function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myTopics, setMyTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyTopics();
  }, []);

  const loadMyTopics = async () => {
    try {
      const topics = await topicsApi.getMyTopics();
      setMyTopics(topics);
    } catch (err) {
      console.error('Failed to load topics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/topics/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Topic
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">{new Date(user?.created_at || '').toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">My Topics</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : myTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any topics yet.</p>
            <Link
              to="/topics/new"
              className="text-blue-600 hover:underline"
            >
              Create your first topic
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myTopics.map((topic) => (
              <div key={topic.id} className="border-b pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/topics/${topic.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {topic.title}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {topic.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${topic.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {topic.is_public ? 'Public' : 'Private'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {topic.view_count} views
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {topic.tag_names?.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}