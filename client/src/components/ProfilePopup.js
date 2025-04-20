import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Divider,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../config/api';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

const MotionBox = motion(Box);

const ProfilePopup = ({ open, onClose }) => {
  const { logout } = useAuth();
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedHabits: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/profile');
      if (response.data && response.data.user) {
        setUserData(response.data.user);
        setStats(response.data.stats || {
          totalHabits: 0,
          completedHabits: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
        setFormData({
          username: response.data.user.username || '',
          email: response.data.user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put('/api/users/profile', {
        username: formData.username,
        email: formData.email,
      });
      if (response.data && response.data.user) {
        setUserData(response.data.user);
        setEditMode(false);
        setSuccess('Profile updated successfully');
        fetchUserData();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setError(null);
      setSuccess('Password changed successfully');
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'MMMM yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: isDarkMode 
              ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)' 
              : 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="div">
              Profile
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={userData?.profilePicture}
                    alt={userData?.username}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      border: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    {userData?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Typography variant="h6">{userData?.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userData?.email}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(!editMode)}
                    sx={{ mt: 2 }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Account Stats
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Total Habits"
                        secondary={stats.totalHabits}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Completed Habits"
                        secondary={stats.completedHabits}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Current Streak"
                        secondary={`${stats.currentStreak} days`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Longest Streak"
                        secondary={`${stats.longestStreak} days`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>
                  <form onSubmit={handleUpdateProfile}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          InputProps={{
                            startAdornment: (
                              <PersonIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          InputProps={{
                            startAdornment: (
                              <EmailIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Member Since"
                          value={formatDate(userData?.createdAt)}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <CalendarIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      {editMode && (
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </form>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mt: 3,
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <form onSubmit={handleChangePassword}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: (
                              <LockIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: (
                              <LockIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: (
                              <LockIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Change Password'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfilePopup; 