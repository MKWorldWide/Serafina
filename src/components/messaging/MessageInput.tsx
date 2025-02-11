import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

interface MessageInputProps {
  onSubmit: (content: string) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
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
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            multiline
            maxRows={4}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Grid>
        <Grid item>
          <IconButton
            type="submit"
            color="primary"
            disabled={!content.trim() || isSubmitting}
            sx={{ height: '100%' }}
          >
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MessageInput; 