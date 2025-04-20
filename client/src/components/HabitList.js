import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import { format, isToday, isSameDay, isBefore, isAfter, addMinutes, subMinutes } from 'date-fns';
import api from '../config/api';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const HabitList = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTab, setSelectedTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch habits from API
  const fetchHabits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/api/habits');
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setHabits(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching habits:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to fetch habits. Please try again later.';
      if (err.response?.status === 401) {
        errorMessage = 'Please login again to continue';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(habits.map(habit => habit.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [habits]);

  // Check for notifications every minute
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      
      habits.forEach(habit => {
        if (!habit.notifications) return;
        
        // Create date objects for start and end times
        const startDate = new Date(habit.startDate);
        const startTime = new Date(habit.startTime);
        startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
        
        const endDate = new Date(habit.endDate);
        const endTime = new Date(habit.endTime);
        endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
        
        // Check for start notification
        if (habit.notifications.startEnabled && 
            isSameDay(startDate, now) && 
            Math.abs(startDate - now) < 60000) { // Within 1 minute
          setNotification({
            type: 'info',
            message: `It's time to start your habit: ${habit.title}`,
          });
        }
        
        // Check for end notification
        if (habit.notifications.endEnabled) {
          const reminderTime = subMinutes(endDate, habit.notifications.endReminderMinutes || 5);
          
          if (isSameDay(reminderTime, now) && 
              Math.abs(reminderTime - now) < 60000) { // Within 1 minute
            setNotification({
              type: 'warning',
              message: `${habit.title} will end in ${habit.notifications.endReminderMinutes || 5} minutes`,
            });
          }
        }
      });
    };
    
    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Initial check
    
    return () => clearInterval(interval);
  }, [habits]);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const filteredAndSortedHabits = useMemo(() => {
    let result = [...habits];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(habit =>
        habit.title.toLowerCase().includes(query) ||
        habit.description.toLowerCase().includes(query) ||
        (habit.tags && habit.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(habit => habit.category === categoryFilter);
    }

    // Apply tab filter
    const now = new Date();
    if (selectedTab === 1) { // Today's Tasks
      result = result.filter(habit => {
        // Check if habit is active today
        const startDate = new Date(habit.startDate);
        const endDate = habit.endDate ? new Date(habit.endDate) : null;
        
        // If habit has no end date, it's ongoing
        if (!endDate) {
          return isSameDay(startDate, now) || isBefore(startDate, now);
        }
        
        // If habit has an end date, check if today is between start and end dates
        return (isSameDay(startDate, now) || isBefore(startDate, now)) && 
               (isSameDay(endDate, now) || isAfter(endDate, now));
      });
    } else if (selectedTab === 2) { // Completed
      result = result.filter(habit => {
        // Check if habit has any completion records for today
        return habit.completions && habit.completions.some(completion => 
          isSameDay(new Date(completion.date), now)
        );
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'streak':
          comparison = (a.streak || 0) - (b.streak || 0);
          break;
        case 'progress':
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case 'startTime':
          if (!a.startDate || !a.startTime || !b.startDate || !b.startTime) {
            return 0;
          }
          const aStart = new Date(a.startDate);
          aStart.setHours(new Date(a.startTime).getHours(), new Date(a.startTime).getMinutes(), 0, 0);
          const bStart = new Date(b.startDate);
          bStart.setHours(new Date(b.startTime).getHours(), new Date(b.startTime).getMinutes(), 0, 0);
          comparison = aStart - bStart;
          break;
        case 'createdAt':
        default:
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [habits, searchQuery, categoryFilter, sortBy, sortOrder, selectedTab]);

  const handleAddHabit = async (habitData) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await api.post('/api/habits', habitData);
      setHabits(prev => [response.data, ...prev]);
      setIsFormOpen(false);
      setNotification({
        type: 'success',
        message: 'Habit created successfully!',
      });
    } catch (err) {
      console.error('Error adding habit:', err);
      let errorMessage = 'Failed to create habit. Please try again.';
      
      if (err.response?.data) {
        const { message, code, details } = err.response.data;
        errorMessage = message;
        
        // Handle specific error codes
        switch (code) {
          case 'MISSING_FIELDS':
            errorMessage = `Please fill in all required fields: ${details}`;
            break;
          case 'INVALID_CATEGORY':
            errorMessage = 'Please select a valid category';
            break;
          case 'INVALID_FREQUENCY':
            errorMessage = 'Please select a valid frequency';
            break;
          case 'INVALID_TARGET_DAYS':
            errorMessage = 'Target days must be at least 1';
            break;
          case 'INVALID_START_DATE':
          case 'INVALID_END_DATE':
            errorMessage = 'Please enter a valid date in YYYY-MM-DD format';
            break;
          case 'INVALID_START_TIME':
          case 'INVALID_END_TIME':
            errorMessage = 'Please enter a valid time in HH:mm format';
            break;
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleUpdateHabit = async (id, updates) => {
    try {
      const response = await api.patch(`/api/habits/${id}`, updates);
      setHabits(habits.map(habit => 
        habit._id === id ? response.data : habit
      ));
      setEditingHabit(null);
      setIsFormOpen(false);
      setNotification({
        type: 'success',
        message: 'Habit updated successfully!',
      });
    } catch (err) {
      console.error('Error updating habit:', err);
      console.error('Error response:', err.response?.data);
      let errorMessage = 'Failed to update habit. Please try again.';
      
      if (err.response?.data) {
        const { message, code, details } = err.response.data;
        errorMessage = message;
        
        // Handle specific error codes
        switch (code) {
          case 'INVALID_CATEGORY':
            errorMessage = 'Please select a valid category';
            break;
          case 'INVALID_FREQUENCY':
            errorMessage = 'Please select a valid frequency';
            break;
          case 'INVALID_TARGET_DAYS':
            errorMessage = 'Target days must be at least 1';
            break;
          case 'INVALID_START_DATE':
          case 'INVALID_END_DATE':
            errorMessage = 'Please enter a valid date in YYYY-MM-DD format';
            break;
          case 'INVALID_START_TIME':
          case 'INVALID_END_TIME':
            errorMessage = 'Please enter a valid time in HH:mm format';
            break;
        }
      }
      
      setNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await api.delete(`/api/habits/${id}`);
      setHabits(habits.filter(habit => habit._id !== id));
      setNotification({
        type: 'success',
        message: 'Habit deleted successfully!',
      });
    } catch (err) {
      setError('Failed to delete habit. Please try again.');
      console.error('Error deleting habit:', err);
      setNotification({
        type: 'error',
        message: 'Failed to delete habit. Please try again.',
      });
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const response = await api.post(`/api/habits/${habitId}/complete`);
      setHabits(habits.map(habit => 
        habit._id === habitId ? { ...habit, ...response.data } : habit
      ));
      toast.success('Habit completed successfully!');
    } catch (error) {
      console.error('Error completing habit:', error);
      if (error.response?.data?.code === 'ALREADY_COMPLETED') {
        toast.error('You have already completed this habit today');
      } else {
        toast.error(error.response?.data?.message || 'Failed to complete habit');
      }
    }
  };

  const handleAddNote = async (habit, content) => {
    try {
      const response = await api.post(`/api/habits/${habit._id}/notes`, { text: content });
      setHabits(habits.map(h => 
        h._id === habit._id ? response.data : h
      ));
      setNotification({
        type: 'success',
        message: 'Note added successfully!',
      });
    } catch (err) {
      console.error('Error adding note:', err);
      setNotification({
        type: 'error',
        message: 'Failed to add note. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchHabits}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Habits
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="streak">Streak</MenuItem>
                <MenuItem value="progress">Progress</MenuItem>
                <MenuItem value="startTime">Start Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tooltip title="Add New Habit">
              <IconButton
                color="primary"
                onClick={() => setIsFormOpen(true)}
                sx={{ width: '100%', height: 56, border: `1px solid ${theme.palette.primary.main}` }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Habits" />
          <Tab label="Today's Tasks" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {filteredAndSortedHabits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No habits found. Create your first habit to get started!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
            sx={{ mt: 2 }}
          >
            Add Habit
          </Button>
        </Box>
      ) : (
        <AnimatePresence>
          <Grid container spacing={3}>
            {filteredAndSortedHabits.map((habit) => (
              <Grid item xs={12} sm={6} md={4} key={habit._id}>
                <HabitCard
                  habit={habit}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onComplete={handleCompleteHabit}
                  onAddNote={handleAddNote}
                  streak={habit.streak || 0}
                  progress={habit.progress || 0}
                />
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>
      )}

      <HabitForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={editingHabit ? handleUpdateHabit : handleAddHabit}
        habit={editingHabit}
      />

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HabitList; 