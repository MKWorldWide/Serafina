import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Token from './pages/Token';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotificationSettings from './pages/NotificationSettings';
import Games from './pages/Games';
import GameDetails from './pages/GameDetails';
import Messaging from './pages/Messaging';
import Feed from './components/Feed';
import Forums from './components/Forums';
import Achievements from './components/Achievements';
import Tournaments from './components/Tournaments';
import Jobs from './components/Jobs';
import GameAnalytics from './components/GameAnalytics';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/token" element={<Token />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetails />} />

        {/* Protected Routes */}
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <Messaging />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/forums"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <Forums />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <Achievements />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/tournaments"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <Tournaments />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <Jobs />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <GameAnalytics />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <PrivateRoute>
              <div className="pt-16">
                <NotificationSettings />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
} 