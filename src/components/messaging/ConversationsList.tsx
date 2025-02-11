import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import { IConversation } from '../../types/social';

interface ConversationsListProps {
  conversations: IConversation[];
  selectedConversation: IConversation | null;
  onSelectConversation: (conversation: IConversation) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
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
    <List>
      {conversations.map((conversation) => (
        <ListItem
          key={conversation.id}
          button
          selected={selectedConversation?.id === conversation.id}
          onClick={() => onSelectConversation(conversation)}
        >
          <ListItemAvatar>
            <Avatar src={conversation.avatar} alt={conversation.name} />
          </ListItemAvatar>
          <ListItemText
            primary={conversation.name}
            secondary={
              conversation.lastMessage && (
                <>
                  {conversation.lastMessage.content}
                  {' • '}
                  {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                </>
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ConversationsList;
