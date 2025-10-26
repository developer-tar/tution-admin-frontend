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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Avatar,
  LinearProgress,
  Tooltip,
  IconButton,
  Badge,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { 
  ExpandMore, 
  TrendingUp, 
  Assessment, 
  CheckCircle, 
  Schedule,
  Star,
  Timeline,
  Visibility,
  TrendingDown,
  TrendingFlat,
  School,
  BookmarkBorder,
  AccessTime,
  EmojiEvents,
  BarChart
} from "@mui/icons-material";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import logout from "../../../logout";

// Attempt Types
const attemptTypes = [
  { id: "all", name: "All Attempts" },
  { id: "first_attempt", name: "First Attempt" },
  { id: "last_attempt", name: "Last Attempt" },
];

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not completed';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'excellent': return 'success';
    case 'good': return 'info';
    case 'average': return 'warning';
    case 'poor': return 'error';
    default: return 'default';
  }
};

// Helper function to get trend icon based on attempt history
const getTrendIcon = (attemptHistory) => {
  if (!attemptHistory || attemptHistory.length < 2) return <TrendingFlat color="action" />;
  
  const lastTwo = attemptHistory.slice(-2);
  const trend = lastTwo[1].percentage - lastTwo[0].percentage;
  
  if (trend > 0) return <TrendingUp color="success" />;
  if (trend < 0) return <TrendingDown color="error" />;
  return <TrendingFlat color="action" />;
};

// Helper function to get performance badge
const getPerformanceBadge = (percentage) => {
  if (percentage >= 90) return { label: 'Excellent', color: 'success', icon: '🏆' };
  if (percentage >= 75) return { label: 'Good', color: 'info', icon: '⭐' };
  if (percentage >= 60) return { label: 'Average', color: 'warning', icon: '👍' };
  return { label: 'Needs Improvement', color: 'error', icon: '📚' };
};

// Helper function to calculate summary statistics
const calculateSummary = (tests) => {
  if (!tests || tests.length === 0) return null;
  
  const totalTests = tests.length;
  const completedTests = tests.filter(test => test.is_completed).length;
  const totalAttempts = tests.reduce((sum, test) => sum + test.total_attempts, 0);
  const averageScore = tests.reduce((sum, test) => sum + test.best_percentage, 0) / totalTests;
  const totalMarks = tests.reduce((sum, test) => sum + test.total_marks, 0);
  const totalScored = tests.reduce((sum, test) => sum + test.best_score, 0);
  
  return {
    total_tests: totalTests,
    completed_tests: completedTests,
    total_attempts: totalAttempts,
    average_score: averageScore,
    total_marks: totalMarks,
    total_scored: totalScored,
    completion_rate: (completedTests / totalTests) * 100
  };
};

