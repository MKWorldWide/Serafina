import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  totalThreads: number;
  totalPosts: number;
  games: string[];
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatarUrl: string;
    verified: boolean;
    reputation: number;
  };
  category: string;
  game?: string;
  createdAt: string;
  lastReply?: {
    author: string;
    timestamp: string;
  };
  views: number;
  replies: number;
  likes: number;
  pinned: boolean;
  tags: string[];
}

const CategoryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ThreadCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
}));

const GameChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  margin: theme.spacing(0.5),
}));

const Forums: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [createThreadOpen, setCreateThreadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGame, setSelectedGame] = useState<string>('all');

  useEffect(() => {
    // Mock categories data
    const mockCategories: ForumCategory[] = [
      {
        id: '1',
        name: 'FPS Games',
        icon: '🎯',
        description: 'Discuss FPS games, strategies, and tournaments',
        totalThreads: 150,
        totalPosts: 1200,
        games: ['Valorant', 'CS:GO', 'Apex Legends'],
      },
      {
        id: '2',
        name: 'RPG & MMO',
        icon: '⚔️',
        description: 'Everything about RPGs and MMORPGs',
        totalThreads: 200,
        totalPosts: 1800,
        games: ['Elden Ring', 'World of Warcraft', 'Final Fantasy XIV'],
      },
      {
        id: '3',
        name: 'Esports',
        icon: '🏆',
        description: 'Professional gaming, tournaments, and teams',
        totalThreads: 120,
        totalPosts: 980,
        games: ['League of Legends', 'Dota 2', 'Overwatch'],
      },
      {
        id: '4',
        name: 'Game Development',
        icon: '🔧',
        description: 'Game development discussions and resources',
        totalThreads: 80,
        totalPosts: 450,
        games: ['Unity', 'Unreal Engine', 'Godot'],
      },
    ];
    setCategories(mockCategories);

    // Mock threads data
    const mockThreads: ForumThread[] = [
      {
        id: '1',
        title: 'Tips for improving aim in Valorant',
        content: 'Share your best tips for improving aim...',
        author: {
          username: 'AimMaster',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AimMaster',
          verified: true,
          reputation: 4.8,
        },
        category: 'FPS Games',
        game: 'Valorant',
        createdAt: new Date().toISOString(),
        lastReply: {
          author: 'ProPlayer',
          timestamp: new Date().toISOString(),
        },
        views: 1200,
        replies: 45,
        likes: 89,
        pinned: true,
        tags: ['guide', 'tips', 'aim'],
      },
      {
        id: '2',
        title: 'Upcoming Valorant Tournament - $5000 Prize Pool',
        content: 'Join our upcoming tournament...',
        author: {
          username: 'TournamentOrg',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TournamentOrg',
          verified: true,
          reputation: 4.9,
        },
        category: 'Esports',
        game: 'Valorant',
        createdAt: new Date().toISOString(),
        views: 2500,
        replies: 120,
        likes: 234,
        pinned: true,
        tags: ['tournament', 'esports', 'competitive'],
      },
    ];
    setThreads(mockThreads);
  }, []);

  const handleCreateThread = () => {
    setCreateThreadOpen(true);
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === 'all' || thread.game === selectedGame;
    const matchesCategory = !selectedCategory || thread.category === selectedCategory;
    return matchesSearch && matchesGame && matchesCategory;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gaming Forums
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              size="small"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Game</InputLabel>
              <Select
                value={selectedGame}
                label="Game"
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <MenuItem value="all">All Games</MenuItem>
                <MenuItem value="Valorant">Valorant</MenuItem>
                <MenuItem value="CS:GO">CS:GO</MenuItem>
                <MenuItem value="League of Legends">League of Legends</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateThread}
            >
              New Discussion
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Categories Grid */}
      {!selectedCategory && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <CategoryCard onClick={() => setSelectedCategory(category.id)}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h5" component="span">
                    {category.icon}
                  </Typography>
                  <Typography variant="h6">
                    {category.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    {category.totalThreads} threads
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {category.totalPosts} posts
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  {category.games.map((game) => (
                    <GameChip
                      key={game}
                      label={game}
                      size="small"
                      icon={<SportsEsportsIcon sx={{ fontSize: 16 }} />}
                    />
                  ))}
                </Box>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Threads List */}
      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab icon={<WhatshotIcon />} label="Hot" />
          <Tab icon={<TrendingUpIcon />} label="Trending" />
          <Tab icon={<NewReleasesIcon />} label="New" />
        </Tabs>

        {filteredThreads.map((thread) => (
          <ThreadCard key={thread.id}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={thread.author.avatarUrl}
                    component={Link}
                    to={`/profile/${thread.author.username}`}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography
                        variant="subtitle2"
                        component={Link}
                        to={`/profile/${thread.author.username}`}
                        sx={{
                          color: 'text.primary',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {thread.author.username}
                      </Typography>
                      {thread.author.verified && (
                        <Tooltip title="Verified User">
                          <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {thread.pinned && (
                    <Chip
                      label="Pinned"
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {thread.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {thread.content}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {thread.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={2}>
                    <Typography variant="caption" color="textSecondary">
                      <ForumIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {thread.replies} replies
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {thread.views} views
                    </Typography>
                  </Box>
                  {thread.lastReply && (
                    <Typography variant="caption" color="textSecondary">
                      Last reply by {thread.lastReply.author} •{' '}
                      {new Date(thread.lastReply.timestamp).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </ThreadCard>
        ))}
      </Box>

      {/* Create Thread Dialog */}
      <Dialog
        open={createThreadOpen}
        onClose={() => setCreateThreadOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Discussion</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Game</InputLabel>
              <Select label="Game">
                <MenuItem value="Valorant">Valorant</MenuItem>
                <MenuItem value="CS:GO">CS:GO</MenuItem>
                <MenuItem value="League of Legends">League of Legends</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={6}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              margin="normal"
              placeholder="e.g., guide, tips, competitive"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateThreadOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateThreadOpen(false)}>
            Create Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Forums; 