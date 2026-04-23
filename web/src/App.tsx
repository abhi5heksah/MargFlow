import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GuidesListPage from './pages/GuidesListPage';
import GuideEditorPage from './pages/GuideEditorPage';
import PublicGuidePage from './pages/PublicGuidePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/guides/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="" element={<GuidesListPage />} />
                <Route path=":id" element={<GuideEditorPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/public/:slug" element={<PublicGuidePage />} />
      <Route path="/" element={<Navigate to="/guides" replace />} />
    </Routes>
  );
}