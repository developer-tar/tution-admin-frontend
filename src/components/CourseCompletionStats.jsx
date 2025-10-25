import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  LinearProgress,
  CircularProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails
} from '@mui/material';
import { 
  ExpandMore, 
  TrendingUp, 
  Assignment, 
  Quiz, 
  School 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api';

const CourseCompletionStats = ({ subjectId, chooseTitle }) => {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);

  // Debug props
  console.log('CourseCompletionStats props:', { subjectId, chooseTitle });

  // Fetch stats data when props change
  useEffect(() => {
    const fetchStats = async () => {
      // Only call API when both values are present and not empty
      if (!subjectId || !chooseTitle || subjectId === '' || chooseTitle === '') {
        console.log('API call skipped - missing values:', { subjectId, chooseTitle });
        return;
      }
      
      setLoading(true);
      try {
        const response = await api.get(`student/current/assignment/stats`, {
          params: { 
            subject_id: subjectId,
            choose_title: chooseTitle
          }
        });
        
        if (response.data.success) {
          setStatsData(response.data.data);
        } else {
          toast.info(response.data.message || 'No data available');
          setStatsData(null);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          toast.info(error.response.data.message || 'No course or assignment found');
          setStatsData(null);
        } else if (error.response?.status === 422) {
          toast.error('Please select a valid subject');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          toast.error('Failed to fetch statistics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [subjectId, chooseTitle]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}30`,
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 25px ${color}20` }
    }}>
      <CardContent sx={{ textAlign: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          {icon}
          <Typography variant="h4" fontWeight={700} sx={{ color, ml: 1 }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (!subjectId || !chooseTitle || subjectId === '' || chooseTitle === '') {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select both subject and content type to view statistics
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {statsData && !loading && (
        <Box>
          {/* Course Info */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                📚 {statsData.course_info?.course_name || 'Course Name'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption">End Date</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {statsData.course_info?.end_date ? formatDate(statsData.course_info.end_date) : 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption">Time Remaining</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {statsData.course_info?.days_remaining?.message || 'No time info'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption">Status</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ 
                    color: statsData.course_info?.days_remaining?.status === 'active' ? 'success.main' : 'text.primary' 
                  }}>
                    {statsData.course_info?.days_remaining?.status || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption">Formatted Time</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {statsData.course_info?.days_remaining?.formatted || '--:--:--'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Overall Progress"
                value={`${(statsData.overall_progress?.completion_percentage || 0).toFixed(1)}%`}
                subtitle={`${statsData.overall_progress?.completed_items || 0}/${statsData.overall_progress?.total_items || 0} completed`}
                color="#2196f3"
                icon={<TrendingUp />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Topics"
                value={`${(statsData.topics_statistics?.completion_percentage || 0).toFixed(1)}%`}
                subtitle={`${statsData.topics_statistics?.completed_topics || 0}/${statsData.topics_statistics?.total_topics || 0} completed`}
                color="#4caf50"
                icon={<School />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Topic Tests"
                value={`${(statsData.topic_tests_statistics?.average_score || 0).toFixed(1)}%`}
                subtitle={`${statsData.topic_tests_statistics?.attempted_tests || 0}/${statsData.topic_tests_statistics?.total_tests || 0} attempted`}
                color="#ff9800"
                icon={<Quiz />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="SubTopic Tests"
                value={`${(statsData.subtopic_tests_statistics?.average_score || 0).toFixed(1)}%`}
                subtitle={`${statsData.subtopic_tests_statistics?.attempted_tests || 0}/${statsData.subtopic_tests_statistics?.total_tests || 0} attempted`}
                color="#9c27b0"
                icon={<Assignment />}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {!statsData && !loading && subjectId && (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No data available for selected subject
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CourseCompletionStats;
