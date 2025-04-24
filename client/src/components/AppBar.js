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
  Drawer,
  List,
  ListItem,
  ListItemIcon as MuiListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  LightMode as SunIcon,
  DarkMode as MoonIcon,
  Dashboard as DashboardIcon,
  FitnessCenter as HabitsIcon,
  CalendarToday as CalendarIcon,
  People as CommunityIcon,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import ProfilePopup from './ProfilePopup';
import NotificationIcon from './NotificationIcon';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Overview', icon: <HabitsIcon />, path: '/overview' },
  { text: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro' },
  { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
  { text: 'Community', icon: <CommunityIcon />, path: '/community' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const AppBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profileOpen, setProfileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();


  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfilePopupOpen = () => {
    setProfileOpen(true);
    handleMenuClose();
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 240,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary">
          BeOnTime
        </Typography>
      </Box>
      <Divider />
      <List>
        {isAuthenticated ? (
          <>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <MuiListItemIcon>{item.icon}</MuiListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <Divider />
            <ListItem button onClick={handleLogout}>
              <MuiListItemIcon><LogoutIcon /></MuiListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              button
              selected={location.pathname === '/login'}
              onClick={() => handleNavigation('/login')}
            >
              <MuiListItemIcon><LoginIcon /></MuiListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem
              button
              selected={location.pathname === '/register'}
              onClick={() => handleNavigation('/register')}
            >
              <MuiListItemIcon><PersonAddIcon /></MuiListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <MuiAppBar position="fixed">
        <Toolbar>
          {isMobile && isAuthenticated && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 700,
              mr: 2,
            }}
          >
            BeOnTime
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
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
                  src={user?.profilePicture}
                  alt={user?.username}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
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
                <MenuItem onClick={handleProfilePopupOpen}>
                  <ListItemIcon>
                    <Avatar
                      src={user?.profilePicture}
                      alt={user?.username}
                      sx={{ width: 24, height: 24 }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </ListItemIcon>
                  Profile
                </MenuItem>
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

      {isMobile && isAuthenticated && renderMobileMenu()}
      <ProfilePopup open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default AppBar; 