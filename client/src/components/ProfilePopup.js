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
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../config/api';
import { format, parseISO } from 'date-fns';

const MotionBox = motion(Box);

const ProfilePopup = ({ open, onClose }) => {
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
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
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
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto 20px',
                      fontSize: '3rem',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    }}
                  >
                    {userData?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {userData?.username || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {userData?.email || 'No email provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {formatDate(userData?.createdAt)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Habit Statistics</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h4">{stats.totalHabits}</Typography>
                        <Typography variant="body2">Total Habits</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h4">{stats.completedHabits}</Typography>
                        <Typography variant="body2">Completed</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h4">{stats.currentStreak}</Typography>
                        <Typography variant="body2">Current Streak</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
                          color: 'white',
                        }}
                      >
                        <Typography variant="h4">{stats.longestStreak}</Typography>
                        <Typography variant="body2">Longest Streak</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ mt: 3 }}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6">Account Settings</Typography>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(!editMode)}
                        variant="outlined"
                      >
                        {editMode ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </Box>

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
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
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
                              startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
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
                              Save Changes
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </form>

                    <Divider sx={{ my: 3 }} />

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
                              startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
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
                              startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
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
                              startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
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
                            Change Password
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfilePopup; 