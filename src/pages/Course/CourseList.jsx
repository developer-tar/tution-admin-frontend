import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Chip, Skeleton, TableContainer,
  TablePagination, Button, Dialog, DialogTitle, DialogContent,
  Grid, Divider, IconButton, Card, CardContent, Avatar, TextField, InputAdornment,
  DialogActions, CircularProgress, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

const gradientButtonStyle = {
  background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
  color: '#fff',
  fontWeight: 600,
  paddingX: 2,
  paddingY: 0.5,
  borderRadius: 2,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
    opacity: 0.9,
  }
};

const CourseList = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCourses, setTotalCourses] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [togglingCourseId, setTogglingCourseId] = useState(null);

  const fetchCourses = async (pageNumber, search = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `admin/assign/course?page=${pageNumber + 1}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(url);
      const coursesData = res.data?.data?.data || [];
      // Log course structure for debugging
      if (coursesData.length > 0) {
        console.log('📋 Sample course object structure:', coursesData[0]);
        console.log('📋 All course object keys:', Object.keys(coursesData[0]));
        console.log('📋 Full API response structure:', {
          data: res.data?.data,
          firstCourse: coursesData[0]
        });
        // Log all properties of first course
        console.log('📋 First course all properties:', JSON.stringify(coursesData[0], null, 2));
      }
      setCourses(coursesData);
      setTotalCourses(res.data?.data?.total || 0);
    } catch (err) {
      // Always show generic error message - never expose backend/database errors to users
      setError('Failed to fetch courses, please try again.');
      setCourses([]);
      setTotalCourses(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page, searchQuery);
  }, [page, searchQuery]);

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    setPage(0); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  // Helper function to check if course is active
  const isCourseActive = (course) => {
    if (!course) return false;
    
    // Extract status - API returns "status": 2 for active
    const statusValue = course.status || course.status_id || course.course_status || course.state;
    
    if (statusValue === undefined || statusValue === null) {
      return false; // Default to inactive if status not found
    }
    
    // Handle string values
    if (typeof statusValue === 'string') {
      const lowerStatus = statusValue.toLowerCase();
      if (lowerStatus === 'active' || lowerStatus === '1' || lowerStatus === '2') {
        return true;
      }
      return false;
    }
    
    // Handle number values - API uses 2 for active, but support 1 as well
    const statusNum = typeof statusValue === 'string' ? parseInt(statusValue, 10) : statusValue;
    
    // Status 1 or 2 = Active, Status 0 or 3 = Inactive
    return statusNum === 1 || statusNum === 2;
  };

  // Helper function to extract course ID from various possible field names
  const getCourseId = (course) => {
    if (!course) return null;
    
    // Try all possible ID field variations (checking both direct access and bracket notation)
    const possibleIds = [
      course.id,
      course.course_id,
      course.ID,
      course.courseId,
      course.courseID,
      course['id'],
      course['course_id'],
      course['ID'],
      course['courseId'],
      course['courseID']
    ];
    
    // Find first truthy value (excluding 0 as it's a valid ID)
    let courseId = possibleIds.find(id => id !== undefined && id !== null && id !== '');
    
      // If still not found, check all object keys for anything that looks like an ID
      if (!courseId) {
        const allKeys = Object.keys(course);
        console.error('❌ Course ID not found in standard fields. Available keys:', allKeys);
        console.error('❌ Full course object:', JSON.stringify(course, null, 2));
        
        // Try to find any key that contains 'id' (case insensitive)
        const idLikeKeys = allKeys.filter(key => {
          const lowerKey = key.toLowerCase();
          return (lowerKey.includes('id') || lowerKey === 'id') && 
                 (typeof course[key] === 'number' || (typeof course[key] === 'string' && course[key] !== ''));
        });
        
        if (idLikeKeys.length > 0) {
          console.warn('⚠️ Found potential ID fields:', idLikeKeys);
          // Try each potential ID field
          for (const key of idLikeKeys) {
            const potentialId = course[key];
            if (potentialId !== undefined && potentialId !== null && potentialId !== '') {
              console.warn('✅ Using potential ID field:', key, '=', potentialId);
              courseId = potentialId;
              break;
            }
          }
        }
        
        // If still not found, check if there's a numeric value that could be an ID
        // Check all numeric fields - sometimes the ID might be the first numeric field
        if (!courseId) {
          const numericFields = allKeys.filter(key => {
            const value = course[key];
            return typeof value === 'number' && value > 0 && Number.isInteger(value);
          });
          
          if (numericFields.length > 0) {
            console.warn('⚠️ Found numeric fields that might be IDs:', numericFields);
            // Use the first numeric field as a last resort (often the ID is the first field)
            const firstNumericKey = numericFields[0];
            const firstNumericValue = course[firstNumericKey];
            console.warn('⚠️ Attempting to use first numeric field as ID:', firstNumericKey, '=', firstNumericValue);
            courseId = firstNumericValue;
          }
        }
      }
    
    return courseId;
  };

  const handleEdit = (course) => {
    const courseId = getCourseId(course);
    console.log('🔵 Edit button clicked for course:', course);
    console.log('🔵 Course ID found:', courseId);
    console.log('🔵 Course object keys:', course ? Object.keys(course) : 'null');
    console.log('🔵 Course object values:', course);
    
    if (!courseId) {
      console.error('❌ Course object missing ID field. Full object:', JSON.stringify(course, null, 2));
      console.error('❌ Available keys:', course ? Object.keys(course) : 'null');
      toast.error('Cannot edit: Course ID not found. Please check the browser console (F12) for details.');
      return;
    }
    
    console.log('✅ Navigating to edit page:', `/admin/course/${courseId}`);
    navigate(`/admin/course/${courseId}`);
  };

  const handleDeleteClick = (course) => {
    console.log('🔴 Delete button clicked for course:', course);
    const courseId = getCourseId(course);
    console.log('🔴 Course ID:', courseId);
    setDeleteDialog({ open: true, course });
  };

  const handleDeleteConfirm = async () => {
    const course = deleteDialog.course;
    if (!course) return;

    const courseId = getCourseId(course);
    if (!courseId) {
      toast.error('Cannot delete: Course ID not found');
      setDeleteDialog({ open: false, course: null });
      return;
    }

    setDeletingCourseId(courseId);
    console.log('🗑️ Attempting to delete course with ID:', courseId);
    console.log('🗑️ API endpoint:', `admin/assign/course/${courseId}`);
    
    try {
      const response = await api.delete(`admin/assign/course/${courseId}`);
      console.log('✅ Delete API response:', response.data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Course deleted successfully');
        setDeleteDialog({ open: false, course: null });
        fetchCourses(page, searchQuery);
      } else {
        console.warn('⚠️ Delete response not successful:', response.data);
        toast.error(response.data.message || 'Failed to delete course');
      }
    } catch (err) {
      console.error('❌ Error deleting course:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      if (err.response?.status === 422) {
        toast.error(err.response.data.error || 'Cannot delete course. One or more students are assigned to this course.');
      } else if (err.response?.status === 404) {
        toast.error('Course not found');
        fetchCourses(page, searchQuery);
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(err.response?.data?.error || 'Failed to delete course');
      }
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, course: null });
  };

  const handleToggleStatus = async (course) => {
    const courseId = getCourseId(course);
    if (!courseId) {
      toast.error('Cannot toggle status: Course ID not found');
      return;
    }

    // Extract status value
    const statusValue = course.status || course.status_id || course.course_status || course.state;
    
    // Use helper function to check if course is active
    const isActive = isCourseActive(course);
    
    // If currently active, we want to deactivate. If currently inactive, we want to activate.
    const action = isActive ? 'deactivate' : 'activate';
    
    // Log only course ID and status
    console.log('🔄 Toggle Status - Course ID:', courseId, '| Status:', statusValue, '| Action:', action);
    
    setTogglingCourseId(courseId);
    
    try {
      const response = await api.patch(`admin/assign/course/${courseId}/toggle-status`, {
        action: action
      });
      
      if (response.data.success) {
        toast.success(response.data.message || `Course ${action}d successfully`);
        fetchCourses(page, searchQuery);
      } else {
        toast.error(response.data.message || `Failed to ${action} course`);
      }
    } catch (err) {
      console.error('❌ Error toggling course status:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors?.action) {
          toast.error(errors.action[0]);
        } else {
          toast.error(err.response.data.message || 'Invalid action');
        }
      } else if (err.response?.status === 404) {
        toast.error('Course not found');
        fetchCourses(page, searchQuery);
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(err.response?.data?.error || 'Failed to toggle course status');
      }
    } finally {
      setTogglingCourseId(null);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      {/* Compact Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        {/* Left Side - Title & Description */}
        <Box sx={{ textAlign: 'left', flex: 1, mr: 3 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '25px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
          }}>
            <Typography sx={{ fontSize: '20px' }}>📚</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              Course List
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 350 }}>
            <Typography variant="body2" component="div" sx={{ color: '#5a6c7d', fontSize: '13px' }}>
              Manage all courses with comprehensive details, search and filtering options
            </Typography>
            <Typography variant="body1" component="div" sx={{ opacity: 0.9, mt: 1.5, color: '#5a6c7d', fontSize: '13px' }}>
              Total courses - {totalCourses} {searchQuery ? `| Courses found for "${searchQuery}"` : ''}
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Add Course Button */}
        <Button sx={gradientButtonStyle} onClick={() => navigate('/admin/course')}>
          + Add Course
        </Button>
      </Box>


      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search courses by name, academic year, subjects, or any other field..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>


      {/* Courses Table Card */}
      <Card sx={{ 
        maxWidth: 1200, 
        mx: 'auto',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <TableContainer>
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={120} /></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={160} /></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={200} /></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={150} /></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={120} /></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={100} /></TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}><Skeleton width={80} /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton width="80%" /></TableCell>
                      <TableCell><Skeleton width="60%" /></TableCell>
                      <TableCell><Skeleton width="90%" /></TableCell>
                      <TableCell><Skeleton width="70%" /></TableCell>
                      <TableCell><Skeleton width="60%" /></TableCell>
                      <TableCell><Skeleton width="50%" /></TableCell>
                      <TableCell><Skeleton width="40%" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Academic Year</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 150 }}>Course Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 150 }}>Subjects</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Locations</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Modes</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 150 }}>Pricing</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 100 }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 250, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {error ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ fontSize: '48px' }}>⚠️</Typography>
                            <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                              Error Loading Courses
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', maxWidth: 400, textAlign: 'center' }}>
                              {error}
                            </Typography>
                            <Button 
                              sx={gradientButtonStyle} 
                              onClick={() => fetchCourses(page, searchQuery)}
                            >
                              🔄 Retry
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : courses.length > 0 ? (
                      courses.map((course, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{course.acdemicyear || '—'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {course.image ? (
                                <Avatar src={course.image} sx={{ width: 32, height: 32 }} />
                              ) : (
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  📘
                                </Avatar>
                              )}
                              <Typography variant="body2" fontWeight={600}>
                                {course.name || '—'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                              {course.subjects?.length ? (
                                course.subjects.slice(0, 2).map((sub, i) => (
                                  <Chip key={i} label={sub} size="small" sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', fontWeight: 600 }} />
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">No subjects</Typography>
                              )}
                              {course.subjects?.length > 2 && (
                                <Chip label={`+${course.subjects.length - 2} more`} size="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 150 }}>
                              {course.locations?.length ? (
                                course.locations.slice(0, 2).map((loc, i) => (
                                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon fontSize="small" color="action" />
                                    <Chip label={loc.name} size="small" sx={{ background: 'linear-gradient(45deg, #ff9800, #f57c00)', color: 'white', fontWeight: 600 }} />
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">No locations</Typography>
                              )}
                              {course.locations?.length > 2 && (
                                <Chip label={`+${course.locations.length - 2} more`} size="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {course.modes?.length ? (
                                course.modes.map((mode, i) => (
                                  <Chip 
                                    key={i} 
                                    label={mode} 
                                    size="small" 
                                    sx={{
                                      background: mode === 'Online' 
                                        ? 'linear-gradient(45deg, #4caf50, #2e7d32)' 
                                        : 'linear-gradient(45deg, #2196f3, #1565c0)',
                                      color: 'white',
                                      fontWeight: 600
                                    }}
                                  />
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">No modes</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              {course.amounts && Object.keys(course.amounts).length > 0 ? (
                                <Box>
                                  {Object.entries(course.amounts).slice(0, 2).map(([period, price], i) => (
                                    <Typography key={i} variant="caption" display="block" fontWeight={600}>
                                      {period}: {price}
                                    </Typography>
                                  ))}
                                  {Object.keys(course.amounts).length > 2 && (
                                    <Typography variant="caption" color="text.secondary">
                                      +{Object.keys(course.amounts).length - 2} more
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">No pricing</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isCourseActive(course) ? 'Active' : 'Inactive'}
                              size="small"
                              color={isCourseActive(course) ? 'success' : 'default'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 350, maxWidth: 450 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1, 
                              flexWrap: 'nowrap', 
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              width: '100%',
                              py: 1
                            }}>
                              <Tooltip title="View Details">
                                <Button 
                                  variant="contained"
                                  size="small" 
                                  onClick={() => {
                                    console.log('👁️ View button clicked for course:', course);
                                    setSelectedCourse(course);
                                  }}
                                  sx={{
                                    background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    minWidth: 70,
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    '&:hover': {
                                      opacity: 0.9,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    }
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              <Tooltip title="Edit Course">
                                <IconButton
                                  size="medium"
                                  color="primary"
                                  onClick={() => {
                                    console.log('✏️ Edit button clicked for course:', course);
                                    handleEdit(course);
                                  }}
                                  sx={{
                                    border: '2px solid',
                                    borderColor: '#1976d2',
                                    backgroundColor: '#1976d2',
                                    width: 42,
                                    height: 42,
                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                                    '&:hover': { 
                                      backgroundColor: '#1565c0',
                                      borderColor: '#1565c0',
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.5)',
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 20, color: '#fff' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={isCourseActive(course) ? 'Deactivate' : 'Activate'}>
                                <IconButton
                                  size="medium"
                                  color={isCourseActive(course) ? 'warning' : 'success'}
                                  onClick={() => {
                                    handleToggleStatus(course);
                                  }}
                                  disabled={togglingCourseId === getCourseId(course)}
                                  sx={{
                                    border: '2px solid',
                                    borderColor: isCourseActive(course) ? '#ed6c02' : '#2e7d32',
                                    backgroundColor: isCourseActive(course) ? '#ed6c02' : '#2e7d32',
                                    width: 42,
                                    height: 42,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    '&:hover': { 
                                      backgroundColor: isCourseActive(course) ? '#e65100' : '#1b5e20',
                                      borderColor: isCourseActive(course) ? '#e65100' : '#1b5e20',
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    },
                                    '&:disabled': {
                                      opacity: 0.5
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {togglingCourseId === getCourseId(course) ? (
                                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                                  ) : isCourseActive(course) ? (
                                    <ToggleOnIcon sx={{ fontSize: 22, color: '#fff' }} />
                                  ) : (
                                    <ToggleOffIcon sx={{ fontSize: 22, color: '#fff' }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Course">
                                <IconButton
                                  size="medium"
                                  color="error"
                                  onClick={() => {
                                    console.log('🗑️ Delete button clicked for course:', course);
                                    handleDeleteClick(course);
                                  }}
                                  disabled={deletingCourseId === getCourseId(course)}
                                  sx={{
                                    border: '2px solid',
                                    borderColor: '#d32f2f',
                                    backgroundColor: '#d32f2f',
                                    width: 42,
                                    height: 42,
                                    boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                                    '&:hover': { 
                                      backgroundColor: '#c62828',
                                      borderColor: '#c62828',
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.5)',
                                    },
                                    '&:disabled': {
                                      opacity: 0.5
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {deletingCourseId === getCourseId(course) ? (
                                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                                  ) : (
                                    <DeleteIcon sx={{ fontSize: 20, color: '#fff' }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>No Courses Found</Typography>
                          <Typography variant="body2" sx={{ color: '#999' }}>No courses match your current search criteria</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {courses.length > 0 && (
                <TablePagination
                  component="div"
                  count={totalCourses}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[10]}
                  sx={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={!!selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderRadius: '16px 16px 0 0',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography sx={{ fontSize: '28px' }}>📚</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Course Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Complete course information and specifications
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Edit Course">
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  if (selectedCourse) {
                    const courseId = getCourseId(selectedCourse);
                    if (courseId) {
                      console.log('🔵 Edit button clicked from modal for course ID:', courseId);
                      setSelectedCourse(null); // Close modal first
                      navigate(`/admin/course/${courseId}`);
                    } else {
                      toast.error('Cannot edit: Course ID not found');
                    }
                  }
                }}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                Edit
              </Button>
            </Tooltip>
            <IconButton 
              onClick={() => setSelectedCourse(null)}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { 
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {selectedCourse && (
            <Box sx={{ p: 4, background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' }}>
              <Grid container spacing={4}>
                {/* Basic Information Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3,
                    height: 'fit-content'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>ℹ️</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748' }}>
                        Basic Information
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4a5568', minWidth: 120 }}>
                          Academic Year:
                        </Typography>
                        <Chip 
                          label={selectedCourse.acdemicyear || '—'} 
                          size="small" 
                          sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', fontWeight: 600 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4a5568', minWidth: 120 }}>
                          Course Name:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2d3748' }}>
                          {selectedCourse.name || '—'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4a5568', minWidth: 120 }}>
                          Slug:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2d3748', fontFamily: 'monospace', background: '#f7fafc', px: 1, py: 0.5, borderRadius: 1 }}>
                          {selectedCourse.slug || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
                
                {/* Course Image Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3,
                    height: 'fit-content'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>🖼️</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748' }}>
                        Course Image
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 200, 
                      overflow: 'hidden', 
                      borderRadius: 3, 
                      border: '2px solid rgba(102, 126, 234, 0.1)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      {selectedCourse.image ? (
                        <img
                          src={selectedCourse.image}
                          alt={selectedCourse.name || 'Course'}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => { e.target.src = '/no-image.png'; }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'linear-gradient(145deg, #f7fafc 0%, #edf2f7 100%)',
                          color: '#718096'
                        }}>
                          <Typography sx={{ fontSize: '48px', mb: 1 }}>📚</Typography>
                          <Typography variant="body2" fontWeight={500}>No Image Available</Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Subjects Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3,
                    height: 'fit-content'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>📖</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748' }}>
                        Subjects ({selectedCourse.subjects?.length || 0})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {selectedCourse.subjects?.length ? (
                        selectedCourse.subjects.map((sub, i) => (
                          <Chip 
                            key={i} 
                            label={sub} 
                            size="medium" 
                            sx={{ 
                              background: 'linear-gradient(45deg, #667eea, #764ba2)', 
                              color: 'white', 
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          color: '#718096',
                          fontStyle: 'italic'
                        }}>
                          <Typography sx={{ fontSize: '20px' }}>📝</Typography>
                          <Typography variant="body2">No subjects assigned</Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Modes Card */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3,
                    height: 'fit-content'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>🎯</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748' }}>
                        Course Modes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {selectedCourse.modes?.length ? (
                        selectedCourse.modes.map((mode, i) => (
                          <Chip 
                            key={i} 
                            label={mode} 
                            size="medium" 
                            sx={{
                              background: mode === 'Online' 
                                ? 'linear-gradient(45deg, #4caf50, #2e7d32)' 
                                : 'linear-gradient(45deg, #2196f3, #1565c0)',
                              color: 'white',
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          color: '#718096',
                          fontStyle: 'italic'
                        }}>
                          <Typography sx={{ fontSize: '20px' }}>🚫</Typography>
                          <Typography variant="body2">No modes specified</Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Pricing Information Card */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>💰</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748' }}>
                        Pricing Information
                      </Typography>
                    </Box>
                    {selectedCourse.amounts && Object.keys(selectedCourse.amounts).length > 0 ? (
                      <Grid container spacing={3}>
                        {Object.entries(selectedCourse.amounts).map(([period, price], i) => (
                          <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card sx={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              borderRadius: 3,
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                              },
                              transition: 'all 0.3s ease'
                            }}>
                              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                                  {price}
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                  {period}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        color: '#718096',
                        fontStyle: 'italic',
                        justifyContent: 'center',
                        py: 3
                      }}>
                        <Typography sx={{ fontSize: '24px' }}>💸</Typography>
                        <Typography variant="body2">No pricing information available</Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Locations and Slots Card */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    p: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>📍</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748' }}>
                        Locations & Time Slots
                      </Typography>
                    </Box>
                    {selectedCourse.locations?.length ? (
                    <Grid container spacing={2}>
                      {selectedCourse.locations.map((location, i) => (
                        <Grid item xs={12} md={6} key={i}>
                          <Card sx={{ border: '1px solid #e0e0e0' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationOnIcon color="secondary" />
                                <Typography variant="h6" fontWeight={600}>
                                  {location.name}
                                </Typography>
                              </Box>
                              
                              {location.slots?.length > 0 ? (
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                    Available Slots ({location.slots.length}):
                                  </Typography>
                                  {location.slots.map((slot, slotIndex) => (
                                    <Card key={slotIndex} sx={{ mb: 1, bgcolor: 'grey.50' }}>
                                      <CardContent sx={{ py: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Chip label={slot.class} size="small" color="primary" />
                                          <Chip label={slot.weekday} size="small" color="secondary" />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AccessTimeIcon fontSize="small" />
                                            <Typography variant="caption">
                                              {slot.start_end_time}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PeopleIcon fontSize="small" />
                                            <Typography variant="caption">
                                              {slot.seat_left}/{slot.max_seats} seats
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No time slots available
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      </Grid>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        color: '#718096',
                        fontStyle: 'italic',
                        justifyContent: 'center',
                        py: 3
                      }}>
                        <Typography sx={{ fontSize: '24px' }}>🏢</Typography>
                        <Typography variant="body2">No locations specified</Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Features and Description */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Features
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedCourse.features || 'No features description available'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedCourse.description || 'No description available'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '0 0 16px 16px'
        }}>
          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setSelectedCourse(null)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                if (selectedCourse) {
                  const courseId = getCourseId(selectedCourse);
                  if (courseId) {
                    console.log('🔵 Edit button clicked from modal footer for course ID:', courseId);
                    setSelectedCourse(null); // Close modal first
                    navigate(`/admin/course/${courseId}`);
                  } else {
                    toast.error('Cannot edit: Course ID not found');
                  }
                }
              }}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a42a0 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Edit Course
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          color: 'error.main',
          pb: 1
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'error.light',
            color: 'error.main',
            fontSize: '20px'
          }}>
            ⚠️
          </Box>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            Are you sure you want to delete this course? This action cannot be undone.
          </Typography>
          {deleteDialog.course && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.300' 
            }}>
              <Typography variant="subtitle1" fontWeight={600}>
                <strong>Course:</strong> {deleteDialog.course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Academic Year:</strong> {deleteDialog.course.acdemicyear || 'N/A'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
            size="large"
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            size="large"
            disabled={deletingCourseId === deleteDialog.course?.id}
            autoFocus
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {deletingCourseId === deleteDialog.course?.id ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Deleting...
              </Box>
            ) : (
              'Delete Course'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseList;
