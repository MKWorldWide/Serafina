import { Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <FeedPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/messages" element={isAuthenticated ? <MessagesPage /> : <Navigate to="/login" />} />
        <Route path="/friends" element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App; 