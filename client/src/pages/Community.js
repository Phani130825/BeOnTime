import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    category: '',
    duration: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    habitDetails: {
      title: '',
      description: '',
      frequency: 'Daily',
      targetDays: 30,
      duration: 30 // in minutes
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both communities and challenges in parallel
      const [communitiesRes, challengesRes] = await Promise.all([
        api.get('/api/communities'),
        api.get('/api/challenges')
      ]);
      
      setCommunities(communitiesRes.data);
      setChallenges(challengesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      await api.post('/api/communities', newCommunity);
      setShowCreateCommunity(false);
      setNewCommunity({ name: '', description: '', category: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating community:', err);
      setError(err.response?.data?.message || 'Failed to create community');
    }
  };

  const handleCreateChallenge = async () => {
    try {
      await api.post('/api/challenges', newChallenge);
      setShowCreateChallenge(false);
      setNewChallenge({
        title: '',
        description: '',
        category: '',
        duration: 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        habitDetails: {
          title: '',
          description: '',
          frequency: 'Daily',
          targetDays: 30,
          duration: 30 // in minutes
        }
      });
      fetchData();
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err.response?.data?.message || 'Failed to create challenge');
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await api.post(`/api/communities/${communityId}/join`);
      fetchData();
    } catch (err) {
      console.error('Error joining community:', err);
      setError(err.response?.data?.message || 'Failed to join community');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await api.post(`/api/challenges/${challengeId}/join`);
      fetchData();
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError(err.response?.data?.message || 'Failed to join challenge');
    }
  };

  const categories = ['health', 'fitness', 'learning', 'productivity', 'wellness', 'other'];

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Please login to view the community
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

  const userCommunities = communities.filter(c => c.creator._id === user._id);
  const publicCommunities = communities.filter(c => c.creator._id !== user._id);
  const userChallenges = challenges.filter(c => c.creator._id === user._id);
  const publicChallenges = challenges.filter(c => c.creator._id !== user._id);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {activeTab === 0 ? 'Communities' : 'Challenges'}
        </Typography>
        <Box>
          <Tooltip title={activeTab === 0 ? "Create Community" : "Create Challenge"}>
            <IconButton 
              color="primary" 
              onClick={() => activeTab === 0 ? setShowCreateCommunity(true) : setShowCreateChallenge(true)}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Communities" />
        <Tab label="Challenges" />
      </Tabs>

      {activeTab === 0 ? (
        <>
          {/* User's Communities */}
          <Typography variant="h5" gutterBottom>
            My Communities
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {userCommunities.map((community) => (
              <Grid item xs={12} sm={6} md={4} key={community._id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {community.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">{community.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {community.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={community.category} size="small" />
                      <Chip 
                        label={`${community.members.length} members`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Public Communities */}
          <Typography variant="h5" gutterBottom>
            Public Communities
          </Typography>
          <Grid container spacing={3}>
            {publicCommunities.map((community) => (
              <Grid item xs={12} sm={6} md={4} key={community._id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {community.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">{community.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {community.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={community.category} size="small" />
                      <Chip 
                        label={`${community.members.length} members`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    {!community.members.some(m => m.user._id === user._id) && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleJoinCommunity(community._id)}
                      >
                        Join Community
                      </Button>
                    )}
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          {/* User's Challenges */}
          <Typography variant="h5" gutterBottom>
            My Challenges
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {userChallenges.map((challenge) => (
              <Grid item xs={12} sm={6} md={4} key={challenge._id}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {challenge.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {challenge.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={challenge.category} size="small" />
                      <Chip 
                        label={`${challenge.participants.length} participants`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {challenge.duration} days
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Public Challenges */}
          <Typography variant="h5" gutterBottom>
            Public Challenges
          </Typography>
          <Grid container spacing={3}>
            {publicChallenges.map((challenge) => (
              <Grid item xs={12} sm={6} md={4} key={challenge._id}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {challenge.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {challenge.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={challenge.category} size="small" />
                      <Chip 
                        label={`${challenge.participants.length} participants`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {challenge.duration} days
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {!challenge.participants.some(p => p.user._id === user._id) && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleJoinChallenge(challenge._id)}
                      >
                        Join Challenge
                      </Button>
                    )}
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Create Community Dialog */}
      <Dialog open={showCreateCommunity} onClose={() => setShowCreateCommunity(false)}>
        <DialogTitle>Create New Community</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Community Name"
            fullWidth
            value={newCommunity.name}
            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newCommunity.description}
            onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Category"
            fullWidth
            value={newCommunity.category}
            onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateCommunity(false)}>Cancel</Button>
          <Button onClick={handleCreateCommunity} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog
        open={showCreateChallenge}
        onClose={() => setShowCreateChallenge(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Challenge</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Challenge Title"
            fullWidth
            value={newChallenge.title}
            onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Challenge Description"
            fullWidth
            multiline
            rows={4}
            value={newChallenge.description}
            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Category"
            fullWidth
            value={newChallenge.category}
            onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value })}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Duration (days)"
            type="number"
            fullWidth
            value={newChallenge.duration}
            onChange={(e) => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            value={newChallenge.startDate}
            onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            value={newChallenge.endDate}
            onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Habit Details
          </Typography>
          <TextField
            margin="dense"
            label="Habit Title"
            fullWidth
            value={newChallenge.habitDetails.title}
            onChange={(e) => setNewChallenge({
              ...newChallenge,
              habitDetails: { ...newChallenge.habitDetails, title: e.target.value }
            })}
          />
          <TextField
            margin="dense"
            label="Habit Description"
            fullWidth
            multiline
            rows={2}
            value={newChallenge.habitDetails.description}
            onChange={(e) => setNewChallenge({
              ...newChallenge,
              habitDetails: { ...newChallenge.habitDetails, description: e.target.value }
            })}
          />
          <TextField
            margin="dense"
            select
            label="Frequency"
            fullWidth
            value={newChallenge.habitDetails.frequency}
            onChange={(e) => setNewChallenge({
              ...newChallenge,
              habitDetails: { ...newChallenge.habitDetails, frequency: e.target.value }
            })}
          >
            <MenuItem value="Daily">Daily</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Target Days"
            type="number"
            fullWidth
            value={newChallenge.habitDetails.targetDays}
            onChange={(e) => setNewChallenge({
              ...newChallenge,
              habitDetails: { ...newChallenge.habitDetails, targetDays: parseInt(e.target.value) }
            })}
          />
          <TextField
            margin="dense"
            label="Habit Duration (minutes)"
            type="number"
            fullWidth
            value={newChallenge.habitDetails.duration}
            onChange={(e) => setNewChallenge({
              ...newChallenge,
              habitDetails: { ...newChallenge.habitDetails, duration: parseInt(e.target.value) }
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateChallenge(false)}>Cancel</Button>
          <Button onClick={handleCreateChallenge} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Community; 