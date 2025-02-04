import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  Favorite as LikeIcon,
  Comment as CommentIcon,
  PersonAdd as FollowIcon,
  AlternateEmail as MentionIcon,
  EmojiEvents as TournamentIcon,
  Group as TeamIcon,
  Star as AchievementIcon,
  Info as SystemIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { INotification, NotificationType, NotificationFilter } from '../../types/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  notifications: INotification[];
  loading: boolean;
  error: string | null;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  onClearAll: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'LIKE':
      return <LikeIcon fontSize="small" color="error" />;
    case 'COMMENT':
      return <CommentIcon fontSize="small" color="primary" />;
    case 'FOLLOW':
      return <FollowIcon fontSize="small" color="primary" />;
    case 'MENTION':
      return <MentionIcon fontSize="small" color="primary" />;
    case 'TOURNAMENT_INVITE':
      return <TournamentIcon fontSize="small" color="secondary" />;
    case 'TEAM_INVITE':
      return <TeamIcon fontSize="small" color="secondary" />;
    case 'ACHIEVEMENT':
      return <AchievementIcon fontSize="small" color="warning" />;
    case 'SYSTEM':
      return <SystemIcon fontSize="small" />;
  }
};

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  anchorEl,
  onClose,
  notifications,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setFilter(newValue === 0 ? 'all' : 'unread');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleNotificationClick = (notification: INotification) => {
    // Mark as read
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'LIKE':
      case 'COMMENT':
        if (notification.data?.postId) {
          navigate(`/post/${notification.data.postId}`);
        }
        break;
      case 'FOLLOW':
        if (notification.sender?.username) {
          navigate(`/profile/${notification.sender.username}`);
        }
        break;
      case 'TOURNAMENT_INVITE':
        if (notification.data?.tournamentId) {
          navigate(`/tournaments/${notification.data.tournamentId}`);
        }
        break;
      case 'TEAM_INVITE':
        if (notification.data?.teamId) {
          navigate(`/teams/${notification.data.teamId}`);
        }
        break;
      case 'ACHIEVEMENT':
        if (notification.data?.achievementId) {
          navigate(`/achievements/${notification.data.achievementId}`);
        }
        break;
    }
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          width: 360,
          maxHeight: '80vh',
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1.5,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="div">
          Notifications
        </Typography>
        <Box>
          <Tooltip title="Filter">
            <IconButton
              size="small"
              onClick={e => {
                // TODO: Add filter menu
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth" sx={{ px: 2, pt: 1 }}>
        <Tab label="All" />
        <Tab label="Unread" />
      </Tabs>

      <Box sx={{ mt: 1 }}>
        <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={onMarkAllAsRead}
            disabled={notifications.length === 0 || loading}
          >
            Mark all read
          </Button>
          <Button
            size="small"
            onClick={onClearAll}
            disabled={notifications.length === 0 || loading}
          >
            Clear all
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {filter === 'all'
                ? 'No notifications'
                : filter === 'unread'
                  ? 'No unread notifications'
                  : `No ${filter.toLowerCase()} notifications`}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredNotifications.map(notification => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  borderLeft: !notification.read
                    ? `3px solid ${theme.palette.primary.main}`
                    : 'none',
                  bgcolor: !notification.read ? 'action.hover' : 'transparent',
                  '&:hover': {
                    '& .actions': {
                      opacity: 1,
                    },
                  },
                }}
              >
                <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="div"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </React.Fragment>
                  }
                  sx={{ pr: 6 }}
                />
                <Box
                  className="actions"
                  sx={{
                    position: 'absolute',
                    right: theme.spacing(1),
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  {!notification.read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                      >
                        <ReadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}
      </Box>
    </Menu>
  );
};

export default NotificationsMenu;
