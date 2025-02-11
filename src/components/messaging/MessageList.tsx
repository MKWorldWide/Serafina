import { Box, Typography } from '@mui/material';
import { IMessage } from '../../types/social';
import { AmplifyUser } from '../../types/auth';
import { useRef, useEffect } from 'react';
import MessageBubble from '../chat/MessageBubble';

interface MessageListProps {
  messages: IMessage[];
  user: AmplifyUser | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!messages.length) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="textSecondary">No messages yet. Start the conversation!</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 200px)',
        overflowY: 'auto',
        p: 2,
        bgcolor: 'background.default'
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          display="flex"
          justifyContent={message.userId === user?.username ? 'flex-end' : 'flex-start'}
          mb={2}
        >
          <MessageBubble 
            message={message} 
            isOwn={message.userId === user?.username} 
          />
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
