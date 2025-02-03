import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Box,
  Divider,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { IConversation } from '../../types/social';
import { useAuth } from '../../context/AuthContext';

interface ConversationsListProps {
  conversations: IConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: IConversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
}) => {
  const { user } = useAuth();

  const getOtherParticipant = (conversation: IConversation) => {
    return conversation.participants.find((p) => p.id !== user?.id);
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {conversations.map((conversation, index) => {
        const otherParticipant = getOtherParticipant(conversation);
        
        return (
          <React.Fragment key={conversation.id}>
            <ListItem
              button
              selected={conversation.id === selectedConversationId}
              onClick={() => onSelectConversation(conversation)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={conversation.unreadCount === 0}
                >
                  <Avatar src={otherParticipant?.avatarUrl} alt={otherParticipant?.username} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">
                      {otherParticipant?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conversation.lastMessage &&
                        formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                          addSuffix: true,
                        })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
                    }}
                  >
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </Typography>
                }
              />
            </ListItem>
            {index < conversations.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default ConversationsList; 