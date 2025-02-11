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
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, messagesApi } from '../services/api';
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
import { AmplifyUser } from '@aws-amplify/ui';
import { IUser } from '../types/social';
import { useUser } from '../hooks/useUser';

interface IUserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  status: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  reputation: number;
  rank?: string;
  level?: number;
  achievements: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      game: string;
      earnedAt: string;
    }>;
  };
  stats: {
    gamesPlayed: number;
    winRate: number;
    totalMatches: number;
    favoriteGame: string;
    playtime: number;
    rank: string;
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
  activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
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

const HighlightCard = styled(Paper)(() => ({
  padding: '1rem',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--highlight-bg)',
  color: 'var(--highlight-text)',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out',
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

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<ITabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-lg text-gray-700">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user.username}</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Rank:</span> {user.rank}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Level:</span> {user.level}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Status:</span>{' '}
            <span className="inline-flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  user.presence === 'online' ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              {user.presence}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
