import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import FeedPage from './components/Feed/FeedPage';
import ProfilePage from './components/Profile/ProfilePage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import MessagesPage from './components/Messages/MessagesPage';
import FriendsPage from './components/Friends/FriendsPage';
import Settings from './components/Settings/Settings';
import useStore from './store/useStore';

const App: React.FC = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    // Clear any error messages when route changes
    useStore.getState().setError(null);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <FeedPage /> : <Navigate to="/login" replace state={{ from: location }} />} />
        <Route path="/profile/:username" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace state={{ from: location }} />} />
        <Route path="/messages" element={isAuthenticated ? <MessagesPage /> : <Navigate to="/login" replace state={{ from: location }} />} />
        <Route path="/friends" element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace state={{ from: location }} />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace state={{ from: location }} />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App; 