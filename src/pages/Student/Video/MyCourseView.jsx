import { useMemo, useState, useEffect } from "react";
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
import { ExpandMore, VideoLibrary, PlayCircle, CheckCircle, Schedule } from "@mui/icons-material";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../../api";
import logout from "../../../logout";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not viewed';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get status color
const getStatusColor = (viewStatus) => {
  switch (viewStatus) {
    case 'just_viewed': return 'success';
    case 'viewed': return 'info';
    case 'not_viewed': return 'warning';
    default: return 'default';
  }
};

// Dummy Data
const dummyResults = [
  {
    id: 1,
    video_id: "VID001",
    course_id: "1",
    course: "Mathematics",
    subject_id: "1",
    subject: "Algebra",
    topic_id: "1",
    topic: "Quadratic Equations",
    subtopic_id: "1",
    subtopic: "Factoring",
    title: "Intro to Quadratics",
    video_type: "Lecture",
    assignment_week: "Week 1",
    attempt_type: "last",
  },
  {
    id: 2,
    video_id: "VID002",
    course_id: "2",
    course: "Science",
    subject_id: "2",
    subject: "Physics",
    topic_id: "2",
    topic: "Motion",
    subtopic_id: "2",
    subtopic: "Newton's Laws",
    title: "Understanding Motion",
    video_type: "Concept",
    assignment_week: "Week 2",
    attempt_type: "first",
  },
];

const MyCourseView = () => {
  const { control, setValue } = useForm();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

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
    course_id: "",
    subject_id: "",
    topic_id: "",
    subtopic_id: "",
    attempt_type: "",
    viewed: "",
  });

  // Define attempt types options
  const attemptTypes = [
    { id: "all", name: "All Attempts" },
    { id: "first_attempt", name: "First Attempt" },
    { id: "last_attempt", name: "Last Attempt" },
  ];

  // Define viewed options
  const viewedOptions = [
    { id: "", name: "All Content" },
    { id: "last_3_days", name: "Last 3 Days" },
    { id: "last_5_days", name: "Last 5 Days" },
    { id: "last_10_days", name: "Last 10 Days" },
  ];

  const [filters, setFilters] = useState(formFilters);

  const handleFormFilterChange = (key, value) => {
    setFormFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  // API Functions
  const fetchViewedContent = async (queryFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value && value !== "") {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`student/viewed-content/by-weeks?${params.toString()}`);
      
      if (response.data.success) {
        const content = response.data.data.content || [];
        setContentData(content);
        
        if (content.length === 0) {
          toast.info('No viewed content found for the selected filters');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch viewed content');
      }
    } catch (err) {
      console.error('Error fetching viewed content:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to fetch viewed content');
      toast.error('Failed to fetch viewed content. Please try again.');
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
    fetchViewedContent(formFilters);
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
      
      // Load all content initially
      fetchViewedContent();
    };
    
    loadInitialData();
  }, []);

  const columns = [
    { 
      key: "content_name", 
      label: "Content Name",
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            {row.content_type === 'TopicContent' ? '📚' : '📖'}
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
        <Typography variant="body2">
          {row.subject_name}
        </Typography>
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
      key: "view_status",
      label: "Status",
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.is_viewed ? <CheckCircle color="success" fontSize="small" /> : <Schedule color="warning" fontSize="small" />}
          <Chip 
            label={row.view_status?.replace('_', ' ') || 'Unknown'}
            size="small"
            color={getStatusColor(row.view_status)}
          />
        </Box>
      )
    },
    {
      key: "viewed_at",
      label: "Viewed At",
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(row.viewed_at)}
        </Typography>
      )
    },
    
  ];

  // Filter available options based on parent selections
  const getFilteredSubjects = () => {
    if (!formFilters.course_id) return subjects;
    return subjects.filter(subject => subject.course_id == formFilters.course_id);
  };
  
  const getFilteredTopics = () => {
    if (!formFilters.subject_id) return topics;
    return topics.filter(topic => topic.subject_id == formFilters.subject_id);
  };
  
  const getFilteredSubtopics = () => {
    if (!formFilters.topic_id) return subtopics;
    return subtopics.filter(subtopic => subtopic.topic_id == formFilters.topic_id);
  };

  const filterFields = [
    {
      name: "course_id",
      label: "Course",
      options: courses,
      defaultValue: formFilters.course_id,
      onChange: (val) => {
        handleFormFilterChange("course_id", val);
        // Clear dependent fields when course changes
        if (formFilters.subject_id) {
          handleFormFilterChange("subject_id", "");
          handleFormFilterChange("topic_id", "");
          handleFormFilterChange("subtopic_id", "");
        }
      },
    },
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
      name: "viewed",
      label: "Viewed Period",
      options: viewedOptions,
      defaultValue: formFilters.viewed,
      onChange: (val) => handleFormFilterChange("viewed", val),
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
              <VideoLibrary sx={{ fontSize: 32, color: 'white' }} />
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
                My Course Content View
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
                📚 Track your learning progress and explore course materials
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
                Live Content Tracking
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
                Smart Filtering
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
                Progress Analytics
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Summary Statistics */}
      {displayData.length > 0 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoLibrary />
              Content Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Content
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.filter(item => item.is_viewed).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Viewed Content
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.filter(item => !item.is_viewed).length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending Content
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" fontWeight={700}>
                  {displayData.length > 0 ? Math.round((displayData.filter(item => item.is_viewed).length / displayData.length) * 100) : 0}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completion Rate
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
            🔍 Filter Content
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
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3} mt="auto">
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => {
                  setFormFilters({
                    course_id: "",
                    subject_id: "",
                    topic_id: "",
                    subtopic_id: "",
                    attempt_type: "",
                    viewed: "",
                  });
                  Object.keys(formFilters).forEach(key => {
                    setValue(key, "");
                  });
                  fetchViewedContent();
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

      {/* Content Table */}
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
          <VideoLibrary sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No content found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for new content.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MyCourseView;
