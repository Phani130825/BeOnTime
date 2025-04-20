import React, { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  LightMode as SunIcon,
  DarkMode as MoonIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProfilePopup from './ProfilePopup';
import NotificationIcon from './NotificationIcon';

const AppBar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setProfileOpen(true);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <>
      <MuiAppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleTheme}
                  sx={{ mr: 1 }}
                >
                  {isDarkMode ? <MoonIcon /> : <SunIcon />}
                </IconButton>
              </Tooltip>
              
              <NotificationIcon />
              <IconButton
                color="inherit"
                onClick={handleProfileClick}
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={user.profilePicture}
                  alt={user.username}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 2,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="inherit"
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </MuiAppBar>

      <ProfilePopup open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default AppBar; 