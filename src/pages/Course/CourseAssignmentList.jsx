import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
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
  Grid
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../api';

const CourseAssignmentList = () => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    acdemic_course_id: '',
    assigned_weeks: ''
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Fetch academic courses
  useEffect(() => {
    api.get('admin/ca_records')
      .then(res => {
        setCourses(res.data.data || []);
        toast.success('Academic courses loaded');
      })
      .catch(() => toast.error('Failed to load academic courses'));
  }, []);

  // Fetch assignments based on filters
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
        toast[list.length ? 'success' : 'info'](
          list.length ? `${list.length} week(s) loaded` : 'No weeks found'
        );
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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Course Week Assignment List
      </Typography>

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

      {/* Table */}
      {loading ? (
        <CircularProgress />
      ) : !filters.acdemic_course_id || filters.assigned_weeks === '' ? (
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
