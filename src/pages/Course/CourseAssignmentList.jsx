import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Button,
  Card,
  CardContent
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
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
const CourseAssignmentList = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ acdemic_course_id: '', assigned_weeks: '' });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Fetch academic courses on mount
  useEffect(() => {
    api.get('admin/ca_records')
      .then(res => setCourses(res.data?.data || []))
      .catch(() => toast.error('Failed to load academic courses'));
  }, []);

  // Fetch filtered assignments
  useEffect(() => {
    const { acdemic_course_id, assigned_weeks } = filters;
    if (!acdemic_course_id || assigned_weeks === '') return;

    setLoading(true);
    api.get('admin/assign/assignment', {
      params: { acdemic_course_id, assigned_weeks }
    })
      .then(res => {
        const list = res.data?.data?.data || [];
        setAssignments(list);
        if (!list.length) toast.info('No weeks found');
      })
      .catch(() => {
        setAssignments([]);
        toast.error('Failed to load assignments');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const isFilterSelected = filters.acdemic_course_id && filters.assigned_weeks !== '';

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        {/* Left Side - Title and Description */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '25px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
            width: 'fit-content'
          }}>
            <AssignmentIcon sx={{ fontSize: 20, color: 'white' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              Assignment List
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
            View and manage course week assignments with advanced filtering options
          </Typography>
        </Box>

        {/* Right Side - Create Button */}
        <Button sx={gradientButtonStyle} onClick={() => navigate('/admin/course-assignment')}>
                  + Create New Assignment
          </Button>
     
      </Box>

      {/* Filters Card */}
      <Card sx={{ 
        // maxWidth: 900, 
        // mx: 'auto', 
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FilterListIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#263238' }}>
              Filter Assignments
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SchoolIcon sx={{ color: '#667eea', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                    Academic Course
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    value={filters.acdemic_course_id}
                    displayEmpty
                    onChange={(e) => handleFilterChange('acdemic_course_id', String(e.target.value))}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <MenuItem value="" disabled>Select Academic Course</MenuItem>
                    {courses.map(course => (
                      <MenuItem key={course.id} value={String(course.id)}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fff8f0 0%, #fef3e8 100%)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarTodayIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                    Assignment Status
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    value={filters.assigned_weeks}
                    displayEmpty
                    onChange={(e) => handleFilterChange('assigned_weeks', String(e.target.value))}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <MenuItem value="" disabled>Select Status</MenuItem>
                    <MenuItem value="1">Assigned Weeks</MenuItem>
                    <MenuItem value="0">Unassigned Weeks</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card sx={{ 
        // maxWidth: 1200, 
        // mx: 'auto',
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
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Week Number</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Start–End Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : !isFilterSelected ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FilterListIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>Select Filters</Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>Choose both academic course and status to view assignments</Typography>
            </Box>
          ) : assignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>No Assignments Found</Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>No data found for the selected filters</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Week Number</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Start–End Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{item.week_number || item.weeks?.week_number || 'N/A'}</TableCell>
                          <TableCell>{item.start_end_date || item.weeks?.start_end_date || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={filters.assigned_weeks === '1' ? 'Assigned' : 'Unassigned'}
                              sx={{
                                background: filters.assigned_weeks === '1' 
                                  ? 'linear-gradient(45deg, #4caf50, #2e7d32)' 
                                  : 'linear-gradient(45deg, #ff9800, #f57c00)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={assignments.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
                sx={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseAssignmentList;
