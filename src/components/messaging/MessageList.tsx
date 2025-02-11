import { Box, Typography, Avatar } from '@mui/material';
import { IMessage } from '../../types/social';
import { AmplifyUser } from '../../types/auth';
import { useRef, useEffect } from 'react';

interface MessageListProps {
  messages: IMessage[];
  user: AmplifyUser | null;
}

const isCurrentUser = (message: IMessage, user: AmplifyUser) => {
  return message.userId === user.username;
};

const MessageList: React.FC<MessageListProps> = ({ messages, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const renderMessage = (message: IMessage) => {
    const isOwn = message.userId === user?.username;

    return (
      <Box
        key={message.id}
        display="flex"
        justifyContent={isOwn ? 'flex-end' : 'flex-start'}
        mb={2}
      >
        <MessageBubble message={message} isOwn={isOwn} />
      </Box>
    );
  };

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
      {messages.map(renderMessage)}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
