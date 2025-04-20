import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import HabitList from '../components/HabitList';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Please login to view your dashboard
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <HabitList />
    </Box>
  );
};

export default Dashboard; 