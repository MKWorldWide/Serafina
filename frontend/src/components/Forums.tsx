import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export const Forums = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <Box p={4}>
      <Grid container spacing={3} alignItems='center' justifyContent='space-between' mb={4}>
        <Grid item>
          <Typography variant='h4'>Gaming Forums</Typography>
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' onClick={() => navigate('/forums/new')}>
            Create Thread
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color='textSecondary'>
          No forum threads yet. Be the first to start a discussion!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Forums;
