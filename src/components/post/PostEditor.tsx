import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AttachFile as FileIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Group as GroupIcon,
  LocalOffer as TagIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';

interface IPostEditorProps {
  initialContent?: string;
  initialPrivacy?: PostPrivacy;
  initialTags?: string[];
  isEditing?: boolean;
  onSubmit: (post: IPostData) => Promise<void>;
  onCancel?: () => void;
}

export type PostPrivacy = 'public' | 'private' | 'friends';

export interface IPostData {
  content: string;
  privacy: PostPrivacy;
  tags: string[];
  media: IPostMedia[];
}

export interface IPostMedia {
  type: 'image' | 'video' | 'file';
  file: File;
  preview: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'code-block'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'link',
  'code-block',
];

const PostEditor: React.FC<IPostEditorProps> = ({
  initialContent = '',
  initialPrivacy = 'public',
  initialTags = [],
  isEditing = false,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [privacy, setPrivacy] = useState<PostPrivacy>(initialPrivacy);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [media, setMedia] = useState<IPostMedia[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm'],
      'application/*': ['.pdf', '.doc', '.docx'],
    },
    onDrop: (acceptedFiles) => {
      const newMedia = acceptedFiles.map((file) => ({
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
          ? 'video'
          : 'file',
        file,
        preview: URL.createObjectURL(file),
      }));
      setMedia([...media, ...newMedia]);
    },
  });

  const handlePrivacyChange = (newPrivacy: PostPrivacy) => {
    setPrivacy(newPrivacy);
    setShowPrivacyDialog(false);
  };

  const handleAddTag = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) return;

    const postData: IPostData = {
      content,
      privacy,
      tags,
      media,
    };

    await onSubmit(postData);
    setContent('');
    setPrivacy('public');
    setTags([]);
    setMedia([]);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Avatar src={user?.avatarUrl} alt={user?.username} />
        <Typography variant="subtitle1">{user?.username}</Typography>
        <Button
          size="small"
          startIcon={
            privacy === 'public' ? (
              <PublicIcon />
            ) : privacy === 'private' ? (
              <PrivateIcon />
            ) : (
              <GroupIcon />
            )
          }
          onClick={() => setShowPrivacyDialog(true)}
        >
          {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
        </Button>
      </Box>

      <ReactQuill
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="What's on your mind?"
      />

      {/* Media Preview */}
      {media.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {media.map((item, index) => (
            <Box
              key={index}
              sx={{ position: 'relative', width: 100, height: 100 }}
            >
              {item.type === 'image' ? (
                <img
                  src={item.preview}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
              ) : item.type === 'video' ? (
                <video
                  src={item.preview}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <FileIcon />
                </Box>
              )}
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                }}
                onClick={() => handleRemoveMedia(index)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Tags */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              size="small"
            />
          ))}
        </Stack>
        <TextField
          inputRef={tagInputRef}
          size="small"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags..."
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: <TagIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
      </Box>

      {/* Actions */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Add media">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <IconButton>
                <ImageIcon />
              </IconButton>
            </div>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!content.trim() && media.length === 0}
          >
            {isEditing ? 'Save Changes' : 'Post'}
          </Button>
        </Box>
      </Box>

      {/* Privacy Dialog */}
      <Dialog
        open={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
      >
        <DialogTitle>Who can see your post?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Button
              startIcon={<PublicIcon />}
              onClick={() => handlePrivacyChange('public')}
              variant={privacy === 'public' ? 'contained' : 'outlined'}
              fullWidth
            >
              Public
            </Button>
            <Button
              startIcon={<GroupIcon />}
              onClick={() => handlePrivacyChange('friends')}
              variant={privacy === 'friends' ? 'contained' : 'outlined'}
              fullWidth
            >
              Friends Only
            </Button>
            <Button
              startIcon={<PrivateIcon />}
              onClick={() => handlePrivacyChange('private')}
              variant={privacy === 'private' ? 'contained' : 'outlined'}
              fullWidth
            >
              Only Me
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default PostEditor; 