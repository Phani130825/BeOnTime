import React from 'react';
import { Box, Typography } from '@mui/material';
import HabitList from '../components/HabitList';

const Dashboard = () => {
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