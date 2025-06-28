import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Import configuration and utilities
import awsconfig from './aws-exports';
import config from './config';

// Import core components
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting and performance optimization
const Home = lazy(() => import('./pages/Home'));
const Games = lazy(() => import('./pages/Games'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Configure Amplify with the appropriate configuration
Amplify.configure(awsconfig || config);

/**
 * Main App component that serves as the root of the application
 * Combines authentication, routing, error handling, and navigation
 * 
 * Features:
 * - AWS Amplify authentication integration
 * - React Router for navigation
 * - Lazy loading for performance optimization
 * - Error boundary for graceful error handling
 * - Loading states for better UX
 * - Responsive navigation structure
 */
const App: React.FC = () => {
  // Memoize the fallback component for Suspense to prevent re-creation
  const fallback = useMemo(() => <LoadingSpinner />, []);

  // Memoize the error boundary fallback for consistent error handling
  const errorFallback = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          aria-label="Refresh the page"
        >
          Refresh Page
        </button>
      </div>
    </div>
  ), []);

  // Memoize the routes to prevent unnecessary re-renders
  const routes = useMemo(() => (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/:id" element={<GameDetails />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  ), []);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Router>
        <Authenticator>
          {({ signOut }) => (
            <div className="min-h-screen bg-gray-100">
              {/* Navigation component with sign out functionality */}
              <Navigation signOut={signOut} />
              
              {/* Main content area with lazy loading */}
              <main className="container mx-auto px-4 py-8">
                <Suspense fallback={fallback}>
                  {routes}
                </Suspense>
              </main>
            </div>
          )}
        </Authenticator>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 