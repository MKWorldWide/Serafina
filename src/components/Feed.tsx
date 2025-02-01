import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  CircularProgress, 
  Typography,
  IconButton,
  Chip,
  Avatar,
  Button,
  Tooltip,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CreatePost from './CreatePost';
import { useAuth } from '../context/AuthContext';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  author: {
    username: string;
    email: string;
    avatarUrl?: string;
    rank?: string;
    level?: number;
  };
  createdAt: string;
  likes: number;
  liked: boolean;
  comments: number;
  gameTag?: string;
  gamePlatform?: string;
  achievement?: {
    name: string;
    rarity: string;
    icon: string;
  };
  type?: 'regular' | 'team-search' | 'tournament' | 'achievement' | 'clip';
  teamSearch?: {
    game: string;
    platform: string;
    requiredRank?: string;
    playersNeeded: number;
    currentPlayers: number;
    schedule: string;
  };
  tournament?: {
    name: string;
    date: string;
    prizePool: string;
    maxTeams: number;
    currentTeams: number;
    format: string;
  };
  clip?: {
    views: number;
    duration: string;
  };
}

const StyledPostContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const PostImage = styled('img')({
  width: '100%',
  maxHeight: '400px',
  objectFit: 'cover',
  borderRadius: '10px',
  marginTop: '10px',
});

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const GameTag = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  margin: theme.spacing(1, 1, 1, 0),
  '& .MuiChip-icon': {
    color: '#fff',
  },
}));

const AchievementCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 215, 0, 0.1)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const TeamSearchCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  border: '1px solid rgba(76, 175, 80, 0.3)',
}));

const TournamentCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(233, 30, 99, 0.1)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  border: '1px solid rgba(233, 30, 99, 0.3)',
}));

const ClipCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(33, 150, 243, 0.1)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  border: '1px solid rgba(33, 150, 243, 0.3)',
}));

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [createTournamentDialogOpen, setCreateTournamentDialogOpen] = useState(false);
  const [postTypeFilter, setPostTypeFilter] = useState<string>('all');

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const fetchPosts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockPosts: Post[] = [
        {
          id: '1',
          type: 'achievement',
          content: 'Just achieved a new speedrun record in Elden Ring! 🎮 Check out this epic boss fight!',
          imageUrl: 'https://picsum.photos/800/400',
          author: {
            username: 'EldenLord',
            email: 'user1@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EldenLord',
            rank: 'Elite',
            level: 85,
          },
          createdAt: new Date().toISOString(),
          likes: 42,
          liked: false,
          comments: 15,
          gameTag: 'Elden Ring',
          gamePlatform: 'PS5',
          achievement: {
            name: 'Speed Demon',
            rarity: 'Ultra Rare',
            icon: '🏃‍♂️',
          },
        },
        {
          id: '2',
          type: 'team-search',
          content: 'Looking for skilled players to join our competitive Valorant team!',
          author: {
            username: 'ValorantPro',
            email: 'user2@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ValorantPro',
            rank: 'Immortal',
            level: 145,
          },
          createdAt: new Date().toISOString(),
          likes: 28,
          liked: true,
          comments: 23,
          gameTag: 'Valorant',
          gamePlatform: 'PC',
          teamSearch: {
            game: 'Valorant',
            platform: 'PC',
            requiredRank: 'Diamond+',
            playersNeeded: 2,
            currentPlayers: 3,
            schedule: 'Weekends, 6-10 PM EST',
          },
        },
        {
          id: '3',
          type: 'tournament',
          content: 'Announcing our monthly Valorant tournament! Great prizes and competitive matches await.',
          author: {
            username: 'TournamentOrg',
            email: 'org@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TournamentOrg',
          },
          createdAt: new Date().toISOString(),
          likes: 156,
          liked: false,
          comments: 45,
          gameTag: 'Valorant',
          gamePlatform: 'PC',
          tournament: {
            name: 'Monthly Mayhem',
            date: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
            prizePool: '$1,000',
            maxTeams: 16,
            currentTeams: 12,
            format: 'Single Elimination',
          },
        },
        {
          id: '4',
          type: 'clip',
          content: 'Insane 1v5 clutch in Valorant! 🎯',
          imageUrl: 'https://picsum.photos/800/400',
          author: {
            username: 'ClutchMaster',
            email: 'clutch@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ClutchMaster',
            rank: 'Radiant',
            level: 178,
          },
          createdAt: new Date().toISOString(),
          likes: 89,
          liked: false,
          comments: 34,
          gameTag: 'Valorant',
          gamePlatform: 'PC',
          clip: {
            views: 1200,
            duration: '0:45',
          },
        },
      ];

      setPosts(mockPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const filteredPosts = postTypeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.type === postTypeFilter);

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Please log in to view the feed
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              variant="contained"
              startIcon={<VideogameAssetIcon />}
              onClick={() => setCreateTeamDialogOpen(true)}
            >
              Create Team
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<EmojiEventsIcon />}
              onClick={() => setCreateTournamentDialogOpen(true)}
            >
              Create Tournament
            </Button>
          </Grid>
          <Grid item xs>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Posts</InputLabel>
              <Select
                value={postTypeFilter}
                label="Filter Posts"
                onChange={(e) => setPostTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Posts</MenuItem>
                <MenuItem value="team-search">Team Search</MenuItem>
                <MenuItem value="tournament">Tournaments</MenuItem>
                <MenuItem value="achievement">Achievements</MenuItem>
                <MenuItem value="clip">Clips</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <CreatePost onPostCreated={handlePostCreated} />
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredPosts.map((post) => (
            <StyledPostContainer key={post.id}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  component={Link}
                  to={`/profile/${post.author.username}`}
                  sx={{ cursor: 'pointer' }}
                />
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="subtitle2"
                      component={Link}
                      to={`/profile/${post.author.username}`}
                      sx={{ 
                        color: 'text.primary',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {post.author.username}
                    </Typography>
                    {post.author.rank && (
                      <Chip
                        label={post.author.rank}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {post.type === 'team-search' && (
                  <Button
                    variant="outlined"
                    startIcon={<GroupAddIcon />}
                    size="small"
                  >
                    Join Team
                  </Button>
                )}
                {post.type === 'tournament' && (
                  <Button
                    variant="outlined"
                    startIcon={<EmojiEventsIcon />}
                    size="small"
                    color="secondary"
                  >
                    Register
                  </Button>
                )}
              </Box>

              {post.gameTag && (
                <GameTag
                  icon={<SportsEsportsIcon />}
                  label={`${post.gameTag} ${post.gamePlatform ? `• ${post.gamePlatform}` : ''}`}
                />
              )}

              <Typography variant="body1" sx={{ mt: 2 }}>
                {post.content}
              </Typography>

              {post.type === 'team-search' && post.teamSearch && (
                <TeamSearchCard>
                  <Typography variant="subtitle2" gutterBottom>
                    Team Requirements:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        🎮 Game: {post.teamSearch.game}
                      </Typography>
                      <Typography variant="body2">
                        💻 Platform: {post.teamSearch.platform}
                      </Typography>
                      <Typography variant="body2">
                        🏆 Required Rank: {post.teamSearch.requiredRank}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        👥 Players: {post.teamSearch.currentPlayers}/{post.teamSearch.currentPlayers + post.teamSearch.playersNeeded}
                      </Typography>
                      <Typography variant="body2">
                        📅 Schedule: {post.teamSearch.schedule}
                      </Typography>
                    </Grid>
                  </Grid>
                </TeamSearchCard>
              )}

              {post.type === 'tournament' && post.tournament && (
                <TournamentCard>
                  <Typography variant="subtitle2" gutterBottom>
                    Tournament Details:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        🏆 Prize Pool: {post.tournament.prizePool}
                      </Typography>
                      <Typography variant="body2">
                        📅 Date: {new Date(post.tournament.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        🎮 Format: {post.tournament.format}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        👥 Teams: {post.tournament.currentTeams}/{post.tournament.maxTeams}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(post.tournament.currentTeams / post.tournament.maxTeams) * 100}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  </Grid>
                </TournamentCard>
              )}

              {post.achievement && (
                <AchievementCard>
                  <Typography variant="h4" component="span">{post.achievement.icon}</Typography>
                  <Box>
                    <Typography variant="subtitle2">Achievement Unlocked: {post.achievement.name}</Typography>
                    <Typography variant="caption" color="warning.main">{post.achievement.rarity}</Typography>
                  </Box>
                </AchievementCard>
              )}

              {post.type === 'clip' && post.clip && (
                <ClipCard>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      👁️ {post.clip.views} views
                    </Typography>
                    <Typography variant="body2">
                      ⏱️ {post.clip.duration}
                    </Typography>
                  </Box>
                </ClipCard>
              )}

              {post.imageUrl && (
                <PostImage src={post.imageUrl} alt="Post" />
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <ActionButton
                  startIcon={post.liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  onClick={() => handleLike(post.id)}
                >
                  {post.likes} Likes
                </ActionButton>
                <ActionButton startIcon={<CommentIcon />}>
                  {post.comments} Comments
                </ActionButton>
                <Tooltip title="Share">
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </StyledPostContainer>
          ))}
        </Box>
      )}

      {/* Create Team Dialog */}
      <Dialog 
        open={createTeamDialogOpen} 
        onClose={() => setCreateTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create a Team</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Team Name"
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Game</InputLabel>
              <Select label="Game">
                <MenuItem value="valorant">Valorant</MenuItem>
                <MenuItem value="csgo">CS:GO</MenuItem>
                <MenuItem value="lol">League of Legends</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Required Rank</InputLabel>
              <Select label="Required Rank">
                <MenuItem value="any">Any</MenuItem>
                <MenuItem value="silver">Silver+</MenuItem>
                <MenuItem value="gold">Gold+</MenuItem>
                <MenuItem value="platinum">Platinum+</MenuItem>
                <MenuItem value="diamond">Diamond+</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Schedule"
              margin="normal"
              placeholder="e.g., Weekends 6-10 PM EST"
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTeamDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateTeamDialogOpen(false)}>
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Tournament Dialog */}
      <Dialog 
        open={createTournamentDialogOpen} 
        onClose={() => setCreateTournamentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create a Tournament</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tournament Name"
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Game</InputLabel>
              <Select label="Game">
                <MenuItem value="valorant">Valorant</MenuItem>
                <MenuItem value="csgo">CS:GO</MenuItem>
                <MenuItem value="lol">League of Legends</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Prize Pool"
              margin="normal"
              placeholder="e.g., $1,000"
            />
            <TextField
              fullWidth
              type="date"
              label="Tournament Date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Format</InputLabel>
              <Select label="Format">
                <MenuItem value="single">Single Elimination</MenuItem>
                <MenuItem value="double">Double Elimination</MenuItem>
                <MenuItem value="round">Round Robin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Maximum Teams"
              type="number"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTournamentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateTournamentDialogOpen(false)}>
            Create Tournament
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Feed; 