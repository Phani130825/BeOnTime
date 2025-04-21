import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const Calendar = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHabits();
    }
  }, [isAuthenticated, user]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/habits');
      const habits = response.data;

      // Transform habits into calendar events
      const calendarEvents = habits.map(habit => {
        const startDate = new Date(habit.startDate);
        const [hours, minutes] = habit.startTime?.split(':').map(Number) || [0, 0];
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = habit.endDate ? new Date(habit.endDate) : new Date(startDate);
        const [endHours, endMinutes] = habit.endTime?.split(':').map(Number) || [hours + 1, minutes];
        endDate.setHours(endHours, endMinutes, 0, 0);

        // Check if the habit is completed today
        const isCompletedToday = habit.completionHistory?.some(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === new Date().toDateString() && entry.completed;
        });

        // Set different colors based on completion status and date
        let backgroundColor = '#2196f3'; // Default blue for upcoming habits
        if (isCompletedToday) {
          backgroundColor = '#4caf50'; // Green for completed habits
        } else if (startDate < new Date()) {
          backgroundColor = '#f44336'; // Red for overdue habits
        }

        return {
          id: habit._id,
          title: habit.title,
          start: startDate,
          end: endDate,
          allDay: false,
          backgroundColor,
          borderColor: 'transparent',
          textColor: '#ffffff',
          extendedProps: {
            description: habit.description,
            category: habit.category,
            streak: habit.streak,
            progress: habit.progress,
            isCompleted: isCompletedToday
          }
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err.response?.data?.message || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Please login to view your calendar
        </Alert>
      </Box>
    );
  }

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
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Your Habits Calendar
        </Typography>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={(info) => {
            console.log('Event clicked:', info.event);
          }}
          height="auto"
        />
      </Paper>
    </Box>
  );
};

export default Calendar; 