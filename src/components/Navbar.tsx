import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useScrollTrigger,
  Badge,
  Switch,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import NotificationsMenu from './notifications/NotificationsMenu';
import useStore from '../store/useStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'offline'>('online');
  const theme = useTheme();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate(`/profile/${user?.username}`);
    handleClose();
  };

  const getStatusColor = (status: 'online' | 'away' | 'offline') => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'away':
        return theme.palette.warning.main;
      case 'offline':
        return theme.palette.grey[500];
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme toggle logic
  };

  const handleMessages = () => {
    navigate('/messages');
    handleClose();
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
  };

  if (!user) {
    return (
      <AppBar
        position="fixed"
        elevation={isScrolled ? 4 : 0}
        sx={{
          bgcolor: 'background.paper',
          transition: 'all 0.3s',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'text.primary' }}
          >
            GameDin
          </Typography>
          <Button color="primary" component={Link} to="/login">
            Login
          </Button>
          <Button color="primary" component={Link} to="/register" variant="contained">
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="fixed"
      elevation={isScrolled ? 4 : 0}
      sx={{
        bgcolor: 'background.paper',
        transition: 'all 0.3s',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'text.primary' }}
        >
          GameDin
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ color: location.pathname === '/' ? 'primary.main' : 'text.primary' }}
          >
            Feed
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/forums"
            sx={{ color: location.pathname === '/forums' ? 'primary.main' : 'text.primary' }}
          >
            Forums
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/tournaments"
            sx={{ color: location.pathname === '/tournaments' ? 'primary.main' : 'text.primary' }}
          >
            Tournaments
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/jobs"
            sx={{ color: location.pathname === '/jobs' ? 'primary.main' : 'text.primary' }}
          >
            Jobs
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/analytics"
            sx={{ color: location.pathname === '/analytics' ? 'primary.main' : 'text.primary' }}
          >
            Analytics
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Messages">
            <IconButton color="inherit" onClick={handleMessages}>
              <Badge badgeContent={messageCount} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ position: 'relative' }}>
            <IconButton onClick={handleMenu}>
              <Avatar src={user.avatarUrl} alt={user.username} sx={{ width: 32, height: 32 }} />
              <StatusIcon
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  color: getStatusColor(userStatus),
                  fontSize: 12,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                }}
              />
            </IconButton>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Signed in as
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {user.username}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" secondary={user.email} />
          </MenuItem>

          <MenuItem onClick={handleMessages}>
            <ListItemIcon>
              <Badge badgeContent={messageCount} color="error">
                <MailIcon fontSize="small" />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </MenuItem>

          <MenuItem
            onClick={() => {
              navigate('/settings/notifications');
              handleClose();
            }}
          >
            <ListItemIcon>
              <NotificationsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Notification Settings" />
          </MenuItem>

          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>

          <MenuItem onClick={handleThemeToggle}>
            <ListItemIcon>
              {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary="Theme" />
            <Switch edge="end" checked={isDarkMode} onChange={handleThemeToggle} size="small" />
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>

        <NotificationsMenu
          anchorEl={notificationAnchorEl}
          onClose={handleNotificationsClose}
          notifications={notifications}
          loading={notificationsLoading}
          error={notificationsError}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearAll={clearAll}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
