import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import useStore from './store/useStore';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProfileCard from './components/ProfileCard';
import MatchFinder from './components/MatchFinder';
import Messages from './components/Messages';
import ActivityFeed from './components/ActivityFeed/ActivityFeed';
import FriendsList from './components/Friends/FriendsList';
import NotificationCenter from './components/Notifications/NotificationCenter';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = useStore((state) => state.user);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { checkAuth } = useAuth();
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    checkAuth().catch(console.error);
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-3">
                    <ProfileCard />
                  </div>
                  <div className="lg:col-span-6">
                    <ActivityFeed />
                  </div>
                  <div className="lg:col-span-3">
                    <FriendsList />
                    <NotificationCenter />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <ProfileCard />
              </ProtectedRoute>
            } />
            
            <Route path="/matches" element={
              <ProtectedRoute>
                <MatchFinder />
              </ProtectedRoute>
            } />
            
            <Route path="/messages/:chatId?" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            
            <Route path="/friends" element={
              <ProtectedRoute>
                <FriendsList />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 