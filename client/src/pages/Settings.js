import React, { useState } from 'react';
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
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    reminderTime: 'morning',
    habitDuration: '5',
  });

  const handleSettingChange = (setting) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: event.target.checked !== undefined ? event.target.checked : event.target.value,
    }));
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
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={handleSettingChange('pushNotifications')}
                />
              }
              label="Push Notifications"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleSettingChange('darkMode')}
                />
              }
              label="Dark Mode"
            />
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
    </Box>
  );
};

export default Settings; 