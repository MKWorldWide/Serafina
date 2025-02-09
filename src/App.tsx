import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import FeedPage from './components/Feed/FeedPage';
import ProfilePage from './components/Profile/ProfilePage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import MessagesPage from './components/Messages/MessagesPage';
import FriendsPage from './components/Friends/FriendsPage';
import Settings from './components/Settings/Settings';
import store from './store/useStore';
import { Store } from './types/store';

const App: React.FC = () => {
  const { isAuthenticated } = store<Pick<Store, 'isAuthenticated'>>(state => ({
    isAuthenticated: state.isAuthenticated
  }));

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
};

export default App; 