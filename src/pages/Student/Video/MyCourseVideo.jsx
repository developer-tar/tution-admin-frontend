import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore, VideoLibrary, PlayCircle, CheckCircle, Schedule, OndemandVideo } from "@mui/icons-material";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../../api";
import logout from "../../../logout";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get week status color
const getWeekStatusColor = (status) => {
  switch (status) {
    case 'current': return 'success';
    case 'upcoming': return 'info';
    case 'past': return 'default';
    default: return 'default';
  }
};

const MyCourseVideo = () => {
  const { control, setValue } = useForm();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Debug log to ensure component is loading correctly
  console.log('MyCourseVideo component loaded - v2');

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contentData, setContentData] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  
  // Filter options from hierarchical API
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  const [formFilters, setFormFilters] = useState({
    subject_id: "",
    topic_id: "",
    subtopic_id: "",
    content_type: "video", // Filter for videos only
    status: "",
    date_from: "",
    date_to: "",
  });

  const [filters, setFilters] = useState(formFilters);

  const handleFormFilterChange = (key, value) => {
    setFormFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  // API Functions
  const fetchContent = async (queryFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Always filter for video content
      params.append('content_type', 'video');
      
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value && value !== "" && key !== 'content_type') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`student/content/by-weeks?${params.toString()}`);
      
      if (response.data.success) {
        const content = response.data.data.content || [];
        setContentData(content);
        
        if (content.length === 0) {
          toast.info('No video content found for the selected filters');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch content');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        return;
      }
      
      if (err.response?.status === 404) {
        setContentData([]);
        setError('No video content found for the selected filters.');
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to fetch video content');
      toast.error('Failed to fetch video content. Please try again.');
      setContentData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchicalData = async () => {
    try {
      const response = await api.get('student/hierarchical-data');
      
      if (response.data.status === 'success') {
        const hierarchicalData = response.data.data || [];
        
        const courseOptions = hierarchicalData.map(item => ({
          id: item.course.id,
          name: item.course.name
        }));
        
        const subjectOptions = [];
        const topicOptions = [];
        const subtopicOptions = [];
        
        hierarchicalData.forEach(item => {
          item.subjects?.forEach(subject => {
            if (!subjectOptions.find(s => s.id === subject.id)) {
              subjectOptions.push({
                id: subject.id,
                name: subject.name,
                course_id: item.course.id
              });
            }
            
            subject.topics?.forEach(topic => {
              if (!topicOptions.find(t => t.id === topic.id)) {
                topicOptions.push({
                  id: topic.id,
                  name: topic.name,
                  subject_id: subject.id,
                  course_id: item.course.id
                });
              }
              
              topic.subtopics?.forEach(subtopic => {
                if (!subtopicOptions.find(st => st.id === subtopic.id)) {
                  subtopicOptions.push({
                    id: subtopic.id,
                    name: subtopic.name,
                    topic_id: topic.id,
                    subject_id: subject.id,
                    course_id: item.course.id
                  });
                }
              });
            });
          });
        });
        
        setCourses(courseOptions);
        setSubjects(subjectOptions);
        setTopics(topicOptions);
        setSubtopics(subtopicOptions);
      }
    } catch (err) {
      console.error('Error fetching hierarchical data:', err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const handleSearch = () => {
    setFilters({ ...formFilters });
    setPage(0);
    fetchContent(formFilters);
  };

  const displayData = useMemo(() => {
    return contentData;
  }, [contentData]);

  // Effects
  useEffect(() => {
    const loadInitialData = async () => {
      setDropdownLoading(true);
      await fetchHierarchicalData();
      setDropdownLoading(false);
      
      // Load all video content initially
      fetchContent({ content_type: 'video' });
    };
    
    loadInitialData();
  }, []);

  const columns = [
    { 
      key: "content_name", 
      label: "Video Title",
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            {row.content_type === 'TopicContent' ? '🎥' : '📹'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.content_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.content_type}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      key: "course_name", 
      label: "Course",
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.course_name}
        </Typography>
      )
    },
    { 
      key: "subject_name", 
      label: "Subject",
      render: (row) => (
        <Chip 
          label={row.subject_name}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    { 
      key: "topic_name", 
      label: "Topic",
      render: (row) => (
        <Typography variant="body2">
          {row.topic_name || 'N/A'}
        </Typography>
      )
    },
    { 
      key: "subtopic_name", 
      label: "Subtopic",
      render: (row) => (
        <Typography variant="body2">
          {row.subtopic_name || 'N/A'}
        </Typography>
      )
    },
    {
      key: "week_info",
      label: "Week",
      render: (row) => (
        <Box>
          <Chip 
            label={row.week_info?.week_number || 'N/A'}
            size="small"
            color={getWeekStatusColor(row.week_info?.status)}
          />
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            {row.week_info?.start_end_date || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: "created_at",
      label: "Added On",
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(row.created_at)}
        </Typography>
      )
    },
   
  ];

  // Filter available options based on parent selections
  const getFilteredSubjects = () => {
    return subjects; // No course filter in this component
  };
  
  const getFilteredTopics = () => {
    if (!formFilters.subject_id) return topics;
    return topics.filter(topic => topic.subject_id == formFilters.subject_id);
  };
  
  const getFilteredSubtopics = () => {
    if (!formFilters.topic_id) return subtopics;
    return subtopics.filter(subtopic => subtopic.topic_id == formFilters.topic_id);
  };

  // Status options
  const statusOptions = [
    { id: "", name: "All Status" },
    { id: "completed", name: "Completed" },
    { id: "pending", name: "Pending" },
    { id: "in_progress", name: "In Progress" },
  ];

  const filterFields = [
    {
      name: "subject_id",
      label: "Subject",
      options: getFilteredSubjects(),
      defaultValue: formFilters.subject_id,
      onChange: (val) => {
        handleFormFilterChange("subject_id", val);
        // Clear dependent fields when subject changes
        if (formFilters.topic_id) {
          handleFormFilterChange("topic_id", "");
          handleFormFilterChange("subtopic_id", "");
        }
      },
    },
    {
      name: "topic_id",
      label: "Topic",
      options: getFilteredTopics(),
      defaultValue: formFilters.topic_id,
      onChange: (val) => {
        handleFormFilterChange("topic_id", val);
        // Clear dependent fields when topic changes
        if (formFilters.subtopic_id) {
          handleFormFilterChange("subtopic_id", "");
        }
      },
    },
    {
      name: "subtopic_id",
      label: "SubTopic",
      options: getFilteredSubtopics(),
      defaultValue: formFilters.subtopic_id,
      onChange: (val) => handleFormFilterChange("subtopic_id", val),
    },
    {
      name: "status",
      label: "Status",
      options: statusOptions,
      defaultValue: formFilters.status,
      onChange: (val) => handleFormFilterChange("status", val),
    },
  ];

  return (
    <Box p={3}>
      {/* Fancy Header Section */}
      <Box 
        sx={{ 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          p: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' }
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            animation: 'float 4s ease-in-out infinite reverse',
          }}
        />
        
        {/* Header Content */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' }
                }
              }}
            >
              <OndemandVideo sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'white',
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                  }
                }}
              >
                My Course Videos
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  mt: 0.5
                }}
              >
                🎥 Watch and learn from your course video content
              </Typography>
            </Box>
          </Box>
          
          {/* Quick Stats Bar */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              flexWrap: 'wrap',
              mt: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#4CAF50',
                  animation: 'blink 2s ease-in-out infinite',
                  '@keyframes blink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 }
                  }
                }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                HD Video Streaming
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#2196F3',
                  animation: 'blink 2s ease-in-out infinite 0.5s',
                }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Weekly Content
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#FF9800',
                  animation: 'blink 2s ease-in-out infinite 1s',
                }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Progress Tracking
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Video Statistics */}
      {displayData.length > 0 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <OndemandVideo />
              Video Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Videos
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.filter(item => item.content_type === 'TopicContent').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Topic Videos
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.filter(item => item.content_type === 'SubTopicContent').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Subtopic Videos
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.filter(item => item.week_info?.status === 'current').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Current Week
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Accordion defaultExpanded sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🔍 Filter Videos
            {dropdownLoading && <CircularProgress size={16} />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} mb={2}>
            {filterFields.map((field, idx) => (
              <DropdownField
                key={idx}
                control={control}
                name={field.name}
                label={field.label}
                options={field.options}
                defaultValue={field.defaultValue}
                onChange={field.onChange}
                disabled={dropdownLoading}
              />
            ))}
            
            {/* Loading indicator for dropdowns */}
            {dropdownLoading && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Loading filter options...
                  </Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={3} mt="auto">
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Searching...' : 'Search Videos'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3} mt="auto">
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => {
                  setFormFilters({
                    subject_id: "",
                    topic_id: "",
                    subtopic_id: "",
                    content_type: "video",
                    status: "",
                    date_from: "",
                    date_to: "",
                  });
                  Object.keys(formFilters).forEach(key => {
                    setValue(key, key === 'content_type' ? 'video' : "");
                  });
                  fetchContent({ content_type: 'video' });
                }}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Video Table */}
      <DataTable
        loading={loading}
        data={displayData}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        columns={columns}
        isFilterSelected={true}
      />

      {/* No Data Message */}
      {!loading && displayData.length === 0 && !error && (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <OndemandVideo sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No videos found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for new video content.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MyCourseVideo;

// Force cache refresh - v2.0
