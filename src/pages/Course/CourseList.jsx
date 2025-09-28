<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Chip, CircularProgress, TableContainer,
  TablePagination, Button, Dialog, DialogTitle, DialogContent, Grid, Divider
} from '@mui/material';
import api from '../../api';
import CourseAssignmentList from './CourseAssignmentList';

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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCourses, setTotalCourses] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await api.get(`admin/assign/course?page=${pageNumber + 1}`);
      setCourses(res.data.data.data);
      setTotalCourses(res.data.data.total);
    } catch (error) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ px: 2, py: 3, width: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Course List</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Academic Year</strong></TableCell>
                  <TableCell><strong>Course Name</strong></TableCell>
                  <TableCell><strong>Subjects</strong></TableCell>
                  <TableCell><strong>View</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell>{course.acdemicyear}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {course.subjects?.map((sub, i) => (
                          <Chip key={i} label={sub} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button sx={gradientButtonStyle} size="small" onClick={() => setSelectedCourse(course)}>
                        View 
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCourses}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </Paper>
      )}

      <Dialog open={!!selectedCourse} onClose={() => setSelectedCourse(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="book">📘</span> Course Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1"><strong>Academic Year:</strong> {selectedCourse.acdemicyear}</Typography>
                    <Typography variant="subtitle1"><strong>Course Name:</strong> {selectedCourse.name}</Typography>
                    <Typography variant="subtitle1"><strong>Slug:</strong> {selectedCourse.slug}</Typography>
                    <Typography variant="subtitle1"><strong>Amount:</strong> ₹{selectedCourse.amount}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%', height: 180, overflow: 'hidden', borderRadius: 2 }}>
                      <img
                        src={selectedCourse.image || '/no-image.png'}
                        alt={selectedCourse.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600}>Subjects:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                      {selectedCourse.subjects?.map((sub, i) => (
                        <Chip key={i} label={sub} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>

                    <Typography variant="subtitle1" fontWeight={600}>Locations:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                      {selectedCourse.locations?.map((loc, i) => (
                        <Chip key={i} label={loc} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>

                    <Typography variant="subtitle1" fontWeight={600}>Modes:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                      {selectedCourse.modes?.map((mode, i) => (
                        <Chip key={i} label={mode} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>

                    <Typography variant="subtitle1" fontWeight={600}>Features:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{selectedCourse.features}</Typography>

                    <Typography variant="subtitle1" fontWeight={600}>Description:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedCourse.description}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ px: 2 }}>
                <CourseAssignmentList courseId={selectedCourse._id || selectedCourse.id} />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CourseList;
=======
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Chip, Skeleton, TableContainer,
  TablePagination, Button, Dialog, DialogTitle, DialogContent,
  Grid, Divider, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

  const fetchCourses = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await api.get(`admin/assign/course?page=${pageNumber + 1}`);
      setCourses(res.data?.data?.data || []);
      setTotalCourses(res.data?.data?.total || 0);
    } catch (error) {
      toast.error('Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  const handleChangePage = (_, newPage) => setPage(newPage);

  return (
    <Box sx={{ px: 2, py: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Course List
        </Typography>
        <Button sx={gradientButtonStyle} onClick={() => navigate('/admin/course')}>
          + Add Course
        </Button>
      </Box>

      {loading ? (
        <Paper sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={160} /></TableCell>
                  <TableCell><Skeleton width={200} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width="90%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Academic Year</strong></TableCell>
                  <TableCell><strong>Course Name</strong></TableCell>
                  <TableCell><strong>Subjects</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <TableRow key={index}>
                      <TableCell>{course.acdemicyear || '—'}</TableCell>
                      <TableCell>{course.name || '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {course.subjects?.length ? (
                            course.subjects.map((sub, i) => (
                              <Chip key={i} label={sub} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No subjects</Typography>
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
                    <TableCell colSpan={4} align="center">No courses found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCourses}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </Paper>
      )}

      <Dialog open={!!selectedCourse} onClose={() => setSelectedCourse(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="book">📘</span> Course Details
          </Typography>
          <IconButton onClick={() => setSelectedCourse(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedCourse && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><strong>Academic Year:</strong> {selectedCourse.acdemicyear || '—'}</Typography>
                  <Typography variant="subtitle1"><strong>Course Name:</strong> {selectedCourse.name || '—'}</Typography>
                  <Typography variant="subtitle1"><strong>Slug:</strong> {selectedCourse.slug || '—'}</Typography>
                  <Typography variant="subtitle1"><strong>Amount:</strong> ₹{selectedCourse.amount || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ width: '100%', height: 180, overflow: 'hidden', borderRadius: 2 }}>
                    <img
                      src={selectedCourse.image || '/no-image.png'}
                      alt={selectedCourse.name || 'Course'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => { e.target.src = '/no-image.png'; }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600}>Subjects:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                    {selectedCourse.subjects?.map((sub, i) => (
                      <Chip key={i} label={sub} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>

                  <Typography variant="subtitle1" fontWeight={600}>Locations:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                    {selectedCourse.locations?.map((loc, i) => (
                      <Chip key={i} label={loc} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>

                  <Typography variant="subtitle1" fontWeight={600}>Modes:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                    {selectedCourse.modes?.map((mode, i) => (
                      <Chip key={i} label={mode} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>

                  <Typography variant="subtitle1" fontWeight={600}>Features:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                    {selectedCourse.features || '—'}
                  </Typography>

                  <Typography variant="subtitle1" fontWeight={600}>Description:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedCourse.description || '—'}
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
>>>>>>> master
