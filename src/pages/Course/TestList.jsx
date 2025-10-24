import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Divider, Grid,
  MenuItem, FormControl, InputLabel, Select, Button, Skeleton,
  Card, CardContent, Avatar, IconButton, Badge, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api';
import QuizIcon from '@mui/icons-material/Quiz';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import TopicIcon from '@mui/icons-material/Topic';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TestList = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    academic_course_id: '',
    subject_id: '',
    assignment_id: '',
    course_topic_id: '',
    course_subtopic_id: '',
  });

  const [dropdownData, setDropdownData] = useState({
    academicCourses: [],
    subjects: [],
    assignments: [],
    topics: [],
    subtopics: [],
  });

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchTests(false);
    api.get('admin/ca_records')
      .then(res => {
        const courses = (res.data.data || []).map(item => ({ id: item.id, name: item.name }));
        setDropdownData(prev => ({ ...prev, academicCourses: courses }));
      })
      .catch(() => toast.error('Failed to fetch academic courses'));
  }, []);

  useEffect(() => {
    const { academic_course_id } = filters;
    if (!academic_course_id) return;

    api.get(`admin/ca_based_weeks_subjects/${academic_course_id}`)
      .then(res => {
        const { subjects = [], assignments = [] } = res.data.data || {};
        setDropdownData(prev => ({
          ...prev,
          subjects,
          assignments,
          topics: [],
          subtopics: [],
        }));

        setFilters(prev => ({
          ...prev,
          subject_id: '',
          assignment_id: '',
          course_topic_id: '',
          course_subtopic_id: '',
        }));
      })
      .catch(() => toast.error('Failed to fetch subjects & assignments'));
  }, [filters.academic_course_id]);

  useEffect(() => {
    const { subject_id, assignment_id } = filters;
    if (!subject_id || !assignment_id) return;

    api.get(`admin/fetch/course/topic/${subject_id}/${assignment_id}`)
      .then(res => {
        setDropdownData(prev => ({
          ...prev,
          topics: res.data.data || [],
          subtopics: [],
        }));

        setFilters(prev => ({
          ...prev,
          course_topic_id: '',
          course_subtopic_id: '',
        }));
      })
      .catch(() => toast.error('Failed to fetch topics'));
  }, [filters.subject_id, filters.assignment_id]);

  useEffect(() => {
    const { course_topic_id } = filters;
    if (!course_topic_id) return;

    api.get(`admin/fetch/course/subtopic/${course_topic_id}`)
      .then(res => {
        setDropdownData(prev => ({
          ...prev,
          subtopics: res.data.data || [],
        }));

        setFilters(prev => ({ ...prev, course_subtopic_id: '' }));
      })
      .catch(() => toast.error('Failed to fetch subtopics'));
  }, [filters.course_topic_id]);

  const handleChange = (key) => (event) => {
    setFilters(prev => ({ ...prev, [key]: String(event.target.value) }));
  };

  const fetchTests = async (applyFilters = true) => {
    setLoading(true);
    try {
      const params = applyFilters ? filters : {};
      const res = await api.get('admin/assign/test', { params });
      const responseData = res.data.data?.data;
      setTests(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
      toast.error('Failed to fetch test data');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 56,
            height: 56
          }}>
            <QuizIcon sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Test Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all course tests
            </Typography>
          </Box>
        </Box>
        
        <Button
          onClick={() => navigate('/admin/course-test')}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          Create New Test
        </Button>
      </Box>

      {/* Filters Card */}
      <Card sx={{ 
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              width: 48,
              height: 48
            }}>
              <FilterListIcon sx={{ color: 'white' }} />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Filter Tests
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  background: 'white',
                  px: 1,
                  '&.Mui-focused': { color: '#667eea' }
                }}>
                  🎓 Academic Course
                </InputLabel>
                <Select
                  value={filters.academic_course_id}
                  label="🎓 Academic Course"
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    academic_course_id: String(e.target.value),
                    subject_id: '',
                    assignment_id: '',
                    course_topic_id: '',
                    course_subtopic_id: '',
                  }))}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(102, 126, 234, 0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea'
                    }
                  }}
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {dropdownData.academicCourses.map((opt) => (
                    <MenuItem key={opt.id} value={String(opt.id)}>{opt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {[
              { key: 'subject_id', label: 'Subject', icon: '📚', options: dropdownData.subjects },
              { key: 'assignment_id', label: 'Assignment', icon: '📝', options: dropdownData.assignments },
              { key: 'course_topic_id', label: 'Topic', icon: '📖', options: dropdownData.topics },
              { key: 'course_subtopic_id', label: 'Subtopic', icon: '📄', options: dropdownData.subtopics },
            ].map(({ key, label, icon, options }) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    background: 'white',
                    px: 1,
                    '&.Mui-focused': { color: '#667eea' }
                  }}>
                    {icon} {label}
                  </InputLabel>
                  <Select 
                    value={filters[key]} 
                    label={`${icon} ${label}`} 
                    onChange={handleChange(key)}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(102, 126, 234, 0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      }
                    }}
                  >
                    <MenuItem value="">All {label}s</MenuItem>
                    {options.map((opt) => (
                      <MenuItem key={opt.id || opt._id} value={String(opt.id || opt._id)}>
                        {opt.name || opt.assignment_name || opt.subject_name || opt.topic_name || opt.subtopic_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}

            <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                onClick={() => fetchTests(true)}
                variant="contained"
                startIcon={<SearchIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                  }
                }}
                fullWidth
              >
                Apply Filters
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setFilters({
                    academic_course_id: '',
                    subject_id: '',
                    assignment_id: '',
                    course_topic_id: '',
                    course_subtopic_id: '',
                  });
                  fetchTests(false);
                }}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#f57c00',
                    background: 'rgba(255, 152, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
                fullWidth
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tests Section */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} key={i}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : tests.length === 0 ? (
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          py: 8
        }}>
          <CardContent>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3
            }}>
              <QuizIcon sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              No Tests Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No tests match the selected criteria. Try adjusting your filters or create a new test.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
                      📝 Test Name
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
                      🎓 Course
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
                      📚 Subject
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
                      📖 Topic
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
                      📄 Subtopic
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>
                      ❓ Questions
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>
                      🔧 Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tests.map((test, index) => (
                    <TableRow 
                      key={index}
                      sx={{
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                        },
                        '&:nth-of-type(even)': {
                          background: 'rgba(0,0,0,0.02)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
                            width: 40,
                            height: 40
                          }}>
                            <QuizIcon sx={{ fontSize: 20, color: 'white' }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {test.test_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<SchoolIcon />}
                          label={test.course_name} 
                          size="small" 
                          sx={{ 
                            background: '#e3f2fd', 
                            color: '#1976d2',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={test.subject_name} 
                          size="small" 
                          sx={{ 
                            background: '#e8f5e8', 
                            color: '#2e7d32',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<TopicIcon />}
                          label={test.topic_name} 
                          size="small" 
                          sx={{ 
                            background: '#fff3e0', 
                            color: '#f57c00',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {test.subtopic_name ? (
                          <Chip 
                            label={test.subtopic_name} 
                            size="small" 
                            sx={{ 
                              background: '#fce4ec', 
                              color: '#c2185b',
                              fontWeight: 600
                            }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            No subtopic
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Badge 
                          // badgeContent={test.questions?.length || 0} 
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '12px',
                              fontWeight: 600
                            }
                          }}
                        >
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: 32,
                            height: 32,
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            {test.questions?.length || 0}
                          </Avatar>
                        </Badge>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setSelectedTest(test);
                            setModalOpen(true);
                          }}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            px: 2,
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '12px',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Test Details Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              background: 'rgba(255,255,255,0.2)',
              width: 48,
              height: 48
            }}>
              <QuizIcon sx={{ fontSize: 24, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {selectedTest?.test_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Test Details & Questions
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setModalOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {selectedTest && (
            <Box>
              {/* Test Information */}
              <Card sx={{ 
                mb: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    📋 Test Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Course
                        </Typography>
                        <Chip 
                          icon={<SchoolIcon />}
                          label={selectedTest.course_name} 
                          sx={{ 
                            background: '#e3f2fd', 
                            color: '#1976d2',
                            ml: 1,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Subject
                        </Typography>
                        <Chip 
                          label={selectedTest.subject_name} 
                          sx={{ 
                            background: '#e8f5e8', 
                            color: '#2e7d32',
                            ml: 1,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Topic
                        </Typography>
                        <Chip 
                          icon={<TopicIcon />}
                          label={selectedTest.topic_name} 
                          sx={{ 
                            background: '#fff3e0', 
                            color: '#f57c00',
                            ml: 1,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Grid>
                    {selectedTest.subtopic_name && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Subtopic
                          </Typography>
                          <Chip 
                            label={selectedTest.subtopic_name} 
                            sx={{ 
                              background: '#fce4ec', 
                              color: '#c2185b',
                              ml: 1,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Total Questions:
                        </Typography>
                        <Badge 
                          badgeContent={selectedTest.questions?.length || 0} 
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '14px',
                              fontWeight: 700,
                              px: 1
                            }
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            Questions
                          </Typography>
                        </Badge>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Questions Table */}
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 3
                  }}>
                    <Typography variant="h6" fontWeight={600}>
                      📝 Test Questions ({selectedTest.questions?.length || 0})
                    </Typography>
                  </Box>
                  
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#495057',
                            borderBottom: '2px solid #667eea'
                          }}>
                            #
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#495057',
                            borderBottom: '2px solid #667eea'
                          }}>
                            📝 Question
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#495057',
                            borderBottom: '2px solid #667eea'
                          }}>
                            🔤 Options
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#495057',
                            borderBottom: '2px solid #667eea'
                          }}>
                            ✅ Correct Answer
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 700, 
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: '#495057',
                            borderBottom: '2px solid #667eea'
                          }}>
                            ⏱️ Duration
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTest.questions?.map((q, qIdx) => (
                          <TableRow 
                            key={qIdx} 
                            sx={{ 
                              '&:hover': { 
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' 
                              },
                              '&:nth-of-type(even)': { 
                                background: 'rgba(0,0,0,0.02)' 
                              }
                            }}
                          >
                            <TableCell>
                              <Avatar sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                width: 32,
                                height: 32,
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'white'
                              }}>
                                {qIdx + 1}
                              </Avatar>
                            </TableCell>
                            <TableCell sx={{ maxWidth: '300px' }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 500,
                                lineHeight: 1.4
                              }}>
                                {q.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {q.options?.map((opt, i) => (
                                  <Chip 
                                    key={i} 
                                    label={`${String.fromCharCode(65 + i)}. ${opt.name}`}
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      fontSize: '12px',
                                      height: '28px',
                                      justifyContent: 'flex-start',
                                      borderColor: 'rgba(102, 126, 234, 0.3)',
                                      '&:hover': {
                                        borderColor: '#667eea',
                                        background: 'rgba(102, 126, 234, 0.1)'
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={<CheckCircleIcon />}
                                label={q.correct_answer} 
                                color="success" 
                                sx={{ 
                                  fontWeight: 600,
                                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                  color: 'white',
                                  '& .MuiChip-icon': {
                                    color: 'white'
                                  }
                                }} 
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={<TimerIcon />}
                                label={`${q.duration_in_sec} seconds`} 
                                sx={{ 
                                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  '& .MuiChip-icon': {
                                    color: 'white'
                                  }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <Button 
            onClick={() => setModalOpen(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestList;
