import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Chip, Skeleton, TableContainer,
  TablePagination, Button, Dialog, DialogTitle, DialogContent,
  Grid, Divider, IconButton, Card, CardContent, Avatar, TextField, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
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
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCourses, setTotalCourses] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = async (pageNumber, search = '') => {
    setLoading(true);
    try {
      let url = `admin/assign/course?page=${pageNumber + 1}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(url);
      setCourses(res.data?.data?.data || []);
      setTotalCourses(res.data?.data?.total || 0);
    } catch (error) {
      toast.error('Failed to fetch courses. Please try again.');
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
          <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
            Manage all courses with comprehensive details, search and filtering options
            <Typography variant="body1" sx={{ opacity: 0.9 , mt: 3 }}>
                
            Total courses -{totalCourses}  {searchQuery ? `Courses found for "${searchQuery}"` : ''}
            </Typography>
           
          </Typography>
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
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Academic Year</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Course Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Subjects</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Locations</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Modes</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Pricing</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.length > 0 ? (
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
                            <Button sx={gradientButtonStyle} size="small" onClick={() => setSelectedCourse(course)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
      </Dialog>
    </Box>
  );
};

export default CourseList;
