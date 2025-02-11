import { Box, Typography, Avatar, Button, Grid, Paper } from '@mui/material';
import { useUser } from '../hooks/useUser';
import { IUser } from '../types/social';

export const Profile = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <Box p={4}>
        <Typography>Please sign in to view your profile</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4} textAlign="center">
          <Avatar
            src={user.avatar}
            alt={user.username}
            sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
          />
          <Button variant="contained" color="primary">
            Edit Profile
          </Button>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            {user.username}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {user.email}
          </Typography>
          <Typography variant="body1" paragraph>
            Bio coming soon...
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">0</Typography>
                <Typography color="textSecondary">Followers</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">0</Typography>
                <Typography color="textSecondary">Following</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 