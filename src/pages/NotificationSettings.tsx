import { Box, Typography, Paper, Grid, Switch, FormGroup, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import { useUser } from '../hooks/useUser';

export default function NotificationSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    achievementNotifications: true,
    friendRequestNotifications: true,
    tournamentNotifications: true,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.checked,
    });
  };

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='h6'>Please sign in to view notification settings</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        Notification Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    name='emailNotifications'
                  />
                }
                label='Email Notifications'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={handleChange}
                    name='pushNotifications'
                  />
                }
                label='Push Notifications'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.messageNotifications}
                    onChange={handleChange}
                    name='messageNotifications'
                  />
                }
                label='Message Notifications'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.achievementNotifications}
                    onChange={handleChange}
                    name='achievementNotifications'
                  />
                }
                label='Achievement Notifications'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.friendRequestNotifications}
                    onChange={handleChange}
                    name='friendRequestNotifications'
                  />
                }
                label='Friend Request Notifications'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.tournamentNotifications}
                    onChange={handleChange}
                    name='tournamentNotifications'
                  />
                }
                label='Tournament Notifications'
              />
            </FormGroup>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
