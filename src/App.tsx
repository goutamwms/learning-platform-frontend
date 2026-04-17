import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotFoundPage } from './components/common/NotFoundPage';
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
} from './pages';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/categories/new" element={<CreateCategory />} />
        <Route path="/admin/categories/:id/edit" element={<EditCategory />} />
        <Route path="/admin/subcategories/new" element={<CreateSubcategory />} />
        <Route path="/admin/subcategories" element={<Subcategories />} />
        <Route path="/admin/subcategories/:id/edit" element={<EditSubcategory />} />
        <Route path="/admin/lessons/new" element={<CreateLesson />} />
        <Route path="/admin/lessons/:id/edit" element={<EditLesson />} />

        <Route path="/courses/:categorySlug" element={<CourseViewer />} />
        <Route path="/courses/:categorySlug/:lessonSlug" element={<CourseViewer />} />
        <Route path="/courses/:categorySlug/:courseSlug/:lessonSlug" element={<CourseViewer />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
