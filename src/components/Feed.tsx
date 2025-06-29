import { Box, Typography, Paper, Grid } from '@mui/material';
import PostEditor from './post/PostEditor';
import { useUser } from '../hooks/useUser';
import { IUser } from '../types/social';

interface Activity {
  id: string;
  user: IUser;
  type: 'game_won' | 'achievement' | 'friend_added' | 'level_up';
  content: string;
  timestamp: string;
}

interface FeedProps {
  activities: Activity[];
}

export const Feed = ({ activities }: FeedProps) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'game_won':
        return '🏆';
      case 'achievement':
        return '🌟';
      case 'friend_added':
        return '👥';
      case 'level_up':
        return '⬆️';
      default:
        return '📢';
    }
  };

  return (
    <div className="feed">
      <h2>Activity Feed</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <div className="user-info">
                  <img
                    src={activity.user.picture || activity.user.avatar}
                    alt={activity.user.username}
                    className="user-avatar"
                  />
                  <span className="username">{activity.user.name || activity.user.username}</span>
                </div>
                <span className="timestamp">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="activity-text">{activity.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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