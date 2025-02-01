import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  ImageList,
  ImageListItem,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ContentCopy as CopyIcon,
  Report as ReportIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { IMessage } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import ReactionBar from '../post/ReactionBar';

interface MessageListProps {
  messages: IMessage[];
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReplyMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, reactionType: string) => Promise<void>;
  onReportMessage: (messageId: string, reason: string) => Promise<void>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onReactToMessage,
  onReportMessage,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, message: IMessage) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleEditClick = () => {
    if (selectedMessage) {
      setEditContent(selectedMessage.content);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    if (selectedMessage && editContent.trim()) {
      await onEditMessage(selectedMessage.id, editContent);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedMessage) {
      await onDeleteMessage(selectedMessage.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleReportSubmit = async () => {
    if (selectedMessage && reportReason.trim()) {
      await onReportMessage(selectedMessage.id, reportReason);
      setReportDialogOpen(false);
      setReportReason('');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    handleMenuClose();
  };

  const renderAttachments = (message: IMessage) => {
    if (!message.attachments?.length) return null;

    const imageAttachments = message.attachments.filter((att) =>
      att.type === 'image'
    );
    const otherAttachments = message.attachments.filter(
      (att) => att.type !== 'image'
    );

    return (
      <Box sx={{ mt: 1 }}>
        {imageAttachments.length > 0 && (
          <ImageList cols={Math.min(imageAttachments.length, 3)} gap={8}>
            {imageAttachments.map((attachment) => (
              <ImageListItem key={attachment.url}>
                <img
                  src={attachment.url}
                  alt={attachment.description || ''}
                  loading="lazy"
                  style={{ borderRadius: 4 }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
        {otherAttachments.map((attachment) => (
          <Box
            key={attachment.url}
            component="a"
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'block',
              mt: 1,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <Typography variant="body2">{attachment.description || 'Attachment'}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderMessage = (message: IMessage) => {
    if (message.metadata?.isDeleted) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          This message has been deleted
        </Typography>
      );
    }

    const isOwnMessage = message.sender.id === user?.id;

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        {!isOwnMessage && (
          <Avatar
            src={message.sender.avatarUrl}
            alt={message.sender.username}
            sx={{ mr: 1 }}
          />
        )}
        <Box
          sx={{
            maxWidth: '70%',
            [isOwnMessage ? 'ml' : 'mr']: 2,
          }}
        >
          {message.replyTo && (
            <Paper
              elevation={0}
              sx={{
                p: 1,
                mb: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                cursor: 'pointer',
              }}
              onClick={() => {
                // Scroll to replied message
                document.getElementById(`message-${message.replyTo?.id}`)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Reply to {message.replyTo.sender.username}
              </Typography>
              <Typography variant="body2" noWrap>
                {message.replyTo.content}
              </Typography>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: isOwnMessage ? 'primary.main' : 'action.hover',
              color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                [isOwnMessage ? 'left' : 'right']: -28,
                opacity: 0,
                '&:hover': { opacity: 1 },
                '.message-container:hover &': { opacity: 0.5 },
              }}
              onClick={(e) => handleMenuOpen(e, message)}
            >
              <MoreIcon fontSize="small" />
            </IconButton>

            <Typography variant="body1">{message.content}</Typography>
            {message.metadata?.isEdited && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (edited)
              </Typography>
            )}
            {renderAttachments(message)}
          </Paper>

          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </Typography>
            {message.metadata?.readAt && isOwnMessage && (
              <Tooltip title="Read">
                <CheckIcon fontSize="small" color="primary" />
              </Tooltip>
            )}
          </Box>

          {message.reactions && message.reactions.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <ReactionBar
                reactions={{
                  like: { count: 0, reacted: false },
                  love: { count: 0, reacted: false },
                  happy: { count: 0, reacted: false },
                  sad: { count: 0, reacted: false },
                  celebrate: { count: 0, reacted: false },
                  fire: { count: 0, reacted: false },
                }}
                commentCount={0}
                shareCount={0}
                onReact={(type) => onReactToMessage(message.id, type)}
                onComment={() => {}}
                onShare={() => {}}
                showCommentButton={false}
                showShareButton={false}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showDivider =
            prevMessage &&
            new Date(message.createdAt).getDate() !==
              new Date(prevMessage.createdAt).getDate();

          return (
            <React.Fragment key={message.id}>
              {showDivider && (
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </Typography>
                </Divider>
              )}
              <div id={`message-${message.id}`} className="message-container">
                {renderMessage(message)}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => onReplyMessage(selectedMessage?.id || '')}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          Reply
        </MenuItem>
        <MenuItem onClick={() => handleCopyText(selectedMessage?.content || '')}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Copy Text
        </MenuItem>
        {selectedMessage?.sender.id === user?.id && (
          <>
            <MenuItem onClick={handleEditClick}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              Delete
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleReportClick}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          Report
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Report Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Please provide a reason for reporting this message..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReportSubmit} color="error">
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageList; 