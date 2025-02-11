import { Box, Typography, Avatar } from '@mui/material';
import { IMessage } from '../../types/social';
import { AmplifyUser } from '../../types/auth';

interface MessageListProps {
  messages: IMessage[];
  user: AmplifyUser | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, user }) => {
  if (!messages.length) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="textSecondary">No messages yet. Start the conversation!</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            flexDirection: message.userId === user?.username ? 'row-reverse' : 'row',
            mb: 2,
          }}
        >
          <Box sx={{ mr: 2, ml: message.userId === user?.username ? 2 : 0 }}>
            <Avatar src={message.sender.avatar} alt={message.sender.username} />
          </Box>
          <Box
            sx={{
              maxWidth: '70%',
              p: 2,
              borderRadius: 2,
              backgroundColor: message.userId === user?.username ? 'primary.main' : 'grey.100',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: message.userId === user?.username ? 'primary.contrastText' : 'text.primary',
              }}
            >
              {message.content}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: message.userId === user?.username ? 'primary.contrastText' : 'text.primary',
                opacity: 0.7,
              }}
            >
              {new Date(message.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default MessageList;
