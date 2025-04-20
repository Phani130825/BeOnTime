import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../config/api';

import { format, subDays, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ icon, value, label, color }) => {
  
  
  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Overview = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTodayHabits();
    fetchNotifications();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user statistics
      const statsResponse = await api.get('/api/users/profile');
      setStats(statsResponse.data.stats);

      // Fetch habits for completion history
      const habitsResponse = await api.get('/api/habits');
      const habits = habitsResponse.data;

      // Calculate completion history for the last 7 days
      const history = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const completedCount = habits.filter(habit => 
          habit.completionHistory?.some(entry => 
            new Date(entry.date).toDateString() === date.toDateString() && entry.completed
          )
        ).length;
        history.push({
          date: format(date, 'EEE'),
          count: completedCount
        });
      }
      setCompletionHistory(history);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayHabits = async () => {
    try {
      const response = await api.get('/api/habits/today');
      setTodayHabits(response.data);
    } catch (err) {
      console.error('Error fetching today\'s habits:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications.slice(0, 3)); // Get only the 3 most recent notifications
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatNotificationTime = (dateString) => {
    try {
      if (!dateString) return '';
      const date = parseISO(dateString);
      return format(date, 'MMM d, h:mm a');
    } catch (error) {
      console.error('Error formatting notification time:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const chartData = {
    labels: completionHistory.map(item => item.date),
    datasets: [
      {
        label: 'Habits Completed',
        data: completionHistory.map(item => item.count),
        fill: false,
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Habit Completion',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />}
            value={stats?.completedHabits || 0}
            label="Habits Completed"
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FireIcon sx={{ fontSize: 40, color: 'warning.main' }} />}
            value={stats?.currentStreak || 0}
            label="Day Streak"
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            value={stats?.totalHabits || 0}
            label="Active Habits"
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
            value={`${stats?.progress || 0}%`}
            label="Completion Rate"
            color="primary.main"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Line data={chartData} options={chartOptions} />
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Today's Habits
            </Typography>
            <Box sx={{ mt: 2 }}>
              {todayHabits.length > 0 ? (
                todayHabits.map((habit) => {
                  const isCompleted = habit.completionHistory?.some(entry => 
                    new Date(entry.date).toDateString() === new Date().toDateString() && entry.completed
                  );
                  return (
                    <Box
                      key={habit._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1">{habit.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(habit.startTime)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isCompleted ? 'success.main' : 'warning.main',
                        }}
                      >
                        {isCompleted ? 'Completed' : 'Pending'}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No habits scheduled for today
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <Box sx={{ mt: 2 }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Box
                    key={notification._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      py: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <NotificationsIcon
                      sx={{
                        mr: 2,
                        color: `${notification.type}.main`,
                      }}
                    />
                    <Box>
                      <Typography variant="body1">{notification.message}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatNotificationTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent notifications
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 