import { Box, Typography, Avatar, Button, Grid, Paper } from '@mui/material';
import { useUser } from '../hooks/useUser';

const Profile = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <Box p={4}>
        <Typography>Please sign in to view your profile</Typography>
      </Box>
    );
  }

  const avatarUrl = user.attributes?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  const displayName = user.attributes?.name || user.username;
  const email = user.attributes?.email || user.username;

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={avatarUrl}
              alt={displayName}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {displayName}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {email}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Bio
          </Typography>
          <Typography variant="body1">
            {user.attributes?.bio || 'Bio coming soon...'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 