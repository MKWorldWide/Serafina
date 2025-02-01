import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Badge,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useAuth } from '../context/AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: {
    type: 'xp' | 'badge' | 'title';
    value: number | string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'gaming' | 'social' | 'community' | 'special';
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const RarityBadge = styled(Badge)<{ rarity: string }>(({ theme, rarity }) => {
  const rarityColors = {
    common: '#7E7E7E',
    rare: '#0088FE',
    epic: '#AA00FF',
    legendary: '#FFD700',
  };
  return {
    '& .MuiBadge-badge': {
      backgroundColor: rarityColors[rarity as keyof typeof rarityColors],
      color: '#fff',
    },
  };
});

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(1000);

  useEffect(() => {
    // Mock achievements data
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Blood',
        description: 'Win your first competitive match',
        icon: '🎮',
        progress: 1,
        maxProgress: 1,
        completed: true,
        reward: { type: 'xp', value: 100 },
        rarity: 'common',
        category: 'gaming',
      },
      {
        id: '2',
        title: 'Community Leader',
        description: 'Create a popular forum thread with 100+ replies',
        icon: '👑',
        progress: 75,
        maxProgress: 100,
        completed: false,
        reward: { type: 'badge', value: 'Community Expert' },
        rarity: 'rare',
        category: 'community',
      },
      {
        id: '3',
        title: 'Tournament Champion',
        description: 'Win a tournament with a prize pool',
        icon: '🏆',
        progress: 0,
        maxProgress: 1,
        completed: false,
        reward: { type: 'title', value: 'Champion' },
        rarity: 'legendary',
        category: 'gaming',
      },
    ];
    setAchievements(mockAchievements);

    // Mock badges data
    const mockBadges: Badge[] = [
      {
        id: '1',
        name: 'Early Adopter',
        icon: '🌟',
        description: 'Joined during the platform\'s beta phase',
        rarity: 'rare',
        earnedDate: '2024-01-15',
      },
      {
        id: '2',
        name: 'Team Player',
        icon: '🤝',
        description: 'Successfully participated in 10 team formations',
        rarity: 'common',
        earnedDate: '2024-02-20',
      },
    ];
    setBadges(mockBadges);
  }, []);

  const calculateLevelProgress = (currentXp: number, nextLevel: number) => {
    return (currentXp / nextLevel) * 100;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      {/* User Level Progress */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'rgba(8, 95, 128, 0.1)', borderRadius: '15px' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" gutterBottom>
              Level {level}
            </Typography>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={calculateLevelProgress(xp, nextLevelXp)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'primary.main',
                  },
                }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {xp} / {nextLevelXp} XP to next level
            </Typography>
          </Grid>
          <Grid item>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                Reputation
              </Typography>
              <Typography variant="h4" color="primary">
                {user?.reputation || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Badges Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <WorkspacePremiumIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
        Earned Badges
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {badges.map((badge) => (
          <Grid item xs={12} sm={6} md={3} key={badge.id}>
            <RarityBadge
              rarity={badge.rarity}
              badgeContent={badge.rarity.charAt(0).toUpperCase()}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <StyledCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" component="span">
                      {badge.icon}
                    </Typography>
                    <Typography variant="h6">
                      {badge.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {badge.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </StyledCard>
            </RarityBadge>
          </Grid>
        ))}
      </Grid>

      {/* Achievements Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
        Achievements
      </Typography>
      <Grid container spacing={2}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <RarityBadge
              rarity={achievement.rarity}
              badgeContent={achievement.rarity.charAt(0).toUpperCase()}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <StyledCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" component="span">
                      {achievement.icon}
                    </Typography>
                    <Typography variant="h6">
                      {achievement.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {achievement.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        Progress: {achievement.progress}/{achievement.maxProgress}
                      </Typography>
                      <Chip
                        size="small"
                        icon={achievement.reward.type === 'xp' ? <StarIcon /> : <MilitaryTechIcon />}
                        label={`${achievement.reward.type.toUpperCase()}: ${achievement.reward.value}`}
                        color="primary"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: achievement.completed ? 'success.main' : 'primary.main',
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </StyledCard>
            </RarityBadge>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Achievements; 