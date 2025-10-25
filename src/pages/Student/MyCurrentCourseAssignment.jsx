import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Assignment,
  Quiz,
  VideoLibrary,
  School,
  TrendingUp,
  FilterList,
  Visibility,
  PlayArrow,
  CheckCircle,
  Cancel,
  AccessTime,
  Close,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import DataTable from "../../components/DataTable";
import DropdownField from "../../components/DropdownField";
import CourseCompletionStats from "../../components/CourseCompletionStats";
import TuitionCompletionStats from "../StudentPannel/TuitionCompletionStats";
import usePaginatedData from "../../hooks/usePaginatedData";

const prefix = process.env.REACT_APP_STUDENT_PREFIX;

const chooseTitle = [
  {
    id: "TopicContent", 
    name: "📚 Topic Content",
    icon: VideoLibrary,
    color: "#2196f3",
    gradient: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
    columns: [
      { key: "name", label: "📖 Topic Name" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" },
    ],
    viewPathPrefix: `/${prefix}/topic/content/view`
  },
  {
    id: "SubTopicContent", 
    name: "📑 SubTopic Content",
    icon: School,
    color: "#4caf50",
    gradient: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    columns: [
      { key: "sub_topic_name", label: "📝 Sub-Topic Name" },
      { key: "course_name", label: "📖 Course Name" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" },
     
    ],
    viewPathPrefix: `/${prefix}/subtopic/content/view`
  },
  {
    id: "TopicTest", 
    name: "🎯 Topic Test",
    icon: Quiz,
    color: "#ff9800",
    gradient: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    columns: [
      { key: "test_name", label: "🎯 Topic Test" },
      { key: "course_name", label: "📖 Topic" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" },
      { 
        key: "test_progress", 
        label: "📊 Test Progress",
        render: (row) => {
          const progress = row.test_progress;
          if (!progress || progress.total_attempts === 0) {
            return <Chip label="No Attempts" size="small" sx={{ bgcolor: 'grey.300', color: 'grey.700' }} />;
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Chip 
                    label={`${progress.total_attempts} Attempts`}
                    size="small" 
                    sx={{ bgcolor: 'info.main', color: 'white' }}
                  />
                  <Chip 
                    label={`Best: ${progress.best_score}%`}
                    size="small" 
                    sx={{ bgcolor: 'success.main', color: 'white' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Latest: {progress.latest_score}% | Avg: {progress.average_score}%
                </Typography>
              </Box>
              <Tooltip title="View Detailed Analytics" arrow>
                <IconButton
                  size="small"
                  data-analytics={JSON.stringify({
                    ...progress,
                    testName: row.test_name,
                    courseName: row.course_name,
                    contentType: 'TopicTest'
                  })}
                  sx={{
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    color: 'white',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Visibility sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
      }
    ],
    viewPathPrefix: `/${prefix}/topic/test`
  },
  {
    id: "SubTopicTest", 
    name: "🧪 SubTopic Test",
    icon: Assignment,
    color: "#e91e63",
    gradient: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
    columns: [
      { key: "test_name", label: "🧪 Sub-Topic Test" },
      { key: "sub_topic_name", label: "📝 Sub-Topic" },
      { key: "topic_name", label: "📖 Topic" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" },
      { 
        key: "test_progress", 
        label: "📊 Test Progress",
        render: (row) => {
          const progress = row.test_progress;
          if (!progress || progress.total_attempts === 0) {
            return <Chip label="No Attempts" size="small" sx={{ bgcolor: 'grey.300', color: 'grey.700' }} />;
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Chip 
                    label={`${progress.total_attempts} Attempts`}
                    size="small" 
                    sx={{ bgcolor: 'info.main', color: 'white' }}
                  />
                  <Chip 
                    label={`Best: ${progress.best_score}%`}
                    size="small" 
                    sx={{ bgcolor: 'success.main', color: 'white' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Latest: {progress.latest_score}% | Avg: {progress.average_score}%
                </Typography>
              </Box>
              <Tooltip title="View Detailed Analytics" arrow>
                <IconButton
                  size="small"
                  data-analytics={JSON.stringify({
                    ...progress,
                    testName: row.test_name,
                    subTopicName: row.sub_topic_name,
                    topicName: row.topic_name,
                    contentType: 'SubTopicTest'
                  })}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Visibility sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
      }
    ],
    viewPathPrefix: `/${prefix}/subtopic/test`
  }
];

const MyCurrentCourseAssignment = () => {
  const { control, setValue } = useForm();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    subject_id: "",
    choose_title: "TopicContent", // Default to first option
    subjects: [],
  });

  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTestRecord, setSelectedTestRecord] = useState(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [completedContentInfo, setCompletedContentInfo] = useState(null);

  // Only fetch when both filters have values
  const shouldFetch = !!filters.subject_id && !!filters.choose_title;

  // Prepare queryParams only if both filters are present
  const queryParams = useMemo(() => {
    if (!shouldFetch) return {};
    return {
      subject_id: filters.subject_id,
      choose_title: filters.choose_title,
    };
  }, [filters.subject_id, filters.choose_title, shouldFetch]);

  const {
    data: assignments,
    loading,
    page,
    setPage,
    rowsPerPage,
    error
  } = usePaginatedData({
    endpoint: `${prefix}/current/assignment`,
    queryParams,
    enabled: shouldFetch,
    onError: (error) => {
      console.error('Assignment fetch error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        const message = error.response.data.message;
        // if (message?.includes('No course found')) {
        //   toast.warning('No course found for the selected subject.');
        // } else if (message?.includes('No assignment found')) {
        //   toast.warning('No assignment found for this course.');
        // } else if (message?.includes('Topics are not found')) {
        //   toast.warning('Topics are not found for this assignment.');
        // } else if (message?.includes('No Topic content record found')) {
        //   toast.warning('No content record found for the selected topic.');
        // } else {
        //   toast.warning(message || 'Content not found.');
        // }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          toast.error(errorMessages.join(', '));
        } else {
          toast.error(error.response.data.message || 'Validation error occurred.');
        }
      } else if (error.response?.status === 500) {
        toast.error(error.response.data.message || 'An error occurred while fetching assignments.');
      } else {
        toast.error('Failed to fetch assignments. Please try again.');
      }
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
    setPage(0);
  };

  // Check if content needs to be completed before viewing
  const handleViewClick = (row) => {
    const selectedChooseTitle = filters.choose_title;
    const selectedType = chooseTitle.find((col) => col.id === selectedChooseTitle);
    const viewPathPrefix = selectedType?.viewPathPrefix || '';
    
    // First check if content/test is already completed
    const isCompleted = row.completed === "YES" || 
                       row.completed === "yes" || 
                       row.completed === true || 
                       row.completed === 1 ||
                       row.completed_at;
    
    if (isCompleted) {
      // Content/Test is completed, show completion dialog
      setCompletedContentInfo({
        contentType: selectedType?.name || 'content',
        contentName: row.name || row.test_name || row.sub_topic_name || 'Unknown',
        completedAt: row.completed_at
      });
      setShowCompletedDialog(true);
      return;
    }
    
    // Check content completion based on type
    let needsCompletion = false;
    let completionMessage = "";
    let contentType = "";
    
    if (selectedChooseTitle === "TopicTest") {
      needsCompletion = row.topic_completed === "NO" || 
                       row.topic_completed === "no" || 
                       row.topic_completed === false || 
                       row.topic_completed === 0 ||
                       !row.topic_completed_at;
      
      if (needsCompletion) {
        completionMessage = "You need to complete the topic content before taking this test.";
        contentType = "Topic";
      }
    } else if (selectedChooseTitle === "SubTopicTest") {
      needsCompletion = row.sub_topic_completed === "NO" || 
                       row.sub_topic_completed === "no" || 
                       row.sub_topic_completed === false || 
                       row.sub_topic_completed === 0 ||
                       !row.sub_topic_completed_at;
      
      if (needsCompletion) {
        completionMessage = "You need to complete the subtopic content before taking this test.";
        contentType = "SubTopic";
      }
    }
    
    if (needsCompletion) {
      // Show completion dialog
      setPendingNavigation({
        path: `${viewPathPrefix}/${row.id}`,
        testName: row.test_name || row.name,
        contentType: contentType,
        message: completionMessage
      });
      setShowCompletionDialog(true);
    } else {
      // Navigate directly
      navigate(`${viewPathPrefix}/${row.id}`);
    }
  };

  useEffect(() => {
    const fetching = async () => {
      try {
        const { data } = await api.get(`${prefix}/fetch/subjects`);
        const dataList = data?.data || [];

        if (dataList.length > 0) {
          setFilters((prev) => ({
            ...prev,
            subjects: dataList,
            // Only set subject_id if empty
            subject_id: prev.subject_id || String(dataList[0].id),
          }));
          setValue("subject_id", String(dataList[0].id));
        }

        // Set choose_title to default value
        setValue("choose_title", "TopicContent");
      } catch {
        toast.error("Failed to fetch subjects");
      } finally {
        // Always set loading to false regardless of success or error
        setDropdownLoading(false);
      }
    };

    fetching();
  }, []); // empty deps - run once on mount

  // Handle analytics button clicks
  useEffect(() => {
    const handleAnalyticsClick = (e) => {
      const button = e.target.closest('[data-analytics]');
      if (button) {
        e.stopPropagation();
        try {
          const analyticsData = JSON.parse(button.getAttribute('data-analytics'));
          
          // Eye icon should always show analytics modal regardless of completion status
          setSelectedTestRecord(analyticsData);
          setShowTestModal(true);
        } catch (error) {
          console.error('Error parsing analytics data:', error);
        }
      }
    };

    document.addEventListener('click', handleAnalyticsClick);
    return () => document.removeEventListener('click', handleAnalyticsClick);
  }, [setSelectedTestRecord, setShowTestModal]);

  const isFilterSelected = filters.subject_id && filters.choose_title;

  const columns = useMemo(() => {
    const baseColumns = [{ key: "id", label: "Order Id" }];
    let viewPathPrefix = "";

    const selected = chooseTitle.find((col) => col.id === filters.choose_title);

    if (selected) {
      baseColumns.push(...selected.columns);
      viewPathPrefix = selected.viewPathPrefix;
    }

    baseColumns.push({
      key: "action",
      label: "🔧 Action",
      render: (row) => {
        const selectedType = chooseTitle.find((col) => col.id === filters.choose_title);
        const hasTests = row.test_track_record && row.test_track_record.total_tests > 0;
        
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="View Content" arrow>
              <IconButton
                onClick={() => handleViewClick(row)}
                sx={{
                  background: selectedType?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Visibility sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            
            {hasTests && (
              <Tooltip title="View Test Details" arrow>
                <IconButton
                  onClick={() => {
                    setSelectedTestRecord({
                      ...row.test_track_record,
                      contentName: row.name || row.sub_topic_name || 'Content',
                      contentType: filters.choose_title
                    });
                    setShowTestModal(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Quiz sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    });

    return baseColumns;
  }, [filters, navigate]);

  const fields = [
    {
      name: "choose_title",
      label: "Title",
      options: chooseTitle,
      loading: dropdownLoading,
      onChange: (value) => handleFilterChange("choose_title", String(value)),
      defaultValue: filters.choose_title,
    },
    {
      name: "subject_id",
      label: "Subject",
      options: filters.subjects,
      loading: dropdownLoading,
      onChange: (value) => handleFilterChange("subject_id", String(value)),
      defaultValue: filters.subject_id,
    },
  ];

  const selectedType = chooseTitle.find((col) => col.id === filters.choose_title);
  const IconComponent = selectedType?.icon || Assignment;

  return (
    <Box sx={{ 
      py: 4,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Card sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{
                background: 'rgba(255,255,255,0.2)',
                width: 60,
                height: 60,
                backdropFilter: 'blur(10px)'
              }}>
                <TrendingUp sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  📚 My Current Course Assignments
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Track your learning progress across all subjects and topics
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Stats Section */}
      <Fade in timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <TuitionCompletionStats />
        </Box>
      </Fade>

      {/* Course Completion Statistics */}
      {isFilterSelected && (
        <Fade in timeout={800}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
            overflow: 'hidden',
            mb: 4
          }}>
        
            
            <CardContent sx={{ p: 4 }}>
              <CourseCompletionStats 
                subjectId={filters.subject_id}
                chooseTitle={filters.choose_title}
              />
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Filters Section */}
      <Fade in timeout={1200}>
        <Card sx={{
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                width: 40,
                height: 40
              }}>
                <FilterList sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                🎯 Filter Your Content
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {fields.map((field) => (
                <Grid item xs={12} md={12} key={field.name}>
                  <DropdownField
                    control={control}
                    name={field.name}
                    label={field.label}
                    options={field.options}
                    loading={field.loading}
                    onChange={field.onChange}
                    defaultValue={field.defaultValue}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Selected Type Display */}
            {selectedType && (
              <Box sx={{ mt: 3, p: 2, borderRadius: '12px', background: 'rgba(102, 126, 234, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{
                    background: selectedType.gradient,
                    width: 32,
                    height: 32
                  }}>
                    <IconComponent sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Currently viewing: {selectedType.name}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Content Type Cards */}
      <Fade in timeout={1400}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
            📋 Available Content Types
          </Typography>
          <Grid container spacing={2}>
            {chooseTitle.map((type, index) => {
              const TypeIcon = type.icon;
              const isSelected = filters.choose_title === type.id;
              return (
                <Grid item xs={12} sm={6} md={3} key={type.id}>
                  <Card sx={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    background: isSelected ? type.gradient : 'rgba(255,255,255,0.9)',
                    color: isSelected ? 'white' : '#2c3e50',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }
                  }}
                  onClick={() => handleFilterChange('choose_title', type.id)}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Avatar sx={{
                        background: isSelected ? 'rgba(255,255,255,0.2)' : type.gradient,
                        color: isSelected ? 'white' : 'white',
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2
                      }}>
                        <TypeIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {type.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Fade>

      {/* Data Table Section */}
      <Fade in timeout={1600}>
        <Card sx={{
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            background: selectedType?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                background: 'rgba(255,255,255,0.2)',
                width: 40,
                height: 40
              }}>
                <IconComponent sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedType?.name || '📊 Assignment Data'}
                </Typography>
               
              </Box>
            </Box>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            <DataTable
              loading={loading}
              data={assignments}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              isFilterSelected={isFilterSelected}
              columns={columns}
            />
          </CardContent>
        </Card>
      </Fade>

      {/* Test Details Modal */}
      <Dialog 
        open={showTestModal} 
        onClose={() => setShowTestModal(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, position: 'relative' }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 15% 85%, rgba(33, 150, 243, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(255, 152, 0, 0.08) 0%, transparent 50%)',
            zIndex: 0
          }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Animated Analytics Icon */}
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)',
                  animation: 'analyticsGlow 3s ease-in-out infinite',
                  '@keyframes analyticsGlow': {
                    '0%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)' },
                    '50%': { transform: 'scale(1.03)', boxShadow: '0 12px 40px rgba(33, 150, 243, 0.6)' },
                    '100%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)' }
                  }
                }}>
                  <Quiz sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                
                {/* Floating data points */}
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    width: '3px',
                    height: '3px',
                    background: '#2196f3',
                    borderRadius: '50%',
                    animation: 'dataFloat 4s ease-in-out infinite'
                  },
                  '&::before': {
                    top: '15%',
                    right: '20%',
                    animationDelay: '0s'
                  },
                  '&::after': {
                    bottom: '20%',
                    left: '25%',
                    animationDelay: '2s'
                  },
                  '@keyframes dataFloat': {
                    '0%, 100%': { transform: 'translateY(0px) scale(1)', opacity: 0.6 },
                    '50%': { transform: 'translateY(-8px) scale(1.3)', opacity: 1 }
                  }
                }} />
              </Box>
              
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, color: '#1565c0' }}>
                  📊 Test Analytics Dashboard
                </Typography>
                <Typography variant="h6" sx={{ color: '#424242', fontWeight: 400 }}>
                  {selectedTestRecord?.testName || selectedTestRecord?.contentName} - {selectedTestRecord?.contentType}
                </Typography>
              </Box>
            </Box>
            
            <IconButton 
              onClick={() => setShowTestModal(false)}
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Close sx={{ color: '#666' }} />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedTestRecord && (selectedTestRecord.contentType === 'SubTopicTest' || selectedTestRecord.contentType === 'TopicTest') && (
            <Box>
              {/* Overview Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)', 
                    border: '2px solid rgba(33, 150, 243, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(33, 150, 243, 0.25)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        fontSize: '24px'
                      }}>
                        🎯
                      </Box>
                      <Typography variant="h3" fontWeight={700} sx={{ color: '#1565c0', mb: 1 }}>
                        {selectedTestRecord.total_attempts}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#424242', fontWeight: 500 }}>
                        Total Attempts
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)', 
                    border: '2px solid rgba(76, 175, 80, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(76, 175, 80, 0.25)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        fontSize: '24px'
                      }}>
                        🏆
                      </Box>
                      <Typography variant="h3" fontWeight={700} sx={{ color: '#2e7d32', mb: 1 }}>
                        {selectedTestRecord.best_score}%
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#424242', fontWeight: 500 }}>
                        Best Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff8e1 100%)', 
                    border: '2px solid rgba(255, 152, 0, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(255, 152, 0, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(255, 152, 0, 0.25)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        fontSize: '24px'
                      }}>
                        📈
                      </Box>
                      <Typography variant="h3" fontWeight={700} sx={{ color: '#ef6c00', mb: 1 }}>
                        {selectedTestRecord.latest_score}%
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#424242', fontWeight: 500 }}>
                        Latest Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)', 
                    border: '2px solid rgba(156, 39, 176, 0.2)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(156, 39, 176, 0.25)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        fontSize: '24px'
                      }}>
                        📊
                      </Box>
                      <Typography variant="h3" fontWeight={700} sx={{ color: '#7b1fa2', mb: 1 }}>
                        {selectedTestRecord.average_score}%
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#424242', fontWeight: 500 }}>
                        Average Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Performance Analytics */}
              {selectedTestRecord.performance_analytics && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      p: 4, 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
                      border: '2px solid rgba(76, 175, 80, 0.2)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(76, 175, 80, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Background decoration */}
                      <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(76, 175, 80, 0.1)',
                        zIndex: 0
                      }} />
                      
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                          }}>
                            💪
                          </Box>
                          <Typography variant="h5" fontWeight={700} sx={{ color: '#2e7d32' }}>
                            Strong Areas
                          </Typography>
                        </Box>
                        
                        {selectedTestRecord.performance_analytics.strong_areas?.map((area, index) => (
                          <Box key={index} sx={{ 
                            mb: 2, 
                            p: 3, 
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)', 
                            borderRadius: 3,
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
                            }
                          }}>
                            <Typography variant="body1" fontWeight={600} sx={{ color: '#2e7d32', mb: 1 }}>
                              Question {area.question_id}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#424242' }}>
                              Correct: {area.correct_count} times | Mastery: {area.mastery_level}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      p: 4, 
                      background: 'linear-gradient(135deg, #ffffff 0%, #fff8e1 100%)',
                      border: '2px solid rgba(255, 152, 0, 0.2)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(255, 152, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Background decoration */}
                      <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255, 152, 0, 0.1)',
                        zIndex: 0
                      }} />
                      
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                          }}>
                            📚
                          </Box>
                          <Typography variant="h5" fontWeight={700} sx={{ color: '#ef6c00' }}>
                            Areas for Improvement
                          </Typography>
                        </Box>
                        
                        {selectedTestRecord.performance_analytics.weak_areas?.map((area, index) => (
                          <Box key={index} sx={{ 
                            mb: 2, 
                            p: 3, 
                            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', 
                            borderRadius: 3,
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
                            }
                          }}>
                            <Typography variant="body1" fontWeight={600} sx={{ color: '#ef6c00', mb: 1 }}>
                              Question {area.question_id}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#424242' }}>
                              Incorrect: {area.incorrect_count} times | Difficulty: {area.difficulty_level}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Attempt History */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                📈 Attempt History
              </Typography>
              
              <Grid container spacing={2}>
                {selectedTestRecord.attempt_history?.map((attempt, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>
                            Attempt #{attempt.attempt_number}
                          </Typography>
                          <Chip 
                            label={`${attempt.score_percentage}%`}
                            sx={{ 
                              bgcolor: attempt.score_percentage >= 70 ? 'success.main' : 
                                      attempt.score_percentage >= 50 ? 'warning.main' : 'error.main',
                              color: 'white'
                            }}
                          />
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="success.main">
                                {attempt.correct_answers}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Correct
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="error.main">
                                {attempt.incorrect_answers}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Incorrect
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="warning.main">
                                {attempt.unanswered}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Unanswered
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Time Spent
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {Math.floor(attempt.total_time_spent_seconds / 60)}m {attempt.total_time_spent_seconds % 60}s
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Avg Time/Question
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {attempt.average_time_per_question.toFixed(1)}s
                          </Typography>
                        </Box>
                        {attempt.improvement_from_previous !== 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Improvement
                            </Typography>
                            <Typography 
                              variant="caption" 
                              fontWeight={600}
                              color={attempt.improvement_from_previous > 0 ? 'success.main' : 'error.main'}
                            >
                              {attempt.improvement_from_previous > 0 ? '+' : ''}{attempt.improvement_from_previous}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Fallback for old test_track_record format */}
          {selectedTestRecord && selectedTestRecord.contentType !== 'SubTopicTest' && selectedTestRecord.contentType !== 'TopicTest' && (
            <Box>
              {/* Original test track record display */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" fontWeight={700}>
                        {selectedTestRecord.total_tests}
                      </Typography>
                      <Typography variant="body2">
                        Total Tests
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" fontWeight={700}>
                        {selectedTestRecord.attempted_tests}
                      </Typography>
                      <Typography variant="body2">
                        Attempted
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" fontWeight={700}>
                        {selectedTestRecord.completed_tests}
                      </Typography>
                      <Typography variant="body2">
                        Completed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" fontWeight={700}>
                        {selectedTestRecord.overall_score}%
                      </Typography>
                      <Typography variant="body2">
                        Overall Score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Progress Bar */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Test Completion Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTestRecord.completed_tests}/{selectedTestRecord.total_tests}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(selectedTestRecord.completed_tests / selectedTestRecord.total_tests) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                    }
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Individual Test Details */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                📝 Individual Test Details
              </Typography>
              
              <Grid container spacing={2}>
                {selectedTestRecord.test_details?.map((test, index) => (
                  <Grid item xs={12} key={test.test_id}>
                    <Card sx={{ 
                      border: '1px solid',
                      borderColor: test.is_completed ? 'success.main' : 'warning.main',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                              {test.test_name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                icon={test.is_completed ? <CheckCircle /> : <Cancel />}
                                label={test.is_completed ? 'Completed' : 'In Progress'}
                                color={test.is_completed ? 'success' : 'warning'}
                                size="small"
                              />
                              <Chip 
                                label={`Score: ${test.score}%`}
                                color={test.score >= 70 ? 'success' : test.score >= 50 ? 'warning' : 'error'}
                                size="small"
                              />
                              <Chip 
                                label={`Attempts: ${test.attempts}`}
                                color="info"
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight={700} color={test.score >= 70 ? 'success.main' : 'warning.main'}>
                              {test.score}%
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="primary.main">
                                {test.total_questions}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Questions
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="success.main">
                                {test.correct_answers}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Correct
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="error.main">
                                {test.incorrect_answers}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Incorrect
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="warning.main">
                                {test.unanswered}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Unanswered
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {test.last_attempted && (
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              Last attempted: {new Date(test.last_attempted).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {(!selectedTestRecord.test_details || selectedTestRecord.test_details.length === 0) && (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Quiz sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No test details available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Test details will appear here once tests are attempted.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setShowTestModal(false)}
            variant="contained"
            sx={{ px: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Check Dialog */}
      <Dialog 
        open={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              background: pendingNavigation?.contentType === 'Topic' 
                ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                : 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              width: 40,
              height: 40
            }}>
              <Assignment sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                📚 Complete {pendingNavigation?.contentType} First
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pendingNavigation?.testName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {pendingNavigation?.message}
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: pendingNavigation?.contentType === 'Topic' ? 'warning.50' : 'success.50',
            border: '1px solid',
            borderColor: pendingNavigation?.contentType === 'Topic' ? 'warning.200' : 'success.200'
          }}>
            <Typography variant="body2" 
              color={pendingNavigation?.contentType === 'Topic' ? 'warning.main' : 'success.main'} 
              fontWeight={600}
            >
              📝 Test: {pendingNavigation?.testName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This test will be available after completing the {pendingNavigation?.contentType?.toLowerCase()} content.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setShowCompletionDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          {/* <Button 
            onClick={() => {
              setShowCompletionDialog(false);
              // Navigate to content page to complete first
              const contentPath = pendingNavigation?.contentType === 'Topic' 
                ? `/student/topic/content/view/${pendingNavigation?.path?.split('/').pop()}`
                : `/student/subtopic/content/view/${pendingNavigation?.path?.split('/').pop()}`;
              navigate(contentPath);
            }}
            variant="contained"
            sx={{ px: 4 }}
          >
            Go to {pendingNavigation?.contentType} Content
          </Button> */}
        </DialogActions>
      </Dialog>

      {/* Completed Content Dialog */}
      <Dialog 
        open={showCompletedDialog} 
        onClose={() => setShowCompletedDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
            color: '#2c3e50',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, position: 'relative' }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)',
            zIndex: 0
          }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
            {/* Animated Success Icon */}
            <Box sx={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)' },
                  '50%': { transform: 'scale(1.05)', boxShadow: '0 12px 40px rgba(76, 175, 80, 0.6)' },
                  '100%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)' }
                }
              }}>
                {/* Custom Checkmark */}
                <Box sx={{
                  width: 32,
                  height: 32,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '6px',
                    height: '12px',
                    border: '3px solid white',
                    borderTop: 'none',
                    borderLeft: 'none',
                    transform: 'translate(-50%, -60%) rotate(45deg)',
                    animation: 'checkmark 0.6s ease-in-out'
                  },
                  '@keyframes checkmark': {
                    '0%': { opacity: 0, transform: 'translate(-50%, -60%) rotate(45deg) scale(0)' },
                    '100%': { opacity: 1, transform: 'translate(-50%, -60%) rotate(45deg) scale(1)' }
                  }
                }} />
              </Box>
              
              {/* Floating particles */}
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: '#ffd700',
                  borderRadius: '50%',
                  animation: 'float 3s ease-in-out infinite'
                },
                '&::before': {
                  top: '10%',
                  left: '20%',
                  animationDelay: '0s'
                },
                '&::after': {
                  bottom: '15%',
                  right: '25%',
                  animationDelay: '1.5s'
                },
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px) scale(1)', opacity: 0.7 },
                  '50%': { transform: 'translateY(-10px) scale(1.2)', opacity: 1 }
                }
              }} />
            </Box>
            
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#2c3e50' }}>
                🎉 Mission Accomplished!
              </Typography>
              <Typography variant="h6" sx={{ color: '#5a6c7d', fontWeight: 400 }}>
                This content has been successfully completed
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, px: 4, pb: 2 }}>
          {completedContentInfo && (
            <Box>
              {/* Content Info Card */}
              <Box sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                borderRadius: 3, 
                border: '1px solid rgba(102, 126, 234, 0.1)',
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                {/* Shimmer effect */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shimmer 3s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' }
                  }
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ 
                    mb: 2, 
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      📚
                    </Box>
                    {completedContentInfo.contentType}
                  </Typography>
                  
                  <Typography variant="h6" fontWeight={500} sx={{ 
                    mb: 3, 
                    color: '#34495e',
                    background: 'linear-gradient(135deg, #e8f2ff 0%, #f0f7ff 100%)',
                    padding: '12px 16px',
                    borderRadius: 2,
                    border: '1px solid rgba(102, 126, 234, 0.15)'
                  }}>
                    {completedContentInfo.contentName}
                  </Typography>
                  
                  {completedContentInfo.completedAt && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                      padding: '12px 16px',
                      borderRadius: 2,
                      border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ⏰
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#5a6c7d', mb: 0.5 }}>
                          Completed on:
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ color: '#2c3e50' }}>
                          {new Date(completedContentInfo.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Achievement Message */}
              <Box sx={{ 
                p: 4, 
                background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
                borderRadius: 3, 
                border: '1px solid rgba(255, 193, 7, 0.2)',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(255, 193, 7, 0.1)'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                  🏆 Outstanding Achievement!
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#34495e' }}>
                  You have successfully mastered this content and earned your completion badge.
                </Typography>
                <Typography variant="body2" sx={{ color: '#5a6c7d', lineHeight: 1.6 }}>
                  This content is now locked to preserve your learning journey integrity. 
                  Your progress has been saved and you can view your achievements in the dashboard.
                </Typography>
                
                {/* Decorative stars */}
                <Box sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '20px',
                  fontSize: '20px',
                  animation: 'twinkle 2s ease-in-out infinite',
                  '@keyframes twinkle': {
                    '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.2)' }
                  }
                }}>
                  ⭐
                </Box>
                <Box sx={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '25px',
                  fontSize: '16px',
                  animation: 'twinkle 2s ease-in-out infinite',
                  animationDelay: '1s'
                }}>
                  ✨
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button 
            onClick={() => setShowCompletedDialog(false)}
            fullWidth
            sx={{ 
              py: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: 3,
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '18px' }}>👍</Typography>
              Got it, Thanks!
            </Box>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCurrentCourseAssignment;
