import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        size="small"
      />
      <IconButton type="submit" color="primary" disabled={!message.trim()}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
