import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import FeedPage from './components/Feed/FeedPage';
import ProfilePage from './components/Profile/ProfilePage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import MessagesPage from './components/Messages/MessagesPage';
import FriendsPage from './components/Friends/FriendsPage';
import Settings from './components/Settings/Settings';
import useStore from './store/useStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Clear any error messages when route changes
    useStore.getState().setError(null);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App; 