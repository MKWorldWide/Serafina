import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useState, FormEvent } from 'react';

interface MessageInputProps {
  onSubmit: (content: string) => Promise<void>;
}

export const MessageInput = ({ onSubmit }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
      }}
    >
      <TextField
        fullWidth
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        size="small"
        multiline
        maxRows={4}
        sx={{ flex: 1 }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!content.trim() || isSubmitting}
        size="small"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput; 