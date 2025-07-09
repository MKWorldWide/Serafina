import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useUser } from '../hooks/useUser';

export default function Token() {
  const { user } = useUser();

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='h6'>Please sign in to view your tokens</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        GameDin Tokens
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h6' gutterBottom>
                Your Token Balance
              </Typography>
              <Typography variant='h3' gutterBottom>
                0 GDT
              </Typography>
              <Button variant='contained' color='primary'>
                Get Tokens
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
