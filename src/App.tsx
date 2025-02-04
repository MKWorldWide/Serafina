import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/Profile/ProfilePage';
import MatchFinder from './components/MatchFinder';
import Messages from './components/Messages';
import NotificationSettings from './pages/NotificationSettings';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ pt: 8 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/match-finder" element={<MatchFinder />} />
          <Route path="/messages/*" element={<Messages />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
