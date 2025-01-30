import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
}));

const ImagePreview = styled('img')({
  width: '100%',
  maxHeight: '300px',
  objectFit: 'cover',
  borderRadius: '10px',
  marginTop: '10px',
});

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { user } = useAuth();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      // Replace with actual API call
      console.log('Creating post:', { content, image });

      // Clear form
      setContent('');
      setImage(null);
      setImagePreview('');

      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!user) return null;

  return (
    <StyledPaper elevation={0}>
      <Typography variant="h6" gutterBottom>
        Create Post
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        />

        {imagePreview && (
          <Box sx={{ position: 'relative', mb: 2 }}>
            <ImagePreview src={imagePreview} alt="Preview" />
            <IconButton
              size="small"
              onClick={() => {
                setImage(null);
                setImagePreview('');
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<ImageIcon />}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.23)',
                color: 'rgba(255, 255, 255, 0.87)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              Add Image
            </Button>
          </label>
          <Button
            type="submit"
            variant="contained"
            disabled={!content.trim() && !image}
          >
            Post
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default CreatePost;
