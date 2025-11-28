import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import { toast } from 'react-toastify';

const StudentList = () => {
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, student: null });

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin/students-with-courses', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        setStudents(data.data || []);
        setTotalRecords(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch student list');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (student) => {
    setDeleteDialog({ open: true, student });
  };

  const handleDeleteConfirm = async () => {
    const { student } = deleteDialog;
    try {
      const response = await api.delete(`admin/student/${student.id}`);
      if (response.data.success) {
        toast.success('Student deleted successfully');
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      if (error.response?.status === 400) {
        toast.error('Cannot delete student because they are assigned to courses');
      } else {
        toast.error('Failed to delete student');
      }
    } finally {
      setDeleteDialog({ open: false, student: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, student: null });
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '25px',
          px: 3,
          py: 1,
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
        }}>
          <SchoolIcon sx={{ color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Student Management
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          Manage student accounts, view assigned courses, and handle student data
        </Typography>
      </Box>

      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Search students..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: 350,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)' }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Parent Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Display Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Year</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Assigned Courses</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">Loading students...</Typography>
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No students found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow 
                      key={student.id} 
                      hover
                      sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.04)' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            width: 40, 
                            height: 40,
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {student.student?.first_name?.[0] || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#2d3748">
                              {student.student?.first_name} {student.student?.last_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {student.student?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {student.parent ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#2d3748">
                              {student.parent.full_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {student.parent.email}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No parent assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} sx={{ color: '#4a5568' }}>
                          {student.display_name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`Year ${student.year_id || 'N/A'}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(102, 126, 234, 0.1)', 
                            color: '#667eea',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`${student.assigned_courses_count || 0} Courses`} 
                            size="small" 
                            color={student.assigned_courses_count > 0 ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: '6px' }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/admin/student/${student.id}`)}
                              sx={{ 
                                color: '#667eea',
                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit Student" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/admin/student/${student.id}/edit`)}
                              sx={{ 
                                color: '#f59e0b',
                                bgcolor: 'rgba(245, 158, 11, 0.1)',
                                '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.2)' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Student" arrow>
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteClick(student)}
                              sx={{ 
                                color: '#ef4444',
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the student "{deleteDialog.student?.display_name || 'Unknown'}"? 
            This action cannot be undone.
          </Typography>
          {deleteDialog.student?.assigned_courses_count > 0 && (
            <Typography color="warning.main" sx={{ mt: 2 }}>
              Warning: This student has {deleteDialog.student.assigned_courses_count} assigned courses. 
              Deletion may be blocked if courses are still active.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentList;
