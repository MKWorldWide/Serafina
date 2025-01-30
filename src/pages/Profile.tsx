import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  Tab,
  Tabs,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface UserProfile {
  username: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  avatarUrl?: string;
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Replace with actual API call
        const mockProfile = {
          username: username || 'user',
          bio: 'Gaming enthusiast and content creator',
          followers: 1234,
          following: 567,
          posts: 89,
          avatarUrl: '',
        };
        setProfile(mockProfile);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFollowToggle = async () => {
    try {
      // Replace with actual API call
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (isLoading || !profile) {
    return (
      <Container>
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            backgroundColor: 'rgba(8, 95, 128, 0.1)',
            borderRadius: '20px',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: 150,
                  height: 150,
                  margin: '0 auto',
                  bgcolor: 'primary.main',
                }}
              >
                {profile.username[0].toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ mr: 2 }}>
                  {profile.username}
                </Typography>
                {user?.username !== profile.username && (
                  <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={handleFollowToggle}
                    sx={{ ml: 2 }}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                <Typography>
                  <strong>{profile.posts}</strong> posts
                </Typography>
                <Typography>
                  <strong>{profile.followers}</strong> followers
                </Typography>
                <Typography>
                  <strong>{profile.following}</strong> following
                </Typography>
              </Box>
              <Typography>{profile.bio}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
            }}
          >
            <Tab label="Posts" />
            <Tab label="About" />
            <Tab label="Games" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" color="text.secondary" align="center">
              No posts yet
            </Typography>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1" color="text.secondary" align="center">
              About section coming soon
            </Typography>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1" color="text.secondary" align="center">
              Games section coming soon
            </Typography>
          </TabPanel>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;
