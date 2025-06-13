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
  Button
} from '@mui/material';
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
    opacity: 0.9
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
    <Box sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Course Week Assignment List</Typography>
        <Button sx={gradientButtonStyle} onClick={() => navigate('/admin/course-assignment')}>
          + Add Assignment
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Academic Course</InputLabel>
            <Select
              value={filters.acdemic_course_id}
              label="Select Academic Course"
              onChange={(e) => handleFilterChange('acdemic_course_id', String(e.target.value))}
            >
              {courses.map(course => (
                <MenuItem key={course.id} value={String(course.id)}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Assigned Weeks</InputLabel>
            <Select
              value={filters.assigned_weeks}
              label="Assigned Weeks"
              onChange={(e) => handleFilterChange('assigned_weeks', String(e.target.value))}
            >
              <MenuItem value="1">Assigned Weeks</MenuItem>
              <MenuItem value="0">Unassigned Weeks</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table Display */}
      {loading ? (
        <Paper sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Week Number</strong></TableCell>
                  <TableCell><strong>Start–End Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
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
        </Paper>
      ) : !isFilterSelected ? (
        <Typography>Select both filters to load data.</Typography>
      ) : assignments.length === 0 ? (
        <Typography>No data found for selected filters.</Typography>
      ) : (
        <Paper sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Week Number</strong></TableCell>
                  <TableCell><strong>Start–End Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.week_number || item.weeks?.week_number || 'N/A'}</TableCell>
                      <TableCell>{item.start_end_date || item.weeks?.start_end_date || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={filters.assigned_weeks === '1' ? 'Assigned' : 'Unassigned'}
                          color={filters.assigned_weeks === '1' ? 'success' : 'warning'}
                          size="small"
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
          />
        </Paper>
      )}
    </Box>
  );
};

export default CourseAssignmentList;
