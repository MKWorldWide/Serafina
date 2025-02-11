import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface IMessage {
  id: string;
  content: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface MessageListProps {
  messages: IMessage[];
  onEdit: (message: IMessage, newContent: string) => Promise<void>;
  onDelete: (message: IMessage) => Promise<void>;
  onReply: (message: IMessage) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onEdit,
  onDelete,
  onReply,
}) => {
  const { user } = useAuth();

  return (
    <List>
      {messages.map((message) => (
        <ListItem
          key={message.id}
          sx={{
            display: 'flex',
            flexDirection: message.userId === user?.id ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ mr: 2, ml: message.userId === user?.id ? 2 : 0 }}>
            <Avatar src={message.userAvatar} alt={message.userName} />
          </Box>
          <Box
            sx={{
              maxWidth: '70%',
              backgroundColor: message.userId === user?.id ? 'primary.main' : 'grey.100',
              borderRadius: 2,
              p: 2,
            }}
          >
            <ListItemText
              primary={message.userName}
              secondary={message.content}
              primaryTypographyProps={{
                variant: 'subtitle2',
                color: message.userId === user?.id ? 'primary.contrastText' : 'text.primary',
              }}
              secondaryTypographyProps={{
                color: message.userId === user?.id ? 'primary.contrastText' : 'text.primary',
              }}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default MessageList;
