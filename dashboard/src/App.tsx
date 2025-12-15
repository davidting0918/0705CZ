import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Settings from './components/Settings';
import Products from './components/Products';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, user, fetchAdminProfile } = useAuth();

  // Fetch admin profile on mount if authenticated but user data is incomplete
  useEffect(() => {
    if (isAuthenticated && (!user || !user.admin_id)) {
      fetchAdminProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only run when authentication state changes

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-900">
              <Sidebar />
              <main className="flex-1 ml-64 p-6 bg-gray-900 min-h-screen">
                <Routes>
                  <Route path="/" element={<Navigate to="/products" replace />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/products" replace />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
