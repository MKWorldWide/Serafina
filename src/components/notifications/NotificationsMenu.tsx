import { Menu, List, ListItem, ListItemText, Box, Typography } from '@mui/material';

export interface INotification {
  id: string;
  title: string;
  description: string;
  type: 'message' | 'friend_request' | 'game_invite' | 'achievement' | 'system';
  timestamp: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  notifications: INotification[];
  onNotificationClick: (notification: INotification) => void;
}

export default function NotificationsMenu({
  anchorEl,
  onClose,
  notifications,
  onNotificationClick,
}: NotificationsMenuProps) {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          maxHeight: 400,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <List sx={{ p: 0 }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <ListItem
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
                cursor: 'pointer',
              }}
            >
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box component="span">
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block' }}
                    >
                      {notification.description}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary="No notifications"
              secondary="You're all caught up!"
            />
          </ListItem>
        )}
      </List>
    </Menu>
  );
} 