import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  ImageList,
  ImageListItem,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { IMessageInput } from '../../types/social';

interface MessageInputProps {
  onSendMessage: (message: IMessageInput) => Promise<void>;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/*': ['.pdf', '.doc', '.docx'],
    },
    onDrop: (acceptedFiles) => {
      setAttachments([...attachments, ...acceptedFiles]);
    },
    noClick: true,
  });

  const handleSubmit = async () => {
    if ((!content.trim() && attachments.length === 0) || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSendMessage({
        content: content.trim(),
        attachments,
      });
      setContent('');
      setAttachments([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <Box {...getRootProps()}>
      <input {...getInputProps()} />
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        {attachments.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <ImageList cols={Math.min(attachments.length, 4)} gap={8}>
              {attachments.map((file, index) => (
                <ImageListItem key={index} sx={{ position: 'relative' }}>
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      loading="lazy"
                      style={{ borderRadius: 4, height: 80, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 80,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        p: 1,
                      }}
                    >
                      <AttachFileIcon />
                      <Typography variant="caption" noWrap>
                        {file.name}
                      </Typography>
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => removeAttachment(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isSubmitting}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
            }}
          />
          <Tooltip title="Attach files">
            <IconButton
              component="label"
              disabled={disabled || isSubmitting}
            >
              <input
                type="file"
                hidden
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments([...attachments, ...Array.from(e.target.files)]);
                  }
                }}
              />
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            color="primary"
            onClick={handleSubmit}
            disabled={
              disabled ||
              isSubmitting ||
              (!content.trim() && attachments.length === 0)
            }
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageInput; 