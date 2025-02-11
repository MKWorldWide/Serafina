import { Box, Typography, Paper, Grid } from '@mui/material';
import PostEditor from './post/PostEditor';
import { useUser } from '../hooks/useUser';

export default function Feed() {
  const { user } = useUser();

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Please sign in to view your feed
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PostEditor onSubmit={async (content) => {
            // TODO: Implement post submission
            console.log('New post:', content);
          }} />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start following other gamers or create your first post!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 