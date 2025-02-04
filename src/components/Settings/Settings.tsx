import React from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Games as GamesIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <PersonIcon />,
          label: 'Profile Settings',
          path: '/settings/profile',
        },
        {
          icon: <SecurityIcon />,
          label: 'Security & Privacy',
          path: '/settings/security',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <NotificationsIcon />,
          label: 'Notifications',
          path: '/settings/notifications',
        },
        {
          icon: <ThemeIcon />,
          label: 'Theme & Display',
          path: '/settings/theme',
        },
        {
          icon: <LanguageIcon />,
          label: 'Language',
          path: '/settings/language',
        },
      ],
    },
    {
      title: 'Gaming',
      items: [
        {
          icon: <GamesIcon />,
          label: 'Game Preferences',
          path: '/settings/games',
        },
      ],
    },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {settingsSections.map((section, index) => (
          <Box key={section.title} sx={{ mb: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              {section.title}
            </Typography>
            <List>
              {section.items.map(item => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton onClick={() => navigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {index < settingsSections.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Settings; 