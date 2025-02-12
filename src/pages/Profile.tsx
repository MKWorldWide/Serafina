import { Container, Box, Avatar, Typography } from '@mui/material';
import { AmplifyUser } from '../types/auth';

interface ProfileProps {
  user: AmplifyUser;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const avatarUrl = user.attributes.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  const displayName = user.attributes.name || user.username;
  const bio = user.attributes.bio;

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          py: 6,
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
        {user.attributes.email && (
          <Typography variant="body2" color="text.secondary">
            {user.attributes.email}
          </Typography>
        )}
        {bio ? (
          <Typography variant="body1" textAlign="center" maxWidth="sm">
            {bio}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No bio available
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Profile; 