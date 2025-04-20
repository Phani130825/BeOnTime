import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  Chip,
  FormControlLabel,
  Switch,
  Slider,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { format } from 'date-fns';

const predefinedHabits = [
  {
    id: 'exercise',
    title: 'Daily Exercise',
    description: '30 minutes of physical activity',
    category: 'Health',
    frequency: 'Daily',
    targetDays: 7,
    startTime: '09:00',
    notifications: {
      enabled: true,
      time: '09:00'
    }
  },
  {
    id: 'meditation',
    title: 'Meditation',
    description: '10 minutes of mindfulness practice',
    category: 'Self-Care',
    frequency: 'Daily',
    targetDays: 7,
    startTime: '08:00',
    notifications: {
      enabled: true,
      time: '08:00'
    }
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Read for 20 minutes',
    category: 'Learning',
    frequency: 'Daily',
    targetDays: 7,
    startTime: '20:00',
    notifications: {
      enabled: true,
      time: '20:00'
    }
  },
  {
    id: 'water',
    title: 'Water Intake',
    description: 'Drink 8 glasses of water',
    category: 'Health',
    frequency: 'Daily',
    targetDays: 7,
    startTime: '10:00',
    notifications: {
      enabled: true,
      time: '10:00'
    }
  },
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Write in your journal',
    category: 'Self-Care',
    frequency: 'Daily',
    targetDays: 7,
    startTime: '21:00',
    notifications: {
      enabled: true,
      time: '21:00'
    }
  },
  {
    id: 'language',
    title: 'Language Learning',
    description: 'Practice a new language',
    category: 'Learning',
    frequency: 'Daily',
    targetDays: 5,
    startTime: '18:00',
    notifications: {
      enabled: true,
      time: '18:00'
    }
  }
];

const categories = [
  { value: 'Health', label: 'Health' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'Self-Care', label: 'Self-Care' },
  { value: 'Learning', label: 'Learning' },
  { value: 'Other', label: 'Other' }
];

const frequencies = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' }
];

