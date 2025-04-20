import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { LightMode as SunIcon, DarkMode as MoonIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import api from '../config/api';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reminderTime: 'morning',
    habitDuration: '5',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get('/api/notifications/preferences');
      setSettings(prev => ({
        ...prev,
        emailNotifications: response.data.email,
      }));
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      showSnackbar('Error loading notification preferences', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSettingChange = (setting) => async (event) => {
    const newValue = event.target.checked !== undefined ? event.target.checked : event.target.value;
    
    setSettings((prev) => ({
      ...prev,
      [setting]: newValue,
    }));

    if (setting === 'emailNotifications') {
      try {
        await api.patch('/api/notifications/preferences', {
          email: newValue,
        });
        showSnackbar('Notification preferences updated successfully');
      } catch (error) {
        console.error('Error updating notification preferences:', error);
        showSnackbar('Error updating notification preferences', 'error');
        // Revert the change on error
        setSettings((prev) => ({
          ...prev,
          [setting]: !newValue,
        }));
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Theme Mode
            </Typography>
            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton 
                onClick={toggleTheme} 
                color="primary"
                sx={{ 
                  backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(144, 202, 249, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                  }
                }}
              >
                {isDarkMode ? <MoonIcon /> : <SunIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Habit Settings
          </Typography>
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Reminder Time</InputLabel>
              <Select
                value={settings.reminderTime}
                label="Reminder Time"
                onChange={handleSettingChange('reminderTime')}
              >
                <MenuItem value="morning">Morning (7:00 AM)</MenuItem>
                <MenuItem value="afternoon">Afternoon (2:00 PM)</MenuItem>
                <MenuItem value="evening">Evening (7:00 PM)</MenuItem>
                <MenuItem value="custom">Custom Time</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Default Habit Duration</InputLabel>
              <Select
                value={settings.habitDuration}
                label="Default Habit Duration"
                onChange={handleSettingChange('habitDuration')}
              >
                <MenuItem value="5">5 minutes</MenuItem>
                <MenuItem value="10">10 minutes</MenuItem>
                <MenuItem value="15">15 minutes</MenuItem>
                <MenuItem value="20">20 minutes</MenuItem>
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="45">45 minutes</MenuItem>
                <MenuItem value="60">1 hour</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 