import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Paper,
  Container
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if token exists
      const token = localStorage.getItem('token') || localStorage.getItem('admin-token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }
      
      const response = await api.get('student/announcements');
      
      console.log('Announcements API Response:', response.data);
      
      // Handle different response structures
      let announcementsData = [];
      if (response.data) {
        if (response.data.success && response.data.data) {
          // Standard response structure
          announcementsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
        } else if (Array.isArray(response.data)) {
          // Direct array response
          announcementsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nested data structure
          announcementsData = response.data.data;
        }
      }
      
      console.log('Parsed announcements:', announcementsData);
      setAnnouncements(announcementsData);
      
      if (!response.data.success && response.data.message) {
        console.warn('API warning:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        if (errorData?.data?.error) {
          setError(errorData.data.error);
        } else if (errorData?.message) {
          setError(errorData.message);
        } else if (error.response.status === 401) {
          setError('Unauthorized. Please login again.');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('An error occurred while fetching announcements');
        }
      } else if (error.request) {
        // Request made but no response
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <NotificationsIcon sx={{ mr: 1, color: '#667eea', fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>
                Announcements
              </Typography>
            </Box>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ mb: 3 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="rectangular" width="30%" height={24} sx={{ mt: 1, borderRadius: 1 }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={fetchAnnouncements} color="primary">
            Retry
          </IconButton>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ mr: 2, color: '#667eea' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <NotificationsIcon sx={{ mr: 1, color: '#667eea', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1A2334' }}>
                Announcements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stay updated with the latest news and updates
                {announcements.length > 0 && ` • ${announcements.length} announcement${announcements.length > 1 ? 's' : ''}`}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={fetchAnnouncements}
            disabled={loading}
            sx={{ 
              color: '#667eea',
              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
            }}
            title="Refresh announcements"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Announcements List */}
      {announcements.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Announcements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              There are no announcements available at this time.
            </Typography>
            {/* <Typography variant="caption" color="text.secondary">
              Announcements with "Student" in target audience will appear here.
            </Typography> */}
          </CardContent>
        </Card>
      ) : announcements.length > 0 ? (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {announcements.map((announcement, index) => (
              <React.Fragment key={announcement.id}>
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 3,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1A2334', flex: 1, minWidth: '200px' }}>
                      {announcement.title || 'Untitled Announcement'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {announcement.created_at_human || (announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : '')}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      width: '100%'
                    }}
                  >
                    {announcement.message || 'No message content'}
                  </Typography>
                  
                  {announcement.target_audience && announcement.target_audience.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      {announcement.target_audience.map((role) => (
                        <Chip
                          key={role.id}
                          label={role.name}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </ListItem>
                {index < announcements.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : null}
    </Container>
  );
};

export default StudentAnnouncements;

