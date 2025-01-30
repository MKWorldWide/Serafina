import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

  const isHomePage = location.pathname === '/';
  const showTransparentNav = isHomePage && !isScrolled;

  // Don't show navbar on home page when not authenticated
  if (location.pathname === '/' && !isAuthenticated) {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      elevation={showTransparentNav ? 0 : 4}
      sx={{
        backgroundColor: showTransparentNav
          ? 'transparent'
          : 'rgba(22, 22, 22, 0.95)',
        backdropFilter: showTransparentNav ? 'none' : 'blur(10px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 2 } }}>
          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            GameDin
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => navigate('/about')}
              sx={{ color: '#fff' }}
            >
              About
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/token')}
              sx={{ color: '#fff' }}
            >
              Token
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/feed')}
                  sx={{ color: '#fff' }}
                >
                  Feed
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/profile')}
                  sx={{ color: '#fff' }}
                >
                  Profile
                </Button>
                <Button
                  variant="contained"
                  onClick={logout}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: '#fff',
                    color: '#fff',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: 'rgba(22, 22, 22, 0.95)',
                  backdropFilter: 'blur(10px)',
                  marginTop: '8px',
                },
              }}
            >
              <MenuItem onClick={() => { navigate('/about'); handleClose(); }}>
                About
              </MenuItem>
              <MenuItem onClick={() => { navigate('/token'); handleClose(); }}>
                Token
              </MenuItem>
              {isAuthenticated ? (
                [
                  <MenuItem key="feed" onClick={() => { navigate('/feed'); handleClose(); }}>
                    Feed
                  </MenuItem>,
                  <MenuItem key="profile" onClick={() => { navigate('/profile'); handleClose(); }}>
                    Profile
                  </MenuItem>,
                  <MenuItem key="logout" onClick={() => { logout(); handleClose(); }}>
                    Logout
                  </MenuItem>,
                ]
              ) : (
                [
                  <MenuItem key="login" onClick={() => { navigate('/login'); handleClose(); }}>
                    Sign In
                  </MenuItem>,
                  <MenuItem key="register" onClick={() => { navigate('/register'); handleClose(); }}>
                    Get Started
                  </MenuItem>,
                ]
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
