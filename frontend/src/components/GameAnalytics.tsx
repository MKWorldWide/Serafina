import { Box, Typography, Card, Grid } from '@mui/material';
import { useState } from 'react';
import { useUser } from '../hooks/useUser';

export const GameAnalytics = () => {
  const { user } = useUser();
  const [selectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  if (!user) {
    return (
      <Box p={4}>
        <Typography>Please sign in to view your gaming analytics</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant='h4' gutterBottom>
        Gaming Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6'>Total Playtime</Typography>
            <Typography variant='h4'>0 hours</Typography>
            <Typography variant='caption' color='textSecondary'>
              Last {selectedPeriod}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6'>Games Played</Typography>
            <Typography variant='h4'>0 games</Typography>
            <Typography variant='caption' color='textSecondary'>
              Last {selectedPeriod}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6'>Achievements Earned</Typography>
            <Typography variant='h4'>0</Typography>
            <Typography variant='caption' color='textSecondary'>
              Last {selectedPeriod}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameAnalytics;
