import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

export interface MessageInputProps {
  onSubmit: (content: string) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit(content.trim());
    setContent('');
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
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="outlined"
        size="small"
      />
      <IconButton type="submit" color="primary" disabled={!content.trim()}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput; 