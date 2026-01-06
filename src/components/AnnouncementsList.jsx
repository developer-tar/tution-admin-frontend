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
  Collapse
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import api from '../api';

const AnnouncementsList = ({ role = 'student' }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const endpoint = role === 'student' ? 'student/announcements' : 'parent/announcements';
      const response = await api.get(endpoint);
      
      console.log('AnnouncementsList API Response:', response.data);
      
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
      
      console.log('AnnouncementsList parsed data:', announcementsData);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsIcon sx={{ mr: 1, color: '#667eea' }} />
            <Typography variant="h6" fontWeight={600}>
              Announcements
            </Typography>
          </Box>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="100%" height={16} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't show if no announcements
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1, color: '#667eea', fontSize: 24 }} />
            <Typography variant="h6" fontWeight={600}>
              Announcements
            </Typography>
            <Chip 
              label={announcements.length} 
              size="small" 
              sx={{ ml: 1, bgcolor: '#667eea', color: 'white' }}
            />
          </Box>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <List sx={{ p: 0 }}>
            {announcements.map((announcement, index) => (
              <React.Fragment key={announcement.id}>
                <ListItem 
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    py: 2,
                    px: 0
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {announcement.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {announcement.created_at_human || new Date(announcement.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {announcement.message}
                  </Typography>
                  {announcement.target_audience && announcement.target_audience.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      {announcement.target_audience.map((role) => (
                        <Chip 
                          key={role.id} 
                          label={role.name} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  )}
                </ListItem>
                {index < announcements.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AnnouncementsList;


