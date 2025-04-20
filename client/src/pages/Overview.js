import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
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
  const theme = useTheme();
  
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

  // Sample data for the chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Habits Completed',
        data: [4, 6, 5, 8, 7, 6, 8],
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
            value="42"
            label="Habits Completed"
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FireIcon sx={{ fontSize: 40, color: 'warning.main' }} />}
            value="7"
            label="Day Streak"
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />}
            value="5"
            label="Active Habits"
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
            value="85%"
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
              {[
                { name: 'Morning Exercise', time: '7:00 AM', status: 'Completed' },
                { name: 'Reading', time: '8:30 PM', status: 'Pending' },
                { name: 'Meditation', time: '10:00 AM', status: 'Completed' },
              ].map((habit) => (
                <Box
                  key={habit.name}
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
                    <Typography variant="subtitle1">{habit.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {habit.time}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        habit.status === 'Completed'
                          ? 'success.main'
                          : 'warning.main',
                    }}
                  >
                    {habit.status}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                {
                  message: "You've completed 5 days streak!",
                  time: '2 hours ago',
                  type: 'success',
                },
                {
                  message: 'New habit suggestion: Morning Meditation',
                  time: '5 hours ago',
                  type: 'info',
                },
                {
                  message: 'Reminder: Complete your daily reading habit',
                  time: '1 hours ago',
                  type: 'warning',
                },
              ].map((notification, index) => (
                <Box
                  key={index}
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
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 