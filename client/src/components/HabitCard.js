import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  NoteAdd as NoteAddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, isToday, isSameDay } from 'date-fns';

const MotionCard = motion(Card);

const HabitCard = ({
  habit,
  onEdit,
  onDelete,
  onComplete,
  onAddNote,
  streak,
  progress,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [note, setNote] = useState('');

  // Calculate progress if not provided
  const calculatedProgress = progress || (() => {
    try {
      if (!habit.progress || !Array.isArray(habit.progress)) return 0;
      const totalDays = habit.progress.length;
      const completedDays = habit.progress.filter(p => {
        if (!p || typeof p !== 'object') return false;
        return p.completed === true || p.completed === 'true';
      }).length;
      return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  })();

  // Calculate streak if not provided
  const calculatedStreak = streak || habit.streak || 0;

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(habit);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(habit._id);
  };

  const handleComplete = () => {
    onComplete(habit._id);
  };

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(habit, note);
      setNote('');
      setNoteDialogOpen(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return theme.palette.success.main;
    if (progress >= 70) return theme.palette.info.main;
    if (progress >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return theme.palette.success.main;
    if (streak >= 7) return theme.palette.info.main;
    return theme.palette.warning.main;
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Not set';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      
      if (!time) {
        return format(dateObj, 'MMM d, yyyy');
      }
      
      // Handle time in HH:mm format
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return format(dateObj, 'MMM d, yyyy');
      }
      
      dateObj.setHours(hours, minutes, 0, 0);
      
      if (isToday(dateObj)) {
        return `Today at ${format(dateObj, 'h:mm a')}`;
      } else {
        return format(dateObj, 'MMM d, yyyy h:mm a');
      }
    } catch (error) {
      console.error('Error formatting date/time:', error);
      return 'Invalid date/time';
    }
  };

  const getNotificationStatus = () => {
    if (!habit.notifications) return { start: false, end: false };
    
    return {
      start: habit.notifications.startEnabled,
      end: habit.notifications.endEnabled,
    };
  };

  const notificationStatus = getNotificationStatus();

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      sx={{
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {habit.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {habit.description}
            </Typography>
          </Box>
          <IconButton onClick={handleMenuClick} size="small">
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                minWidth: 120,
                borderRadius: 2,
              },
            }}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              setNoteDialogOpen(true);
            }}>
              <NoteAddIcon fontSize="small" sx={{ mr: 1 }} />
              Add Note
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
          {habit.tags && habit.tags.map((tag) => (
            <Chip
              key={tag}
              size="small"
              label={tag}
              variant="outlined"
            />
          ))}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {calculatedProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculatedProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(calculatedProgress),
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            Schedule
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Start: {formatDateTime(habit.startDate, habit.startTime)}
              </Typography>
              {notificationStatus.start && (
                <Tooltip title="Start notification enabled">
                  <NotificationsIcon fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                End: {formatDateTime(habit.endDate, habit.endTime)}
              </Typography>
              {notificationStatus.end && (
                <Tooltip title={`End notification enabled (${habit.notifications?.endReminderMinutes || 5} min before)`}>
                  <NotificationsIcon fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Current Streak">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FireIcon sx={{ color: getStreakColor(calculatedStreak) }} />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {calculatedStreak} days
                </Typography>
              </Box>
            </Tooltip>
            {habit.streakGoal && (
              <Tooltip title="Streak Goal">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrophyIcon sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {habit.streakGoal} days
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<CheckCircleIcon />}
          onClick={handleComplete}
        >
          Complete Today
        </Button>
      </CardActions>

      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">
            Save Note
          </Button>
        </DialogActions>
      </Dialog>
    </MotionCard>
  );
};

export default HabitCard; 