const MyCourseTest = () => {
  const { control, setValue } = useForm();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [flatTestData, setFlatTestData] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  
  // Dialog states
  const [completedTestDialog, setCompletedTestDialog] = useState(false);
  const [selectedTestForDialog, setSelectedTestForDialog] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);
  
  // Filter options from API
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  const [formFilters, setFormFilters] = useState({
    course_id: "",
    subject_id: "",
    topic_id: "",
    subtopic_id: "",
    attempt: "all",
  });

  const [filters, setFilters] = useState(formFilters);

  // API Functions
  const fetchTestResults = async (queryFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Add non-empty filters to params
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value && value !== "" && value !== "all") {
          params.append(key, value);
        }
      });
      
      console.log('Fetching test results with params:', params.toString());
      
      const response = await api.get(`student/test-results/by-weeks?${params.toString()}`);
      
      console.log('Test results API response:', response.data);
      
      if (response.data.success) {
        const testsData = response.data.data.tests || [];
        setTestResults(response.data.data);
        setFlatTestData(testsData);
        
        if (testsData.length === 0) {
          toast.info('No test results found for the selected filters');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch test results');
      }
    } catch (err) {
      console.error('Error fetching test results:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        return;
      }
      
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = [];
        
        Object.values(errors).forEach(errorArray => {
          errorMessages.push(...errorArray);
        });
        
        toast.error(errorMessages.join(', '));
        setError(errorMessages.join(', '));
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch test results';
        toast.error(errorMessage);
        setError(errorMessage);
      }
      
      setTestResults(null);
      setFlatTestData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      console.log('Fetching hierarchical data for dropdowns...');
      
      const response = await api.get('student/hierarchical-data');
      
      console.log('Hierarchical data API response:', response.data);
      
      if (response.data.status === 'success') {
        const hierarchicalData = response.data.data || [];
        
        // Extract courses
        const courseOptions = hierarchicalData.map(item => ({
          id: item.course.id,
          name: item.course.name
        }));
        
        // Extract all subjects (flatten from all courses)
        const subjectOptions = [];
        hierarchicalData.forEach(item => {
          item.subjects?.forEach(subject => {
            // Avoid duplicates
            if (!subjectOptions.find(s => s.id === subject.id)) {
              subjectOptions.push({
                id: subject.id,
                name: subject.name,
                course_id: item.course.id
              });
            }
          });
        });
        
        // Extract all topics (flatten from all subjects)
        const topicOptions = [];
        hierarchicalData.forEach(item => {
          item.subjects?.forEach(subject => {
            subject.topics?.forEach(topic => {
              // Avoid duplicates
              if (!topicOptions.find(t => t.id === topic.id)) {
                topicOptions.push({
                  id: topic.id,
                  name: topic.name,
                  subject_id: subject.id,
                  course_id: item.course.id
                });
              }
            });
          });
        });
        
        // Extract all subtopics (flatten from all topics)
        const subtopicOptions = [];
        hierarchicalData.forEach(item => {
          item.subjects?.forEach(subject => {
            subject.topics?.forEach(topic => {
              topic.subtopics?.forEach(subtopic => {
                // Avoid duplicates
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
        
        console.log('Dropdown options set:', {
          courses: courseOptions.length,
          subjects: subjectOptions.length,
          topics: topicOptions.length,
          subtopics: subtopicOptions.length
        });
        
      } else {
        console.log('No hierarchical data found');
        setCourses([]);
        setSubjects([]);
        setTopics([]);
        setSubtopics([]);
      }
    } catch (err) {
      console.error('Error fetching hierarchical data:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        return;
      }
      
      if (err.response?.status === 404) {
        console.log('No courses found for this student');
        toast.info('No courses found. Please contact your administrator.');
      } else {
        toast.error('Failed to load dropdown options. Using manual input.');
      }
      
      // Set empty arrays on error
      setCourses([]);
      setSubjects([]);
      setTopics([]);
      setSubtopics([]);
    }
  };

  // Event Handlers
  const handleFormFilterChange = (key, value) => {
    setFormFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleSearch = () => {
    setFilters({ ...formFilters });
    setPage(0);
    fetchTestResults(formFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      course_id: "",
      subject_id: "",
      topic_id: "",
      subtopic_id: "",
      attempt: "all",
    };
    setFormFilters(clearedFilters);
    setFilters(clearedFilters);
    
    // Clear form values
    Object.keys(clearedFilters).forEach(key => {
      setValue(key, clearedFilters[key]);
    });
  };

  // Effects
  useEffect(() => {
    const loadInitialData = async () => {
      setDropdownLoading(true);
      await fetchDropdownOptions();
      setDropdownLoading(false);
      
      // Load all test results initially
      fetchTestResults();
    };
    
    loadInitialData();
  }, []);

  // Memoized data (already filtered by API)
  const displayData = useMemo(() => {
    return flatTestData;
  }, [flatTestData]);

  // Table columns configuration
  const columns = [
    {
      key: "test_name",
      label: "Test Name",
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main' }}>
            {row.test_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {row.test_id}
          </Typography>
        </Box>
      )
    },
    {
      key: "course_subject",
      label: "Course & Subject",
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.course_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.subject_name}
          </Typography>
        </Box>
      )
    },
    {
      key: "topic_subtopic",
      label: "Topic & Subtopic",
      render: (row) => (
        <Box>
          <Typography variant="body2">
            {row.topic_name || 'N/A'}
          </Typography>
          {row.subtopic_name && (
            <Typography variant="caption" color="text.secondary">
              {row.subtopic_name}
            </Typography>
          )}
        </Box>
      )
    },
    {
      key: "week",
      label: "Week",
      render: (row) => (
        <Chip
          label={row.week_info?.start_end_date || row.week_number}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      key: "performance",
      label: "Best Performance",
      render: (row) => {
        const performanceBadge = getPerformanceBadge(row.best_percentage);
        const trendIcon = getTrendIcon(row.attempt_history);
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 0.5 }}>
              {trendIcon}
              <Typography variant="body2" fontWeight={600}>
                {row.best_score}/{row.total_marks}
              </Typography>
            </Box>
            <Chip
              label={`${row.best_percentage.toFixed(1)}%`}
              size="small"
              color={performanceBadge.color}
              icon={<span>{performanceBadge.icon}</span>}
            />
          </Box>
        );
      }
    },
    {
      key: "attempts",
      label: "Attempts",
      render: (row) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" fontWeight={600}>
            {row.total_attempts}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            attempt{row.total_attempts !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          {row.is_completed ? (
            <Chip
              label="Completed"
              color="success"
              size="small"
              icon={<CheckCircle />}
            />
          ) : (
            <Chip
              label="In Progress"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
          {row.is_overdue && (
            <Chip label="Overdue" color="error" size="small" />
          )}
        </Box>
      )
    },
    {
      key: "last_attempt",
      label: "Last Attempt",
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(row.last_attempt_at)}
        </Typography>
      )
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => handleTakeTest(row)}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            Take Test
          </Button>
          <Tooltip title="View Details">
            <IconButton size="small" color="info" onClick={() => handleViewDetails(row)}>
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Action handlers
  const handleTakeTest = (test) => {
    console.log('Taking test:', test);
    
    // Check if test is completed
    if (test.is_completed) {
      setSelectedTestForDialog(test);
      setCompletedTestDialog(true);
      return;
    }
    
    // Navigate to test if not completed
    toast.info(`Starting test: ${test.test_name}`);
    navigate(`/student/topic/test/${test.test_id}`);
  };

  const handleViewDetails = (test) => {
    console.log('Viewing test details:', test);
    setSelectedTestDetails(test);
    setDetailsDialog(true);
  };
  
  // Dialog handlers
  const handleCloseCompletedDialog = () => {
    setCompletedTestDialog(false);
    setSelectedTestForDialog(null);
  };
  
  const handleCloseDetailsDialog = () => {
    setDetailsDialog(false);
    setSelectedTestDetails(null);
  };

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
      name: "attempt",
      label: "Attempt Type",
      options: attemptTypes,
      defaultValue: formFilters.attempt,
      onChange: (val) => handleFormFilterChange("attempt", val),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment color="primary" />
        My Course Test Results
      </Typography>

      {/* Enhanced Summary Statistics */}
      {flatTestData.length > 0 && (() => {
        const summary = calculateSummary(flatTestData);
        return (
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Background Pattern */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '200px', 
              height: '200px', 
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)'
            }} />
            
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <BarChart sx={{ fontSize: 32 }} />
                Test Performance Dashboard
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                      <Assessment sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {summary.total_tests}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Tests
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                      <TrendingUp sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {summary.average_score.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average Score
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                      <EmojiEvents sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {summary.total_scored}/{summary.total_marks}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Score
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {summary.completion_rate.toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completion Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Additional Stats Row */}
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Completed Tests</Typography>
                    <Typography variant="h6" fontWeight={600}>{summary.completed_tests}/{summary.total_tests}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Attempts</Typography>
                    <Typography variant="h6" fontWeight={600}>{summary.total_attempts}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Avg Attempts/Test</Typography>
                    <Typography variant="h6" fontWeight={600}>{(summary.total_attempts / summary.total_tests).toFixed(1)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        );
      })()}

      {/* Filters */}
      <Accordion defaultExpanded sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🔍 Filter Test Results
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
                onClick={handleClearFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
          
          {/* Applied Filters Display */}
          {Object.values(formFilters).some(value => value && value !== "" && value !== "all") && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Applied Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {Object.entries(formFilters).map(([key, value]) => 
                  value && value !== "" && value !== "all" ? (
                    <Chip 
                      key={key} 
                      label={`${key.replace('_', ' ')}: ${value}`} 
                      size="small" 
                      variant="outlined"
                      onDelete={() => handleFormFilterChange(key, key === 'attempt' ? 'all' : '')}
                    />
                  ) : null
                )}
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Test Results Table */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookmarkBorder color="primary" />
          Test Results ({displayData.length})
        </Typography>
      </Box>

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
          <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No test results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later for new test results.
          </Typography>
        </Paper>
      )}

      {/* Completed Test Dialog */}
      <Dialog
        open={completedTestDialog}
        onClose={handleCloseCompletedDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CheckCircle />
          Test Already Completed
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            <Typography variant="body1" gutterBottom>
              You have already completed the test <strong>"{selectedTestForDialog?.test_name}"</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>Your Performance:</strong>
            </Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                • Best Score: <strong>{selectedTestForDialog?.best_score}/{selectedTestForDialog?.total_marks}</strong>
              </Typography>
              <Typography variant="body2">
                • Best Percentage: <strong>{selectedTestForDialog?.best_percentage?.toFixed(1)}%</strong>
              </Typography>
              <Typography variant="body2">
                • Total Attempts: <strong>{selectedTestForDialog?.total_attempts}</strong>
              </Typography>
              <Typography variant="body2">
                • Status: <Chip 
                  label={selectedTestForDialog?.status || 'Unknown'} 
                  size="small" 
                  color={getStatusColor(selectedTestForDialog?.status)}
                />
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              All your attempts for this test have been completed. You cannot take this test again.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCompletedDialog} variant="contained" color="primary">
            Understood
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Visibility />
          Test Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedTestDetails && (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  📋 Basic Information
                </Typography>
                <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Test Name</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.test_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Test ID</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.test_id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Course</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.course_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Subject</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.subject_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Topic</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.topic_name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Subtopic</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.subtopic_name || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Performance Summary */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  📊 Performance Summary
                </Typography>
                <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedTestDetails.best_score}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Best Score</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedTestDetails.total_marks}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedTestDetails.best_percentage?.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Best Percentage</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          {selectedTestDetails.total_attempts}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Total Attempts</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Week Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  📅 Week Information
                </Typography>
                <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Week Number</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.week_number}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Week Period</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedTestDetails.week_info?.start_end_date}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Week Status</Typography>
                      <Chip 
                        label={selectedTestDetails.week_info?.status || 'Unknown'} 
                        size="small" 
                        color="primary"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Last Attempt</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(selectedTestDetails.last_attempt_at)}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Attempt History */}
              {selectedTestDetails.attempt_history && selectedTestDetails.attempt_history.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    📈 Attempt History
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedTestDetails.attempt_history.map((attempt, idx) => (
                      <Card key={idx} sx={{ p: 2, bgcolor: idx === selectedTestDetails.attempt_history.length - 1 ? 'primary.50' : 'grey.50' }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={2}>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                              #{attempt.attempt_number}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              Score: <strong>{attempt.score}/{attempt.total_marks}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">
                              <strong>{attempt.percentage}%</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              Correct: <strong>{attempt.correct_answers}/{attempt.total_questions}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(attempt.completed_at)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Status Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  ℹ️ Status Information
                </Typography>
                <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Completion Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={selectedTestDetails.is_completed ? 'Completed' : 'In Progress'} 
                          color={selectedTestDetails.is_completed ? 'success' : 'warning'}
                          icon={selectedTestDetails.is_completed ? <CheckCircle /> : <Schedule />}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Performance Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={selectedTestDetails.status || 'Unknown'} 
                          color={getStatusColor(selectedTestDetails.status)}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Overdue Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {selectedTestDetails.is_overdue ? (
                          <Chip label="Overdue" color="error" />
                        ) : (
                          <Chip label="On Time" color="success" variant="outlined" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetailsDialog} variant="outlined">
            Close
          </Button>
          {selectedTestDetails && !selectedTestDetails.is_completed && (
            <Button 
              onClick={() => {
                handleCloseDetailsDialog();
                handleTakeTest(selectedTestDetails);
              }} 
              variant="contained" 
              color="primary"
            >
              Take Test
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default MyCourseTest;
