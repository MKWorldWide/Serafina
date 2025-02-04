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
import { IMessage, IAttachment } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import ReactionBar from '../post/ReactionBar';
import useStore from '../../store/useStore';

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

  const renderAttachment = (attachment: IAttachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="max-w-sm rounded-lg overflow-hidden">
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        );
      case 'video':
        return (
          <div className="max-w-sm rounded-lg overflow-hidden">
            <video src={attachment.url} controls className="w-full h-auto" />
          </div>
        );
      case 'file':
        return (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{attachment.filename}</span>
          </a>
        );
    }
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
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`flex max-w-[80%] ${
            isOwn ? 'flex-row-reverse items-end' : 'items-start'
          }`}
        >
          {!isOwn && (
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                <img src={message.sender.avatarUrl} alt={message.sender.username} />
              </div>
            </div>
          )}

          <div
            className={`flex flex-col space-y-1 ${
              isOwn ? 'items-end mr-2' : 'items-start ml-2'
            }`}
          >
            {!isOwn && (
              <span className="text-sm font-medium">{message.sender.username}</span>
            )}

            <div
              className={`rounded-lg p-3 ${
                isOwn
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>

              {message.attachments?.map((attachment, index) => (
                <div key={index} className="mt-2">
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-xs opacity-60">
              <time>{new Date(message.createdAt).toLocaleString()}</time>
              {onReplyMessage(message.id)}
              {isOwn && onEditMessage && (
                <button
                  className="hover:underline"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              )}
              {isOwn && onDeleteMessage && (
                <button
                  className="hover:underline text-error"
                  onClick={handleDeleteClick}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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
            new Date(message.createdAt).getDate() !== new Date(prevMessage.createdAt).getDate();

          return (
            <React.Fragment key={message.id}>
              {showDivider && (
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </Typography>
                </Divider>
              )}
              <div className="message-container">
                {renderMessage(message)}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
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
            onChange={e => setEditContent(e.target.value)}
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
            onChange={e => setReportReason(e.target.value)}
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
