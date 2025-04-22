import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Slider,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

// Configure axios to use the correct base URL and default headers
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path
  : 'http://localhost:5000';  // In development, use local server
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add axios interceptor to handle auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add axios response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const Pomodoro = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [pomodorosCompleted, setPomodorosCompleted] = useState(() => {
    const saved = localStorage.getItem('pomodorosCompleted');
    return saved ? parseInt(saved) : 0;
  });
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('pomodoroSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings states
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  
  // Refs
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Initialize audio context on component mount
  useEffect(() => {
    // Create audio context with proper error handling
    try {
      // Create audio context only when needed (on user interaction)
      const initAudioContext = () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
      };
      
      // Add event listener to initialize audio context on first user interaction
      document.addEventListener('click', initAudioContext, { once: true });
      
      // Cleanup on unmount
      return () => {
        document.removeEventListener('click', initAudioContext);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };
    } catch (error) {
      console.warn('Error initializing audio context:', error);
    }
  }, []);
  
  // Play beep sound
  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        console.warn('Audio context not initialized');
        return;
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime); // Increased volume
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.5); // Longer sound
    } catch (error) {
      console.warn('Error playing beep sound:', error);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage with smooth animation
  const getProgress = () => {
    const totalTime = mode === 'work' 
      ? workDuration * 60 
      : mode === 'shortBreak' 
        ? shortBreakDuration * 60 
        : longBreakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Get color based on mode and progress
  const getProgressColor = () => {
    const progress = getProgress();
    if (mode === 'work') {
      if (progress < 33) return 'primary.main';
      if (progress < 66) return 'primary.light';
      return 'primary.dark';
    } else {
      if (progress < 33) return 'success.main';
      if (progress < 66) return 'success.light';
      return 'success.dark';
    }
  };
  
  // Start timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const startTime = Date.now();
      const initialTimeLeft = timeLeft;
      
      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const newTime = Math.max(0, initialTimeLeft - elapsedSeconds);
        
        setTimeLeft(newTime);
        
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          handleTimerComplete();
        }
      }, 100); // Update more frequently for smoother countdown
    }
  };
  
  // Pause timer
  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      // No need to update timeLeft here as it's already at the correct value
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(mode === 'work' 
      ? workDuration * 60 
      : mode === 'shortBreak' 
        ? shortBreakDuration * 60 
        : longBreakDuration * 60
    );
  };
  
  // Load sessions from server on component mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to use the Pomodoro timer');
          return;
        }

        const response = await axios.get('/api/pomodoro/daily-stats');
        const { totalPomodoros, sessions: dbSessions } = response.data;
        
        setPomodorosCompleted(totalPomodoros);
        setSessions(dbSessions.map(session => ({
          id: session._id,
          type: session.type,
          duration: session.duration,
          completedAt: new Date(session.completedAt)
        })));
      } catch (error) {
        console.error('Error loading pomodoro sessions:', error);
        if (error.response?.status === 401) {
          setError('Please log in to use the Pomodoro timer');
        } else if (error.response?.status === 404) {
          setError('Server endpoint not found. Please try again later.');
        } else {
          setError('Failed to load sessions. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessions();
  }, []);
  
  // Format date safely
  const formatDateSafely = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Unknown time';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };
  
  // Switch mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    clearInterval(timerRef.current);
    
    if (newMode === 'work') {
      setTimeLeft(workDuration * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setTimeLeft(longBreakDuration * 60);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Update timeLeft when settings change
  useEffect(() => {
    // Only reset time when mode or duration settings change, not when pausing
    if (mode === 'work') {
      setTimeLeft(workDuration * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setTimeLeft(longBreakDuration * 60);
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, mode]); // Removed isRunning from dependencies
  
  // Add effect to save data to localStorage
  useEffect(() => {
    localStorage.setItem('pomodorosCompleted', pomodorosCompleted.toString());
  }, [pomodorosCompleted]);

  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);

  // Add effect to check and reset daily data
  const checkAndResetDaily = async () => {
    const lastResetDate = localStorage.getItem('lastPomodoroResetDate');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      try {
        localStorage.setItem('lastPomodoroResetDate', today);
        
        const token = localStorage.getItem('token');
        await axios.post('/api/pomodoro/reset-daily', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Reset state
        setSessions([]);
        setPomodorosCompleted(0);
        
        console.log('Daily Pomodoro stats reset successfully');
      } catch (error) {
        console.error('Error resetting daily stats:', error);
      }
    }
  };

  useEffect(() => {
    checkAndResetDaily();
  }, []);
  
  // Handle timer completion with error handling
  const handleTimerComplete = async () => {
    // Play notification sound first
    playBeep();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to save your sessions');
      return;
    }

    if (mode === 'work') {
      // Create new session
      const newSession = {
        type: 'work',
        duration: workDuration,
        completedAt: new Date(),
      };

      try {
        setIsLoading(true);
        setError(null);
        const { data: savedSession } = await axios.post('/api/pomodoro/sessions', newSession);
        
        // Update state with server response
        setPomodorosCompleted(prev => prev + 1);
        setSessions(prev => [savedSession, ...prev]);
        
        // Check if it's time for a long break
        if ((pomodorosCompleted + 1) % longBreakInterval === 0) {
          setMode('longBreak');
          setTimeLeft(longBreakDuration * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(shortBreakDuration * 60);
        }
      } catch (error) {
        console.error('Error saving pomodoro session:', error);
        if (error.response?.status === 401) {
          setError('Please log in to save your sessions');
        } else {
          setError('Failed to save session. Your progress may not be tracked.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Create new break session
      const newSession = {
        type: mode,
        duration: mode === 'shortBreak' ? shortBreakDuration : longBreakDuration,
        completedAt: new Date(),
      };

      try {
        setIsLoading(true);
        setError(null);
        const { data: savedSession } = await axios.post('/api/pomodoro/sessions', newSession);
        
        // Update state with server response
        setSessions(prev => [savedSession, ...prev]);
        setMode('work');
        setTimeLeft(workDuration * 60);
      } catch (error) {
        console.error('Error saving break session:', error);
        if (error.response?.status === 401) {
          setError('Please log in to save your sessions');
        } else {
          setError('Failed to save break session. Your progress may not be tracked.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    setIsRunning(false);
  };
  
  // Load more sessions
  const loadMoreSessions = async () => {
    if (!hasMore || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      setError(null);
      const { data: { sessions: newSessions, hasMore: more } } = await axios.get(`/api/pomodoro/sessions?limit=50&skip=${page * 50}`);
      
      // Ensure each session has a unique ID and proper date handling
      const formattedSessions = newSessions.map(session => ({
        id: session._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: session.type,
        duration: session.duration,
        completedAt: new Date(session.completedAt)
      }));
      
      setSessions(prev => {
        // Filter out any potential duplicates based on ID
        const existingIds = new Set(prev.map(s => s.id));
        const uniqueNewSessions = formattedSessions.filter(s => !existingIds.has(s.id));
        return [...prev, ...uniqueNewSessions];
      });
      
      setHasMore(more);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more sessions:', error);
      setError('Failed to load more sessions. Please try again later.');
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Pomodoro Timer
      </Typography>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Timer Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              opacity: isLoading ? 0.7 : 1,
              pointerEvents: isLoading ? 'none' : 'auto',
            }}
          >
            {/* Mode Selection */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <Chip 
                label="Work" 
                color={mode === 'work' ? 'primary' : 'default'} 
                onClick={() => switchMode('work')}
                variant={mode === 'work' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Short Break" 
                color={mode === 'shortBreak' ? 'primary' : 'default'} 
                onClick={() => switchMode('shortBreak')}
                variant={mode === 'shortBreak' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Long Break" 
                color={mode === 'longBreak' ? 'primary' : 'default'} 
                onClick={() => switchMode('longBreak')}
                variant={mode === 'longBreak' ? 'filled' : 'outlined'}
              />
            </Box>
            
            {/* Timer Display */}
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
              <CircularProgress
                variant="determinate"
                value={getProgress()}
                size={isMobile ? 200 : 250}
                thickness={4}
                sx={{ 
                  color: getProgressColor(),
                  transition: 'color 0.3s ease-in-out',
                  '& .MuiCircularProgress-circle': {
                    transition: 'stroke-dashoffset 0.3s ease-in-out'
                  }
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography 
                  variant="h2" 
                  component="div" 
                  color="text.secondary"
                  sx={{
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out',
                    transform: isRunning ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    fontWeight: 'medium',
                    opacity: 0.8
                  }}
                >
                  {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </Typography>
                {isRunning && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      opacity: 0.6,
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    Time is running...
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Controls with improved styling */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
              <Button
                variant="contained"
                color={isRunning ? 'error' : 'primary'}
                startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
                onClick={isRunning ? pauseTimer : startTimer}
                size="large"
                sx={{
                  minWidth: 120,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={resetTimer}
                size="large"
                sx={{
                  minWidth: 120,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Reset
              </Button>
              <Tooltip title="Settings">
                <IconButton 
                  color={showSettings ? 'primary' : 'default'} 
                  onClick={() => setShowSettings(!showSettings)}
                  size="large"
                  sx={{
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'rotate(30deg)'
                    }
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Stats */}
            <Box sx={{ mt: 4, display: 'flex', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{pomodorosCompleted}</Typography>
                <Typography variant="body2" color="text.secondary">Pomodoros</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                  {sessions.filter(s => s.type === 'work').reduce((acc, curr) => acc + curr.duration, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Minutes Focused</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Settings and History Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            {showSettings ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Timer Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Work Duration (minutes)</Typography>
                  <Slider
                    value={workDuration}
                    onChange={(e, newValue) => setWorkDuration(newValue)}
                    min={1}
                    max={60}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Short Break Duration (minutes)</Typography>
                  <Slider
                    value={shortBreakDuration}
                    onChange={(e, newValue) => setShortBreakDuration(newValue)}
                    min={1}
                    max={30}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Long Break Duration (minutes)</Typography>
                  <Slider
                    value={longBreakDuration}
                    onChange={(e, newValue) => setLongBreakDuration(newValue)}
                    min={1}
                    max={60}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Long Break Interval (pomodoros)</Typography>
                  <Slider
                    value={longBreakInterval}
                    onChange={(e, newValue) => setLongBreakInterval(newValue)}
                    min={2}
                    max={8}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setWorkDuration(25);
                    setShortBreakDuration(5);
                    setLongBreakDuration(15);
                    setLongBreakInterval(4);
                  }}
                >
                  Reset to Defaults
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Session History
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  {sessions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No sessions completed yet
                    </Typography>
                  ) : (
                    <>
                      {sessions.map((session) => (
                        <ListItem key={session.id}>
                          <ListItemIcon>
                            {session.type === 'work' ? (
                              <TimerIcon color="primary" />
                            ) : (
                              <CheckCircleIcon color="success" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${session.type === 'work' ? 'Work' : session.type === 'shortBreak' ? 'Short Break' : 'Long Break'} Session`}
                            secondary={`${session.duration} minutes • ${formatDateSafely(session.completedAt)}`}
                          />
                        </ListItem>
                      ))}
                      
                      {hasMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={loadMoreSessions}
                            disabled={isLoadingMore}
                          >
                            {isLoadingMore ? 'Loading...' : 'Load More'}
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </List>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Add keyframe animation for the pulse effect
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;
document.head.appendChild(style);

export default Pomodoro; 