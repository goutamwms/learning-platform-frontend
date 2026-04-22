import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotFoundPage } from './components/common/NotFoundPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Dashboard,
  CreateCategory,
  CreateSubcategory,
  CreateLesson,
  EditCategory,
  EditSubcategory,
  EditLesson,
  Subcategories,
  CourseViewer,
  Login,
  Signup,
  AdminDashboard,
  UserDashboard,
  Topics,
  TopicEditor,
  TopicViewer,
} from './pages';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      {children}
    </ProtectedRoute>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function TopicsRoute() {
  return <Topics />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/topics" element={<TopicsRoute />} />
          <Route path="/topics/new" element={
            <ProtectedRoute>
              <TopicEditor />
            </ProtectedRoute>
          } />
          <Route path="/topics/:id" element={<TopicViewer />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/admin/categories/new" element={<AdminRoute><CreateCategory /></AdminRoute>} />
          <Route path="/admin/categories/:id/edit" element={<AdminRoute><EditCategory /></AdminRoute>} />
          <Route path="/admin/subcategories/new" element={<AdminRoute><CreateSubcategory /></AdminRoute>} />
          <Route path="/admin/subcategories" element={<AdminRoute><Subcategories /></AdminRoute>} />
          <Route path="/admin/subcategories/:id/edit" element={<AdminRoute><EditSubcategory /></AdminRoute>} />
          <Route path="/admin/lessons/new" element={<AdminRoute><CreateLesson /></AdminRoute>} />
          <Route path="/admin/lessons/:id/edit" element={<AdminRoute><EditLesson /></AdminRoute>} />

          <Route path="/courses/:categorySlug" element={<CourseViewer />} />
          <Route path="/courses/:categorySlug/:lessonSlug" element={<CourseViewer />} />
          <Route path="/courses/:categorySlug/:courseSlug/:lessonSlug" element={<CourseViewer />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;