const HabitForm = ({ open, onClose, onSave, habit = null }) => {
  const theme = useTheme();
  const [isCustom, setIsCustom] = useState(habit ? true : false);
  const [selectedPredefined, setSelectedPredefined] = useState('');
  const [formData, setFormData] = useState({
    title: habit?.title || '',
    description: habit?.description || '',
    category: habit?.category || 'Health',
    frequency: habit?.frequency || 'Daily',
    targetDays: habit?.targetDays || 7,
    startDate: habit?.startDate ? new Date(habit.startDate) : new Date(),
    startTime: habit?.startTime ? new Date(`2000-01-01T${habit.startTime}`) : null,
    endDate: habit?.endDate ? new Date(habit.endDate) : null,
    endTime: habit?.endTime ? new Date(`2000-01-01T${habit.endTime}`) : null,
    notifications: {
      enabled: habit?.notifications?.enabled ?? true,
      time: habit?.notifications?.time || null
    },
    tags: habit?.tags || [],
    streakGoal: habit?.streakGoal || 30,
    notes: habit?.notes || ''
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        category: habit.category || 'Health',
        frequency: habit.frequency || 'Daily',
        targetDays: habit.targetDays || 7,
        startDate: habit.startDate ? new Date(habit.startDate) : new Date(),
        startTime: habit.startTime ? new Date(`2000-01-01T${habit.startTime}`) : null,
        endDate: habit.endDate ? new Date(habit.endDate) : null,
        endTime: habit.endTime ? new Date(`2000-01-01T${habit.endTime}`) : null,
        notifications: {
          enabled: habit.notifications?.enabled ?? true,
          time: habit.notifications?.time || null
        },
        tags: habit.tags || [],
        streakGoal: habit.streakGoal || 30,
        notes: habit.notes || ''
      });
    }
  }, [habit]);

  const handlePredefinedSelect = (habitId) => {
    const habit = predefinedHabits.find((h) => h.id === habitId);
    if (habit) {
      setSelectedPredefined(habitId);
      setFormData({
        ...formData,
        title: habit.title,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        targetDays: habit.targetDays,
        startTime: habit.startTime ? new Date(`2000-01-01T${habit.startTime}`) : null,
        notifications: {
          enabled: habit.notifications?.enabled ?? true,
          time: habit.notifications?.time || null
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: value
      }
    }));
  };

  const handleStartDateChange = (newValue) => {
    setFormData(prev => ({ ...prev, startDate: newValue }));
  };

  const handleStartTimeChange = (newValue) => {
    setFormData(prev => ({ ...prev, startTime: newValue }));
  };

  const handleEndDateChange = (newValue) => {
    setFormData(prev => ({ ...prev, endDate: newValue }));
  };

  const handleEndTimeChange = (newValue) => {
    setFormData(prev => ({ ...prev, endTime: newValue }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate end time is after start time if both are set
      if (formData.startTime && formData.endTime) {
        const startDateTime = new Date();
        startDateTime.setHours(formData.startTime.getHours());
        startDateTime.setMinutes(formData.startTime.getMinutes());
        
        const endDateTime = new Date();
        endDateTime.setHours(formData.endTime.getHours());
        endDateTime.setMinutes(formData.endTime.getMinutes());
        
        if (endDateTime <= startDateTime) {
          alert('End time must be after start time');
          return;
        }
      }

      const habitData = {
        ...formData,
        notes: Array.isArray(formData.notes) ? 
          formData.notes : 
          (formData.notes && formData.notes.trim() ? 
            [{ content: formData.notes.trim(), createdAt: new Date() }] : 
            []),
        startTime: formData.startTime ? format(formData.startTime, 'HH:mm') : null,
        endTime: formData.endTime ? format(formData.endTime, 'HH:mm') : null,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null
      };
      
      if (habit) {
        await onSave(habit._id, habitData);
      } else {
        await onSave(habitData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {!habit && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Choose a habit type:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={!isCustom ? 'contained' : 'outlined'}
                  onClick={() => setIsCustom(false)}
                  startIcon={<CategoryIcon />}
                >
                  Predefined Habits
                </Button>
                <Button
                  variant={isCustom ? 'contained' : 'outlined'}
                  onClick={() => setIsCustom(true)}
                  startIcon={<AddIcon />}
                >
                  Custom Habit
                </Button>
              </Box>
            </Box>
          )}

          {!isCustom && !habit && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {predefinedHabits.map((habit) => (
                <Grid item xs={12} sm={6} md={4} key={habit.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedPredefined === habit.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                    onClick={() => handlePredefinedSelect(habit.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {habit.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {habit.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          size="small"
                          label={habit.category}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={habit.frequency}
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Habit Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  label="Frequency"
                >
                  {frequencies.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom>
                  Target Days per {formData.frequency}
                  <Tooltip title="Number of days you want to complete this habit in the selected frequency period">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Slider
                  value={formData.targetDays}
                  onChange={(e, newValue) =>
                    setFormData({ ...formData, targetDays: newValue })
                  }
                  min={1}
                  max={formData.frequency === 'daily' ? 7 : formData.frequency === 'weekly' ? 7 : 31}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom>
                  Streak Goal
                  <Tooltip title="Number of consecutive days you want to maintain this habit">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Slider
                  value={formData.streakGoal}
                  onChange={(e, newValue) =>
                    setFormData({ ...formData, streakGoal: newValue })
                  }
                  min={7}
                  max={365}
                  step={7}
                  marks={[
                    { value: 7, label: '7d' },
                    { value: 30, label: '30d' },
                    { value: 90, label: '90d' },
                    { value: 180, label: '180d' },
                    { value: 365, label: '365d' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications.enabled}
                      onChange={handleReminderChange}
                    />
                  }
                  label="Enable Reminder"
                />
                <AccessTimeIcon color="action" />
              </Box>
              {formData.notifications.enabled && (
                <TimePicker
                  label="Reminder Time"
                  value={formData.notifications.time}
                  onChange={(newValue) => handleReminderChange('time', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="primary" />
            Schedule
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={handleStartTimeChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={formData.startDate}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={handleEndTimeChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" />
              Notifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications.enabled}
                      onChange={(e) => handleReminderChange('enabled', e.target.checked)}
                    />
                  }
                  label="Notify at start time"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications.endEnabled}
                      onChange={(e) => handleReminderChange('endEnabled', e.target.checked)}
                    />
                  }
                  label="Notify before end time"
                />
              </Grid>
              {formData.notifications.endEnabled && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">Remind me</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={formData.notifications.endReminderMinutes}
                      onChange={(e) => handleReminderChange('endReminderMinutes', parseInt(e.target.value) || 5)}
                      inputProps={{ min: 1, max: 60 }}
                      sx={{ width: 80 }}
                    />
                    <Typography variant="body2">minutes before end time</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.title}
          >
            {habit ? 'Update Habit' : 'Create Habit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HabitForm; 