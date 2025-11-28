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
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assignment: null });
  const [deletingAssignmentId, setDeletingAssignmentId] = useState(null);
  const [togglingAssignmentId, setTogglingAssignmentId] = useState(null);

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

  // Helper function to extract assignment ID from various possible field names
  const getAssignmentId = (assignment) => {
    if (!assignment) return null;
    
    // Prioritize assignment_id as it's the primary field in API response
    const possibleIds = [
      assignment.assignment_id,
      assignment.id,
      assignment.ID,
      assignment.assignmentId,
      assignment['assignment_id'],
      assignment['id'],
      assignment['ID']
    ];
    
    // Find first truthy value
    const assignmentId = possibleIds.find(id => id !== undefined && id !== null && id !== '');
    
    if (!assignmentId) {
      console.error('❌ Assignment object missing ID field. Available keys:', Object.keys(assignment));
      console.error('❌ Full assignment object:', assignment);
    }
    
    return assignmentId;
  };

  // Helper function to check if assignment is active
  const isAssignmentActive = (assignment) => {
    if (!assignment) return false;
    
    // Extract status - API returns "status": 2 for active
    const statusValue = assignment.status || assignment.status_id || assignment.assignment_status || assignment.state;
    
    if (statusValue === undefined || statusValue === null) {
      return false; // Default to inactive if status not found
    }
    
    // Handle string format
    if (typeof statusValue === 'string') {
      const lowerStatus = statusValue.toLowerCase();
      if (lowerStatus === 'active' || lowerStatus === '1' || lowerStatus === '2') {
        return true;
      }
      if (lowerStatus === 'inactive' || lowerStatus === '0' || lowerStatus === '3') {
        return false;
      }
    }
    
    // Convert to number if string
    const statusNum = typeof statusValue === 'string' ? parseInt(statusValue, 10) : statusValue;
    
    // Status 1 or 2 = Active, Status 0 or 3 = Inactive
    return statusNum === 1 || statusNum === 2;
  };

  const handleEdit = (assignment) => {
    const assignmentId = getAssignmentId(assignment);
    if (!assignmentId) {
      console.error('Assignment object missing ID field:', assignment);
      toast.error('Cannot edit: Assignment ID not found');
      return;
    }
    console.log('🔵 Edit assignment clicked, ID:', assignmentId);
    navigate(`/admin/course-assignment/${assignmentId}`);
  };

  const handleDeleteClick = (assignment) => {
    setDeleteDialog({ open: true, assignment });
  };

  const handleDeleteConfirm = async () => {
    const assignment = deleteDialog.assignment;
    if (!assignment) return;

    const assignmentId = getAssignmentId(assignment);
    if (!assignmentId) {
      toast.error('Cannot delete: Assignment ID not found');
      setDeleteDialog({ open: false, assignment: null });
      return;
    }

    setDeletingAssignmentId(assignmentId);
    console.log('🗑️ Attempting to delete assignment ID:', assignmentId);
    
    try {
      const response = await api.delete(`admin/assign/assignment/${assignmentId}`);
      console.log('✅ Delete assignment response:', response.data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Assignment deleted successfully');
        setDeleteDialog({ open: false, assignment: null });
        // Refresh the list
        const { acdemic_course_id, assigned_weeks } = filters;
        if (acdemic_course_id && assigned_weeks !== '') {
          setLoading(true);
          api.get('admin/assign/assignment', {
            params: { acdemic_course_id, assigned_weeks }
          })
            .then(res => {
              const list = res.data?.data?.data || [];
              setAssignments(list);
            })
            .catch(() => toast.error('Failed to refresh assignments'))
            .finally(() => setLoading(false));
        }
      }
    } catch (err) {
      console.error('❌ Error deleting assignment:', err);
      if (err.response?.status === 400) {
        const errors = err.response.data.errors;
        if (errors?.assignment) {
          toast.error(errors.assignment[0]);
        } else {
          toast.error(err.response.data.message || 'Cannot delete assignment');
        }
      } else if (err.response?.status === 422) {
        toast.error(err.response.data.error || 'Cannot delete assignment');
      } else if (err.response?.status === 404) {
        toast.error('Assignment not found');
        // Refresh list
        const { acdemic_course_id, assigned_weeks } = filters;
        if (acdemic_course_id && assigned_weeks !== '') {
          setLoading(true);
          api.get('admin/assign/assignment', {
            params: { acdemic_course_id, assigned_weeks }
          })
            .then(res => {
              const list = res.data?.data?.data || [];
              setAssignments(list);
            })
            .catch(() => toast.error('Failed to refresh assignments'))
            .finally(() => setLoading(false));
        }
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(err.response?.data?.error || 'Failed to delete assignment');
      }
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, assignment: null });
  };

  const handleToggleStatus = async (assignment) => {
    const assignmentId = getAssignmentId(assignment);
    if (!assignmentId) {
      toast.error('Cannot toggle status: Assignment ID not found');
      return;
    }

    // Use helper function to check if assignment is active
    const isActive = isAssignmentActive(assignment);
    
    // If currently active, we want to deactivate. If currently inactive, we want to activate.
    const action = isActive ? 'deactivate' : 'activate';
    
    console.log('🔄 Toggle Status - Assignment ID:', assignmentId, '| Action:', action);
    
    setTogglingAssignmentId(assignmentId);
    
    try {
      const response = await api.patch(`admin/assign/assignment/${assignmentId}/toggle-status`, {
        action: action
      });
      
      if (response.data.success) {
        toast.success(response.data.message || `Assignment ${action}d successfully`);
        // Refresh the list
        const { acdemic_course_id, assigned_weeks } = filters;
        if (acdemic_course_id && assigned_weeks !== '') {
          setLoading(true);
          api.get('admin/assign/assignment', {
            params: { acdemic_course_id, assigned_weeks }
          })
            .then(res => {
              const list = res.data?.data?.data || [];
              setAssignments(list);
            })
            .catch(() => toast.error('Failed to refresh assignments'))
            .finally(() => setLoading(false));
        }
      } else {
        toast.error(response.data.message || `Failed to ${action} assignment`);
      }
    } catch (err) {
      console.error('❌ Error toggling assignment status:', err);
      if (err.response?.status === 400) {
        const errors = err.response.data.errors;
        if (errors?.action) {
          toast.error(errors.action[0]);
        } else {
          toast.error(err.response.data.message || 'Invalid action');
        }
      } else if (err.response?.status === 404) {
        toast.error('Assignment not found');
        // Refresh list
        const { acdemic_course_id, assigned_weeks } = filters;
        if (acdemic_course_id && assigned_weeks !== '') {
          setLoading(true);
          api.get('admin/assign/assignment', {
            params: { acdemic_course_id, assigned_weeks }
          })
            .then(res => {
              const list = res.data?.data?.data || [];
              setAssignments(list);
            })
            .catch(() => toast.error('Failed to refresh assignments'))
            .finally(() => setLoading(false));
        }
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(err.response?.data?.error || 'Failed to toggle assignment status');
      }
    } finally {
      setTogglingAssignmentId(null);
    }
  };

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
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item, index) => {
                        const assignmentId = getAssignmentId(item);
                        return (
                          <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{item.week_number || item.weeks?.week_number || 'N/A'}</TableCell>
                            <TableCell>{item.start_end_date || item.weeks?.start_end_date || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={isAssignmentActive(item) ? 'Active' : 'Inactive'}
                                size="small"
                                color={isAssignmentActive(item) ? 'success' : 'default'}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                {/* Hide edit, delete, and toggle buttons for unassigned weeks */}
                                {filters.assigned_weeks === '1' && (
                                  <>
                                    {/* Edit button commented out per user request */}
                                    {/* <Tooltip title="Edit Assignment">
                                      <IconButton
                                        size="medium"
                                        color="primary"
                                        onClick={() => handleEdit(item)}
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'primary.main',
                                          '&:hover': { 
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            transform: 'scale(1.1)'
                                          },
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip> */}
                                    <Tooltip title={isAssignmentActive(item) ? 'Deactivate' : 'Activate'}>
                                      <IconButton
                                        size="medium"
                                        color={isAssignmentActive(item) ? 'warning' : 'success'}
                                        onClick={() => handleToggleStatus(item)}
                                        disabled={togglingAssignmentId === assignmentId}
                                        sx={{
                                          border: '2px solid',
                                          borderColor: isAssignmentActive(item) ? '#ed6c02' : '#2e7d32',
                                          backgroundColor: isAssignmentActive(item) ? '#ed6c02' : '#2e7d32',
                                          width: 42,
                                          height: 42,
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                          '&:hover': { 
                                            backgroundColor: isAssignmentActive(item) ? '#e65100' : '#1b5e20',
                                            borderColor: isAssignmentActive(item) ? '#e65100' : '#1b5e20',
                                            transform: 'scale(1.1)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                          },
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        {togglingAssignmentId === assignmentId ? (
                                          <CircularProgress size={20} sx={{ color: '#fff' }} />
                                        ) : isAssignmentActive(item) ? (
                                          <ToggleOnIcon sx={{ fontSize: 22, color: '#fff' }} />
                                        ) : (
                                          <ToggleOffIcon sx={{ fontSize: 22, color: '#fff' }} />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Assignment">
                                      <IconButton
                                        size="medium"
                                        color="error"
                                        onClick={() => handleDeleteClick(item)}
                                        disabled={deletingAssignmentId === assignmentId}
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'error.main',
                                          '&:hover': { 
                                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                            transform: 'scale(1.1)'
                                          },
                                          transition: 'all 0.2s'
                                        }}
                                      >
                                        {deletingAssignmentId === assignmentId ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <DeleteIcon />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
            Are you sure you want to delete this assignment? This action cannot be undone.
          </Typography>
          {deleteDialog.assignment && (
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.300' 
            }}>
              <Typography variant="subtitle1" fontWeight={600}>
                <strong>Week:</strong> {deleteDialog.assignment.week_number || deleteDialog.assignment.weeks?.week_number || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {deleteDialog.assignment.start_end_date || deleteDialog.assignment.weeks?.start_end_date || 'N/A'}
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
            disabled={deletingAssignmentId === getAssignmentId(deleteDialog.assignment)}
            autoFocus
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {deletingAssignmentId === getAssignmentId(deleteDialog.assignment) ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Deleting...
              </Box>
            ) : (
              'Delete Assignment'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseAssignmentList;
