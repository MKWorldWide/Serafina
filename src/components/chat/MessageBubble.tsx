import { Box, Avatar, Typography } from '@mui/material';
import { IMessage } from '../../types/social';

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <Box
      display="flex"
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      alignItems="flex-start"
      gap={1}
    >
      <Avatar
        src={message.sender.avatar}
        alt={message.sender.username}
        sx={{ width: 32, height: 32 }}
      />
      <Box
        sx={{
          maxWidth: '70%',
          p: 1.5,
          borderRadius: 2,
          bgcolor: isOwn ? 'primary.main' : 'grey.100',
          color: isOwn ? 'white' : 'text.primary',
        }}
      >
        <Typography variant="body1">{message.content}</Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            textAlign: isOwn ? 'right' : 'left',
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageBubble;

 