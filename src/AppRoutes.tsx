import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useUser } from './hooks/useUser';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded page components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Token = lazy(() => import('./pages/Token'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const Games = lazy(() => import('./pages/Games'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const Messaging = lazy(() => import('./pages/Messaging'));

// Lazy-loaded components
const Feed = lazy(() => import('./components/Feed'));
const Forums = lazy(() => import('./components/Forums'));
const Achievements = lazy(() => import('./components/Achievements'));
const Tournaments = lazy(() => import('./components/Tournaments'));
const Jobs = lazy(() => import('./components/Jobs'));
const GameAnalytics = lazy(() => import('./components/GameAnalytics'));

// Enhanced loading fallback component with Framer Motion
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center space-y-4"
    >
      <motion.div 
        className="h-16 w-16 border-4 rounded-full border-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-700 font-medium"
      >
        Loading...
      </motion.p>
    </motion.div>
  </div>
);

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
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
} 