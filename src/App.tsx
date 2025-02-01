import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Token from './pages/Token';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Feed from './components/Feed';
import Messaging from './components/Messaging';
import Forums from './components/Forums';
import Achievements from './components/Achievements';
import Tournaments from './components/Tournaments';
import Jobs from './components/Jobs';
import GameAnalytics from './components/GameAnalytics';
import { AuthProvider, useAuth } from './context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/token" element={<Token />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
                  <Box sx={{ p: 3, mt: 8 }}>
                    <Messaging />
                  </Box>
                </PrivateRoute>
              }
            />
            <Route
              path="/forums/*"
              element={
                <PrivateRoute>
                  <Box sx={{ mt: 8 }}>
                    <Forums />
                  </Box>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <PrivateRoute>
                  <Box sx={{ mt: 8 }}>
                    <Achievements />
                  </Box>
                </PrivateRoute>
              }
            />
            <Route
              path="/tournaments"
              element={
                <PrivateRoute>
                  <Box sx={{ mt: 8 }}>
                    <Tournaments />
                  </Box>
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <Box sx={{ mt: 8 }}>
                    <Jobs />
                  </Box>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Box sx={{ mt: 8 }}>
                    <GameAnalytics />
                  </Box>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  );
};

export default App;
