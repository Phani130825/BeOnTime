import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  LinearProgress,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ActivityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const Challenge = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const Community = () => {
  const friendsActivity = [
    {
      id: 1,
      name: 'Sarah Johnson',
      activity: 'Completed "Morning Exercise"',
      time: '2 hours ago',
      avatar: '/avatars/sarah.jpg',
    },
    {
      id: 2,
      name: 'Michael Chen',
      activity: 'Started a 30-day meditation challenge',
      time: '5 hours ago',
      avatar: '/avatars/michael.jpg',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      activity: 'Achieved a 10-day reading streak',
      time: '1 day ago',
      avatar: '/avatars/emily.jpg',
    },
  ];

  const challenges = [
    {
      id: 1,
      title: '30-Day Meditation Challenge',
      description: 'Join 245 others in this mindfulness challenge',
      progress: 50,
      daysRemaining: 15,
      participants: 245,
    },
    {
      id: 2,
      title: 'Reading Marathon',
      description: 'Read for 30 minutes every day for 21 days',
      progress: 30,
      daysRemaining: 15,
      participants: 158,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Community
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Friends Activity</Typography>
            </Box>
            <Box>
              {friendsActivity.map((activity) => (
                <ActivityItem key={activity.id}>
                  <Avatar
                    src={activity.avatar}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">{activity.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.activity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </ActivityItem>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Challenges</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {challenges.map((challenge) => (
                <Challenge key={challenge.id} elevation={0}>
                  <Typography variant="h6" gutterBottom>
                    {challenge.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {challenge.description}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={challenge.progress}
                    sx={{ my: 1, height: 6, borderRadius: 3 }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {challenge.daysRemaining} days remaining
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Join Challenge
                    </Button>
                  </Box>
                </Challenge>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Community; 