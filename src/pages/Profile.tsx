import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import TimelineIcon from '@mui/icons-material/Timeline';

interface UserProfile {
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  status: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  stats: {
    followers: number;
    following: number;
    totalGames: number;
    achievements: number;
    winRate: number;
    totalMatches: number;
    reputation: number;
  };
  topGames: Array<{
    name: string;
    hoursPlayed: number;
    level: number;
    platform: string;
    rank?: string;
    winRate: number;
    favoriteCharacter?: string;
  }>;
  recentAchievements: Array<{
    id: string;
    name: string;
    game: string;
    icon: string;
    rarity: string;
    unlockedAt: string;
    description: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    game: string;
    role: string;
    members: number;
    rank?: string;
    logo: string;
  }>;
  highlights: Array<{
    id: string;
    title: string;
    game: string;
    type: 'clip' | 'achievement' | 'record';
    thumbnailUrl: string;
    views: number;
    date: string;
  }>;
  schedule: Array<{
    id: string;
    type: 'tournament' | 'practice' | 'streaming';
    game: string;
    title: string;
    date: string;
    participants: number;
  }>;
}

const CoverImage = styled(Box)({
  height: '200px',
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
});

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  border: `4px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: '-30%',
  left: theme.spacing(3),
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
}));

const GameCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
}));

const AchievementCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 215, 0, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const HighlightCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '15px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const HighlightOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  color: 'white',
}));

const TeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockProfile: UserProfile = {
          username: username,
          bio: '🎮 Professional Gamer | 🏆 Tournament Winner | 🎯 FPS Enthusiast',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          coverUrl: 'https://picsum.photos/1920/1080',
          status: 'online',
          currentGame: 'Valorant',
          stats: {
            followers: 1234,
            following: 567,
            totalGames: 89,
            achievements: 342,
            winRate: 68,
            totalMatches: 1500,
            reputation: 4.8,
          },
          topGames: [
            {
              name: 'Valorant',
              hoursPlayed: 432,
              level: 78,
              platform: 'PC',
              rank: 'Immortal',
              winRate: 65,
              favoriteCharacter: 'Jett',
            },
            {
              name: 'Elden Ring',
              hoursPlayed: 156,
              level: 120,
              platform: 'PS5',
              winRate: 70,
            },
            {
              name: 'God of War Ragnarök',
              hoursPlayed: 89,
              level: 50,
              platform: 'PS5',
              winRate: 75,
            },
          ],
          recentAchievements: [
            {
              id: '1',
              name: 'Speed Demon',
              game: 'Elden Ring',
              icon: '🏃‍♂️',
              rarity: 'Ultra Rare',
              unlockedAt: new Date().toISOString(),
              description: 'Complete the game under 2 hours',
            },
            {
              id: '2',
              name: 'Ace Master',
              game: 'Valorant',
              icon: '🎯',
              rarity: 'Rare',
              unlockedAt: new Date().toISOString(),
              description: 'Get 5 kills in a single round',
            },
          ],
          teams: [
            {
              id: '1',
              name: 'Team Phantom',
              game: 'Valorant',
              role: 'Team Captain',
              members: 5,
              rank: 'Diamond',
              logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=phantom',
            },
            {
              id: '2',
              name: 'Elden Lords',
              game: 'Elden Ring',
              role: 'Member',
              members: 8,
              logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=elden',
            },
          ],
          highlights: [
            {
              id: '1',
              title: 'Insane Ace Clutch!',
              game: 'Valorant',
              type: 'clip',
              thumbnailUrl: 'https://picsum.photos/400/200',
              views: 1200,
              date: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'World Record Speedrun',
              game: 'Elden Ring',
              type: 'record',
              thumbnailUrl: 'https://picsum.photos/400/200',
              views: 3400,
              date: new Date().toISOString(),
            },
          ],
          schedule: [
            {
              id: '1',
              type: 'tournament',
              game: 'Valorant',
              title: 'Weekly Community Cup',
              date: new Date(Date.now() + 86400000).toISOString(),
              participants: 16,
            },
            {
              id: '2',
              type: 'streaming',
              game: 'Elden Ring',
              title: 'Speedrun Practice',
              date: new Date(Date.now() + 172800000).toISOString(),
              participants: 0,
            },
          ],
        };
        
        setProfile(mockProfile);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const isOwnProfile = user?.username === profile?.username;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#44b700';
      case 'in-game': return '#ff9800';
      default: return '#bdbdbd';
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ mt: -8 }} // Compensate for navbar
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ mt: -8 }} // Compensate for navbar
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ mt: -8 }} // Compensate for navbar
      >
        <Typography>Profile not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 8 }}> {/* Add padding top to account for navbar */}
      <CoverImage sx={{ backgroundImage: `url(${profile.coverUrl})` }}>
        <StatusBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            position: 'absolute',
            bottom: '-20%',
            left: theme => theme.spacing(3),
            '& .MuiBadge-badge': {
              backgroundColor: getStatusColor(profile.status),
            },
          }}
        >
          <ProfileAvatar src={profile.avatarUrl} alt={profile.username} />
        </StatusBadge>
      </CoverImage>

      <Container maxWidth="lg">
        <Box sx={{ mt: 10, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" gutterBottom>
                  {profile.username}
                </Typography>
                {profile.status === 'in-game' && (
                  <Chip
                    icon={<SportsEsportsIcon />}
                    label={`Playing ${profile.currentGame}`}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {profile.bio}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  icon={<StarIcon />}
                  label={`${profile.stats.reputation} Rating`}
                  color="primary"
                  size="small"
                />
                <Chip
                  icon={<WhatshotIcon />}
                  label={`${profile.stats.winRate}% Win Rate`}
                  color="success"
                  size="small"
                />
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              {!isOwnProfile && (
                <>
                  <Tooltip title="Add Friend">
                    <IconButton color="primary">
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Message">
                    <IconButton color="primary">
                      <MessageIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Invite to Team">
                    <IconButton color="primary">
                      <GroupAddIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {isOwnProfile && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{ mt: 1 }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <GroupIcon />
                  <Typography variant="h6">{profile.stats.followers}</Typography>
                </Box>
                <Typography color="textSecondary">Followers</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <SportsEsportsIcon />
                  <Typography variant="h6">{profile.stats.totalGames}</Typography>
                </Box>
                <Typography color="textSecondary">Games</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmojiEventsIcon />
                  <Typography variant="h6">{profile.stats.achievements}</Typography>
                </Box>
                <Typography color="textSecondary">Achievements</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimelineIcon />
                  <Typography variant="h6">{profile.stats.totalMatches}</Typography>
                </Box>
                <Typography color="textSecondary">Total Matches</Typography>
              </StatsCard>
            </Grid>
          </Grid>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Games" icon={<VideogameAssetIcon />} iconPosition="start" />
            <Tab label="Achievements" icon={<EmojiEventsIcon />} iconPosition="start" />
            <Tab label="Teams" icon={<GroupIcon />} iconPosition="start" />
            <Tab label="Highlights" icon={<WhatshotIcon />} iconPosition="start" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              {profile.topGames.map((game, index) => (
                <GameCard key={index}>
                  <SportsEsportsIcon sx={{ fontSize: 40 }} />
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{game.name}</Typography>
                      <Box display="flex" gap={1}>
                        <Chip label={game.platform} size="small" />
                        {game.rank && (
                          <Chip label={game.rank} color="primary" size="small" />
                        )}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Typography variant="body2" color="textSecondary">
                        Level {game.level}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {game.hoursPlayed} hours played
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {game.winRate}% Win Rate
                      </Typography>
                      {game.favoriteCharacter && (
                        <Typography variant="body2" color="textSecondary">
                          Favorite: {game.favoriteCharacter}
                        </Typography>
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(game.level % 100)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </GameCard>
              ))}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {profile.recentAchievements.map((achievement) => (
                <AchievementCard key={achievement.id}>
                  <Typography variant="h4" component="span">
                    {achievement.icon}
                  </Typography>
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{achievement.name}</Typography>
                      <Chip
                        label={achievement.rarity}
                        size="small"
                        color="warning"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {achievement.game}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {achievement.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </AchievementCard>
              ))}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              {profile.teams.map((team) => (
                <TeamCard key={team.id}>
                  <Avatar src={team.logo} alt={team.name} sx={{ width: 60, height: 60 }} />
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{team.name}</Typography>
                      <Box display="flex" gap={1}>
                        <Chip label={team.game} size="small" />
                        {team.rank && (
                          <Chip label={team.rank} color="primary" size="small" />
                        )}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Typography variant="body2" color="textSecondary">
                        Role: {team.role}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {team.members} Members
                      </Typography>
                    </Box>
                  </Box>
                </TeamCard>
              ))}
            </Box>
          )}

          {activeTab === 3 && (
            <Grid container spacing={2}>
              {profile.highlights.map((highlight) => (
                <Grid item xs={12} sm={6} md={4} key={highlight.id}>
                  <HighlightCard
                    sx={{ backgroundImage: `url(${highlight.thumbnailUrl})` }}
                  >
                    <HighlightOverlay>
                      <Typography variant="h6">{highlight.title}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">
                          {highlight.game}
                        </Typography>
                        <Typography variant="caption">
                          {highlight.views} views
                        </Typography>
                      </Box>
                    </HighlightOverlay>
                  </HighlightCard>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Upcoming Schedule Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Schedule
            </Typography>
            <Grid container spacing={2}>
              {profile.schedule.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(8, 95, 128, 0.1)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">{event.title}</Typography>
                      <Chip
                        label={event.type}
                        size="small"
                        color={event.type === 'tournament' ? 'error' : 'primary'}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {event.game}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    {event.participants > 0 && (
                      <Typography variant="caption" color="textSecondary">
                        {event.participants} participants
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;
