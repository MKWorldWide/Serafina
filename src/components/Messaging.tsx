import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Drawer,
  Divider,
  InputAdornment,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatUser {
  id: string;
  username: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  verified: boolean;
  reputation: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    unread: boolean;
  };
}

const OnlineBadge = styled(Badge)(({ theme }) => ({
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
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '600px',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const MessageBubble = styled(Box)<{ sent?: boolean }>(({ theme, sent }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1, 2),
  borderRadius: sent ? '20px 20px 0 20px' : '20px 20px 20px 0',
  backgroundColor: sent ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
  color: sent ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: sent ? 'flex-end' : 'flex-start',
  margin: theme.spacing(0.5, 0),
}));

const Messaging: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock chat users data
    const mockUsers: ChatUser[] = [
      {
        id: '1',
        username: 'ProGamer123',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer123',
        status: 'online',
        verified: true,
        reputation: 4.8,
        lastMessage: {
          content: 'Want to join our tournament?',
          timestamp: new Date().toISOString(),
          unread: true,
        },
      },
      {
        id: '2',
        username: 'ValorantMaster',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ValorantMaster',
        status: 'in-game',
        currentGame: 'Valorant',
        verified: true,
        reputation: 4.5,
        lastMessage: {
          content: 'Great game yesterday!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          unread: false,
        },
      },
      // Add more mock users
    ];
    setChatUsers(mockUsers);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: user?.username || '',
          receiverId: selectedChat.id,
          content: 'Hey, are you up for some games?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: '2',
          senderId: selectedChat.id,
          receiverId: user?.username || '',
          content: 'Sure! What do you want to play?',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          read: true,
        },
        // Add more mock messages
      ];
      setMessages(mockMessages);
    }
  }, [selectedChat, user?.username]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: user?.username || '',
      receiverId: selectedChat.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const filteredUsers = chatUsers.filter(chatUser =>
    chatUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#44b700';
      case 'in-game': return '#ff9800';
      default: return '#bdbdbd';
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '600px' }}>
      {/* Users List */}
      <Paper
        sx={{
          width: 320,
          backgroundColor: 'rgba(8, 95, 128, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider />
        <List sx={{ overflow: 'auto', height: 'calc(100% - 72px)' }}>
          {filteredUsers.map((chatUser) => (
            <ListItem
              key={chatUser.id}
              button
              selected={selectedChat?.id === chatUser.id}
              onClick={() => setSelectedChat(chatUser)}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: getStatusColor(chatUser.status),
                    },
                  }}
                >
                  <Avatar src={chatUser.avatarUrl} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {chatUser.username}
                    {chatUser.verified && (
                      <Tooltip title="Verified User">
                        <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {chatUser.status === 'in-game' ? (
                      <Chip
                        icon={<SportsEsportsIcon sx={{ fontSize: 16 }} />}
                        label={chatUser.currentGame}
                        size="small"
                        color="warning"
                        sx={{ height: 20 }}
                      />
                    ) : (
                      chatUser.lastMessage?.content
                    )}
                  </Box>
                }
              />
              {chatUser.lastMessage?.unread && (
                <Badge color="primary" variant="dot" />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      {selectedChat ? (
        <ChatContainer>
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: getStatusColor(selectedChat.status),
                    },
                  }}
                >
                  <Avatar src={selectedChat.avatarUrl} />
                </Badge>
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="subtitle1">
                      {selectedChat.username}
                    </Typography>
                    {selectedChat.verified && (
                      <Tooltip title="Verified User">
                        <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {selectedChat.status === 'in-game'
                      ? `Playing ${selectedChat.currentGame}`
                      : `Reputation: ${selectedChat.reputation}`}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedChat(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <MessageList ref={messageListRef}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                sent={message.senderId === user?.username}
              >
                <Typography variant="body2">{message.content}</Typography>
                <Typography
                  variant="caption"
                  color="inherit"
                  sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </MessageBubble>
            ))}
          </MessageList>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </ChatContainer>
      ) : (
        <Paper
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(8, 95, 128, 0.1)',
            borderRadius: '20px',
          }}
        >
          <Typography color="textSecondary">
            Select a chat to start messaging
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Messaging; 