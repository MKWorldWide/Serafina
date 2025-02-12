import { Box, Avatar, Typography, Paper } from '@mui/material';
import { AmplifyUser } from '../types/auth';

interface ProfileProps {
  user: AmplifyUser;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const avatarUrl = user.attributes?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  const displayName = user.attributes?.name || user.username;

  return (
    <Box p={4}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            src={avatarUrl}
            alt={displayName}
            sx={{ width: 120, height: 120 }}
          />
          <Typography variant="h4" component="h1">
            {displayName}
          </Typography>
          {user.attributes?.email && (
            <Typography variant="body1" color="text.secondary">
              {user.attributes.email}
            </Typography>
          )}
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
            {user.attributes?.bio || 'No bio available'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 