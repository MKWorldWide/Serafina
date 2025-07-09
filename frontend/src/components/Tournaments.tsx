import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export const Tournaments = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Grid container spacing={3} alignItems='center' justifyContent='space-between' mb={4}>
        <Grid item>
          <Typography variant='h4'>Gaming Tournaments</Typography>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            color='primary'
            onClick={() => navigate('/tournaments/create')}
          >
            Create Tournament
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color='textSecondary'>
          No tournaments available at the moment. Create one to get started!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Tournaments;
