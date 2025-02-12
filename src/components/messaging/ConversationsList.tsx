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
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {conversations.map((conversation) => {
          const isSelected = selectedConversation?.id === conversation.id;
          const otherParticipant = conversation.participants[0];

          return (
            <ListItem
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              sx={{
                cursor: 'pointer',
                bgcolor: isSelected ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={otherParticipant.avatar}
                  alt={conversation.name || otherParticipant.username}
                />
              </ListItemAvatar>
              <ListItemText
                primary={conversation.name || otherParticipant.username}
                secondary={
                  conversation.lastMessage && (
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%',
                        }}
                      >
                        {conversation.lastMessage.content}
                      </Typography>
                      <Typography variant="caption" component="span">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </Typography>
                    </Box>
                  )
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ConversationsList;
