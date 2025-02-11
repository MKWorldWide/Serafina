import { Box, Avatar, Typography, Container } from '@mui/material';
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
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          sx={{ width: 120, height: 120 }}
        />
        <Typography variant="h4" component="h1">
          {displayName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {email}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth="sm">
          {user.attributes?.bio || "No bio available"}
        </Typography>
      </Box>
    </Container>
  );
};

export default Profile; 