import {
  Box,
  Typography,
  Button,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export const Jobs = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={4}>
        <Grid item>
          <Typography variant="h4">Gaming Jobs</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/jobs/post')}
          >
            Post a Job
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">
          No job listings available at the moment. Check back later or post a job!
        </Typography>
      </Box>
    </Box>
  );
};

export default Jobs; 