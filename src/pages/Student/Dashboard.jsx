import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  TrendingUp,
  Assignment,
  Schedule,
  CheckCircle,
  AccessTime,
  School,
  BookmarkBorder,
  Refresh,
} from "@mui/icons-material";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import PieChartIcon from "@mui/icons-material/PieChartOutline";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { toast } from "react-toastify";
import api from "../../api";
import logout from "../../logout";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get performance color
const getPerformanceColor = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
};

const StatCard = ({ title, value, subtitle, icon, gradient, loading = false }) => (
  <Card
    sx={{
      background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '16px',
      p: 3,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
    <Box sx={{ position: 'relative', zIndex: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      
      {loading ? (
        <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      ) : (
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
      )}
      
      {subtitle && (
        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '12px' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Card>
);

const PerformanceChart = ({ title, subject, data, loading }) => {
  const [viewType, setViewType] = useState("bar");
  
  // Ensure data is always an array
  const chartData = data || [];
  const labels = chartData.map((item, index) => item.week_label || item.week_number || `Week ${index + 1}`);
  const values = chartData.map(item => item.average_percentage || 0);

  const getGradient = (context) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    return gradient;
  };

  const pieColors = ["#667eea", "#764ba2", "#F39C12", "#2ECC71", "#9B59B6"];

  const chartDataConfig = {
    labels,
    datasets: [
      {
        label: subject || 'Performance',
        data: values,
        backgroundColor: viewType === "pie" ? pieColors : getGradient,
        borderColor: "#667eea",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: viewType === "pie" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    },
    scales:
      viewType === "pie"
        ? {}
        : {
            y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
            x: { grid: { display: false } },
          },
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon color="primary" />
          {title}
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(e, val) => val && setViewType(val)}
          size="small"
        >
          <ToggleButton value="bar"><BarChartIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="line"><ShowChartIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="progress"><LinearScaleIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="pie"><PieChartIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {subject && (
        <Typography sx={{ fontSize: "14px", color: "#777", mb: 2 }}>
          Subject: {subject}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : chartData.length > 0 ? (
        <>
          {viewType === "bar" && <Box sx={{ height: 300 }}><Bar data={chartDataConfig} options={chartOptions} /></Box>}
          {viewType === "line" && <Box sx={{ height: 300 }}><Line data={chartDataConfig} options={chartOptions} /></Box>}
          {viewType === "pie" && <Box sx={{ height: 350 }}><Pie data={chartDataConfig} options={chartOptions} /></Box>}
          {viewType === "progress" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {chartData.map((item, index) => (
                <Box key={index}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {item.week_label || item.week_number || `Week ${index + 1}`} - {item.average_percentage || 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={item.average_percentage || 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#eee",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#667eea",
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No performance data available for selected subject
          </Typography>
        </Box>
      )}
    </Card>
  );
};

const Dashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [subjectsData, setSubjectsData] = useState([]);
  const [weeklyPerformance, setWeeklyPerformance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // API Functions
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('student/dashboard');
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        return;
      }
      
      if (err.response?.status === 404) {
        setError('No dashboard data found. Please contact support.');
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data. Please try again.');
    }
  };

  const fetchAssignedSubjects = async () => {
    try {
      const response = await api.get('student/assigned/subjects');
      
      if (response.data.success) {
        const subjects = response.data.data.subjects || [];
        setSubjectsData(subjects);
        
        // Auto-select first subject for performance chart
        if (subjects.length > 0 && !selectedSubject) {
          setSelectedSubject(subjects[0].id);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch subjects');
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      
      if (err.response?.status === 401) {
        logout();
        return;
      }
      
      toast.error('Failed to load subjects data.');
    }
  };

  const fetchWeeklyPerformance = async (subjectId) => {
    if (!subjectId) return;
    
    setPerformanceLoading(true);
    try {
      const response = await api.post('student/weekly-performance', {
        subject_id: subjectId
      });
      
      if (response.data.success) {
        setWeeklyPerformance(response.data.data.weekly_performance || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch performance data');
      }
    } catch (err) {
      console.error('Error fetching weekly performance:', err);
      
      if (err.response?.status === 401) {
        logout();
        return;
      }
      
      if (err.response?.status === 404) {
        setWeeklyPerformance([]);
        toast.info('No performance data found for this subject.');
        return;
      }
      
      toast.error('Failed to load performance data.');
      setWeeklyPerformance([]);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchAssignedSubjects()
      ]);
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchWeeklyPerformance(selectedSubject);
    }
  }, [selectedSubject]);

  // Get selected subject name for display
  const selectedSubjectName = useMemo(() => {
    const subject = subjectsData.find(s => s.id === selectedSubject);
    return subject?.name || 'Select Subject';
  }, [subjectsData, selectedSubject]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#F5F7FA", minHeight: "100vh" }}>
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
              }}
            >
              <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'white',
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                Student Dashboard
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                📊 Track your progress and continue your learning journey
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Weekly Progress" 
            value={
              loading ? 'Loading...' : 
              (dashboardData?.current_week_progress?.progress_percentage !== undefined && dashboardData?.current_week_progress?.progress_percentage !== null) 
                ? `${Math.round(dashboardData.current_week_progress.progress_percentage)}%` 
                : '0%'
            }
            subtitle={
              loading ? 'Loading...' : 
              dashboardData?.current_week_progress?.status || 'No current week data'
            }
            icon={<TrendingUp />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Topics Completed" 
            value={
              loading ? 'Loading...' : 
              dashboardData?.topic_completion 
                ? `${dashboardData.topic_completion.completed_topics || 0}/${dashboardData.topic_completion.total_topics || 0}` 
                : '0/0'
            }
            subtitle={
              loading ? 'Loading...' : 
              dashboardData?.topic_completion?.completion_percentage !== undefined 
                ? `${Math.round(dashboardData.topic_completion.completion_percentage)}% Complete` 
                : '0% Complete'
            }
            icon={<CheckCircle />}
            gradient="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Current Week Tests" 
            value={
              loading ? 'Loading...' : 
              dashboardData?.current_week_progress 
                ? `${dashboardData.current_week_progress.tests_completed || 0}/${dashboardData.current_week_progress.total_tests || 0}` 
                : '0/0'
            }
            subtitle={
              loading ? 'Loading...' : 
              dashboardData?.current_week_progress?.average_score !== undefined 
                ? `Avg: ${Math.round(dashboardData.current_week_progress.average_score)}%` 
                : 'No tests completed'
            }
            icon={<Assignment />}
            gradient="linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Upcoming Tests" 
            value={
              loading ? 'Loading...' : 
              String(dashboardData?.upcoming_tests?.count || 0)
            }
            subtitle={
              loading ? 'Loading...' : 
              dashboardData?.upcoming_tests?.description || 'No upcoming tests'
            }
            icon={<Schedule />}
            gradient="linear-gradient(135deg, #E91E63 0%, #C2185B 100%)"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Select Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!subjectsData.length}
              >
                {subjectsData.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School fontSize="small" />
                      {subject.name}
                      <Chip 
                        label={`${subject.completion_percentage}%`}
                        size="small"
                        color={getPerformanceColor(subject.completion_percentage)}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <PerformanceChart
            title="Weekly Performance"
            subject={selectedSubjectName}
            data={weeklyPerformance}
            loading={performanceLoading}
          />
        </Grid>

        {/* Subjects Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookmarkBorder color="primary" />
              Assigned Subjects
            </Typography>
            
            {subjectsData.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {subjectsData.map((subject) => (
                  <Card key={subject.id} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {subject.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {subject.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {subject.code}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${subject.completion_percentage}%`}
                        size="small"
                        color={getPerformanceColor(subject.completion_percentage)}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={subject.completion_percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.300',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: subject.completion_percentage >= 80 ? '#4CAF50' : 
                                          subject.completion_percentage >= 60 ? '#FF9800' : '#F44336',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {subject.completed_topics}/{subject.total_topics} topics completed
                    </Typography>
                    {subject.last_accessed && (
                      <Typography variant="caption" color="text.secondary">
                        Last accessed: {formatDate(subject.last_accessed)}
                      </Typography>
                    )}
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No subjects assigned yet
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
