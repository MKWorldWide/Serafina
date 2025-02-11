import { Box, Avatar, Typography } from '@mui/material';
import { IMessage } from '../../types/social';

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const avatarUrl = message.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`;
  
  return (
    <Box display="flex" alignItems="flex-start" flexDirection={isOwn ? 'row-reverse' : 'row'}>
      <Avatar
        src={avatarUrl}
        alt={message.userName}
        sx={{ width: 40, height: 40, mr: isOwn ? 0 : 1, ml: isOwn ? 1 : 0 }}
      />
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          borderRadius: 2,
          bgcolor: isOwn ? 'primary.main' : 'grey.100',
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: isOwn ? 'primary.contrastText' : 'text.primary' }}
        >
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isOwn ? 'primary.contrastText' : 'text.secondary',
            opacity: 0.8,
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

export default MessageBubble;

 