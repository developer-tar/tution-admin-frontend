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
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Edit as AssignIcon,
} from '@mui/icons-material';
import api from '../../api';
import { toast } from 'react-toastify';

const TutorList = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);

  const [assignDialog, setAssignDialog] = useState({ open: false, tutor: null });
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [loadingTutor, setLoadingTutor] = useState(false);
  const [savingCourses, setSavingCourses] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, [page, rowsPerPage, searchTerm]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin/tutors', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchTerm,
        },
      });
      if (response.data.success) {
        const data = response.data.data;
        setTutors(data.data || []);
        setTotalRecords(data.total ?? 0);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast.error('Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesForAssignment = async () => {
    try {
      const res = await api.get('admin/tutors/courses-for-assignment');
      if (res.data?.success) setCourses(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load courses');
      setCourses([]);
    }
  };

  const openAssignDialog = async (tutor) => {
    setAssignDialog({ open: true, tutor });
    setLoadingTutor(true);
    setSelectedCourseIds([]);
    await fetchCoursesForAssignment();
    try {
      const res = await api.get(`admin/tutors/${tutor.id}`);
      if (res.data?.success && res.data.data?.course_ids) {
        setSelectedCourseIds(res.data.data.course_ids);
      }
    } catch (e) {
      toast.error('Failed to load tutor courses');
    } finally {
      setLoadingTutor(false);
    }
  };

  const closeAssignDialog = () => {
    setAssignDialog({ open: false, tutor: null });
    setCourses([]);
    setSelectedCourseIds([]);
  };

  const handleToggleCourse = (courseId) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) setSelectedCourseIds(courses.map((c) => c.id));
    else setSelectedCourseIds([]);
  };

  const handleSaveCourses = async () => {
    const { tutor } = assignDialog;
    if (!tutor) return;
    setSavingCourses(true);
    try {
      const res = await api.put(`admin/tutors/${tutor.id}/courses`, {
        course_ids: selectedCourseIds,
      });
      if (res.data?.success) {
        toast.success('Courses assigned successfully');
        closeAssignDialog();
        fetchTutors();
      } else {
        toast.error(res.data?.message || 'Failed to assign courses');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign courses');
    } finally {
      setSavingCourses(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allSelected = courses.length > 0 && selectedCourseIds.length === courses.length;

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '25px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
          }}
        >
          <SchoolIcon sx={{ color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Tutor Management
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          Assign courses to tutors. Tutors will only see students and data for their assigned courses in the tutor panel.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextField
              placeholder="Search tutors..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: 350,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                },
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
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Tutor</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Assigned Courses</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">Loading tutors...</Typography>
                    </TableCell>
                  </TableRow>
                ) : tutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No tutors found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tutors.map((tutor) => (
                    <TableRow
                      key={tutor.id}
                      hover
                      sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.04)' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              width: 40,
                              height: 40,
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            {tutor.first_name?.[0] || <PersonIcon />}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} color="#2d3748">
                            {tutor.first_name} {tutor.last_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                          <EmailIcon fontSize="small" sx={{ opacity: 0.7 }} />
                          {tutor.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${tutor.tutor_courses_count ?? 0} courses`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            fontWeight: 600,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AssignIcon />}
                          onClick={() => openAssignDialog(tutor)}
                          sx={{
                            borderRadius: 2,
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#3B2A9F',
                              background: 'rgba(59, 42, 159, 0.04)',
                            },
                          }}
                        >
                          Assign courses
                        </Button>
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

      <Dialog open={assignDialog.open} onClose={closeAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)', color: '#fff' }}>
          Assign courses to {assignDialog.tutor?.first_name} {assignDialog.tutor?.last_name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {loadingTutor ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selectedCourseIds.length > 0 && selectedCourseIds.length < courses.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                }
                label="Select all courses"
                sx={{ mb: 1 }}
              />
              <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
                {courses.map((course) => (
                  <ListItem key={course.id} disablePadding>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={() => handleToggleCourse(course.id)}
                        />
                      }
                      label={course.name}
                    />
                  </ListItem>
                ))}
              </List>
              {courses.length === 0 && !loadingTutor && (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No courses available. Create courses first from Course List.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAssignDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCourses}
            disabled={savingCourses}
            sx={{
              background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
              '&:hover': { background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)', opacity: 0.9 },
            }}
          >
            {savingCourses ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorList;
