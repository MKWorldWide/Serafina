import { Box, Avatar, Typography } from '@mui/material';
import { IMessage } from '../../types/social';

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const avatarUrl = message.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        mb: 2,
      }}
    >
      <Box sx={{ mr: 2, ml: isOwnMessage ? 2 : 0 }}>
        <Avatar src={avatarUrl} alt={message.userName} />
      </Box>
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          borderRadius: 2,
          backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
          }}
        >
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
            opacity: 0.7,
            display: 'block',
            mt: 0.5
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

 