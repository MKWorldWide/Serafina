import React from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Container,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { IUser } from '../types/user';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Please sign in to view your profile
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Typography variant="h4">{user.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
