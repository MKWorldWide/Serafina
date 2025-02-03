import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Button,
  Fab,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ConversationsList from '../components/messaging/ConversationsList';
import MessageList from '../components/messaging/MessageList';
import MessageInput from '../components/messaging/MessageInput';
import GroupChatDialog from '../components/messaging/GroupChatDialog';
import { IConversation, IMessage, IMessageInput, User } from '../types/social';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

const DRAWER_WIDTH = 320;

const Messaging: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [groupChatDialogOpen, setGroupChatDialogOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const { user } = useAuth();
  const {
    subscribe,
    sendMessage,
    sendTypingIndicator,
    updatePresence,
  } = useWebSocket();

  // Load initial conversations
  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockUser: User = {
      id: '2',
      username: 'Jane Doe',
      email: 'jane@example.com',
      avatarUrl: 'https://mui.com/static/images/avatar/2.jpg',
    };

    const mockConversations: IConversation[] = [
      {
        id: '1',
        type: 'direct',
        participants: [
          {
            user: mockUser,
            role: 'member',
            joinedAt: new Date().toISOString(),
            isOnline: true,
            typing: false,
            status: 'active',
          },
          {
            user: user!,
            role: 'member',
            joinedAt: new Date().toISOString(),
            isOnline: true,
            typing: false,
            status: 'active',
          },
        ],
        lastMessage: {
          id: '1',
          content: 'Hey, how are you?',
          sender: mockUser,
          recipient: user!,
          createdAt: new Date().toISOString(),
          type: 'text',
        },
        unreadCount: 1,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    setConversations(mockConversations);
  }, [user]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeMessage = subscribe('message', (payload) => {
      if (payload.conversationId === selectedConversation?.id) {
        setMessages((prev) => [...prev, payload.message]);
      }
      // Update conversation's last message and unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === payload.conversationId
            ? {
                ...conv,
                lastMessage: payload.message,
                unreadCount:
                  conv.id === selectedConversation?.id
                    ? 0
                    : conv.unreadCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : conv
        )
      );
    });

    const unsubscribeTyping = subscribe('typing', (payload) => {
      if (payload.conversationId === selectedConversation?.id) {
        if (payload.isTyping) {
          setTypingUsers((prev) => new Map(prev).set(payload.userId, payload.username));
        } else {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(payload.userId);
            return next;
          });
        }
      }
    });

    const unsubscribePresence = subscribe('presence', (payload) => {
      setConversations((prev) =>
        prev.map((conv) => ({
          ...conv,
          participants: conv.participants.map((p) =>
            p.user.id === payload.userId
              ? { ...p, isOnline: payload.status === 'online' }
              : p
          ),
        }))
      );
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribePresence();
    };
  }, [subscribe, selectedConversation]);

  // Update presence when component mounts/unmounts
  useEffect(() => {
    updatePresence('online');
    return () => {
      updatePresence('offline');
    };
  }, [updatePresence]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const mockUser: User = {
        id: '2',
        username: 'Jane Doe',
        email: 'jane@example.com',
        avatarUrl: 'https://mui.com/static/images/avatar/2.jpg',
      };

      // Mock data - Replace with actual API call
      const mockMessages: IMessage[] = [
        {
          id: '1',
          content: 'Hey, how are you?',
          sender: mockUser,
          recipient: user!,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
        },
        {
          id: '2',
          content: "I'm good, thanks! How about you?",
          sender: user!,
          recipient: mockUser,
          createdAt: new Date(Date.now() - 3000000).toISOString(),
          type: 'text',
          metadata: {
            readAt: new Date(Date.now() - 2000000).toISOString(),
            isEdited: false,
            isDeleted: false,
          },
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation, user]);

  const handleSelectConversation = (conversation: IConversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSendMessage = async (message: IMessageInput) => {
    if (!selectedConversation) return;

    sendMessage(
      selectedConversation.participants.find((p) => p.user.id !== user?.id)?.user.id || '',
      message.content,
      message.attachments
    );
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedConversation) {
      sendTypingIndicator(
        selectedConversation.participants.find((p) => p.user.id !== user?.id)?.user.id || '',
        isTyping
      );
    }
  };

  const handleCreateGroup = async (data: any) => {
    // Mock group creation - Replace with actual API call
    const newGroup: IConversation = {
      id: Date.now().toString(),
      type: 'group',
      name: data.name,
      avatar: data.avatar ? URL.createObjectURL(data.avatar) : undefined,
      participants: data.participants.map((userId: string) => ({
        user: availableUsers.find((u) => u.id === userId)!,
        role: userId === user?.id ? 'owner' : 'member',
        joinedAt: new Date().toISOString(),
        isOnline: true,
      })),
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) => [...prev, newGroup]);
    setGroupChatDialogOpen(false);
  };

  const renderConversationHeader = () => {
    if (!selectedConversation) return null;

    const otherParticipant = selectedConversation.participants.find(
      (p) => p.user.id !== user?.id
    );

    return (
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar
            src={
              selectedConversation.type === 'group'
                ? selectedConversation.avatar
                : otherParticipant?.user.avatarUrl
            }
            alt={
              selectedConversation.type === 'group'
                ? selectedConversation.name
                : otherParticipant?.user.username
            }
          />
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">
              {selectedConversation.type === 'group'
                ? selectedConversation.name
                : otherParticipant?.user.username}
            </Typography>
            {typingUsers.size > 0 && (
              <Typography variant="caption" color="text.secondary">
                {Array.from(typingUsers.values()).join(', ')} is typing...
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    );
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Messages
        </Typography>
        <Fab
          size="small"
          color="primary"
          onClick={() => setGroupChatDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Box>
      <Divider />
      <ConversationsList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        onSelectConversation={handleSelectConversation}
      />
    </Box>
  );

  // Mock available users for group chat
  const availableUsers: User[] = [
    user!,
    {
      id: '2',
      username: 'Jane Doe',
      email: 'jane@example.com',
      avatarUrl: 'https://mui.com/static/images/avatar/2.jpg',
    },
    {
      id: '3',
      username: 'John Smith',
      email: 'john@example.com',
      avatarUrl: 'https://mui.com/static/images/avatar/3.jpg',
    },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {drawer}
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
        }}
      >
        {selectedConversation ? (
          <>
            {renderConversationHeader()}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <MessageList
                messages={messages}
                onEditMessage={async (messageId, content) => {
                  // Implement edit message
                }}
                onDeleteMessage={async (messageId) => {
                  // Implement delete message
                }}
                onReplyMessage={(messageId) => {
                  // Implement reply to message
                }}
                onReactToMessage={async (messageId, reactionType) => {
                  // Implement message reaction
                }}
                onReportMessage={async (messageId, reason) => {
                  // Implement message reporting
                }}
              />
            </Box>
            <Box sx={{ p: 2 }}>
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
              />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a conversation to start messaging
            </Typography>
          </Box>
        )}
      </Box>

      <GroupChatDialog
        open={groupChatDialogOpen}
        onClose={() => setGroupChatDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
        availableUsers={availableUsers}
        currentUser={user!}
      />
    </Box>
  );
};

export default Messaging; 