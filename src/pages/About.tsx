import { Box, Typography, Paper, Grid } from '@mui/material';

export default function About() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        About GameDin
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Our Mission
            </Typography>
            <Typography variant='body1' paragraph>
              GameDin is a social platform designed to connect gamers worldwide. We believe in
              creating meaningful connections through shared gaming experiences.
            </Typography>
            <Typography variant='h6' gutterBottom>
              What We Offer
            </Typography>
            <Typography variant='body1' paragraph>
              • Connect with fellow gamers • Share your gaming achievements • Join tournaments and
              events • Find gaming jobs and opportunities • Participate in community discussions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
