import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import { IConversation } from '../../types/social';

interface ConversationsListProps {
  conversations: IConversation[];
  selectedConversation: IConversation | null;
  onSelectConversation: (conversation: IConversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  if (!conversations.length) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">No conversations yet</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
      {conversations.map((conversation) => {
        const participant = conversation.participants[0];
        const lastMessage = conversation.lastMessage;
        
        return (
          <ListItem
            key={conversation.id}
            button
            selected={selectedConversation?.id === conversation.id}
            onClick={() => onSelectConversation(conversation)}
          >
            <ListItemAvatar>
              <Avatar
                src={participant.avatar}
                alt={participant.username}
              />
            </ListItemAvatar>
            <ListItemText
              primary={conversation.name || participant.username}
              secondary={
                lastMessage
                  ? `${lastMessage.content} · ${formatTimestamp(lastMessage.timestamp)}`
                  : 'No messages yet'
              }
              secondaryTypographyProps={{
                noWrap: true,
                sx: { opacity: 0.7 }
              }}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default ConversationsList;
