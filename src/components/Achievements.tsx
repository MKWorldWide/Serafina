import { Box, Typography, Paper, Grid } from '@mui/material';
import { useUser } from '../hooks/useUser';
import { useState, useEffect } from 'react';

interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export const Achievements = () => {
  const { user } = useUser();
  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch achievements logic here
    setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <Box p={4}>
        <Typography>Please sign in to view your achievements</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={4}>
        <Typography>Loading achievements...</Typography>
      </Box>
    );
  }

  if (achievements.length === 0) {
    return (
      <Box p={4}>
        <Typography>No achievements yet. Start playing to earn some!</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Your Achievements
      </Typography>
      <Grid container spacing={3}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{achievement.name}</Typography>
              <Typography color="textSecondary">{achievement.description}</Typography>
              {achievement.unlocked && (
                <Typography variant="caption" color="success.main">
                  Unlocked on {new Date(achievement.unlockedAt!).toLocaleDateString()}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Achievements; 