import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Divider, Grid, MenuItem,
  FormControl, InputLabel, Select, Button
} from '@mui/material';
import { toast } from 'react-hot-toast';
import api from '../../api';

const TestList = () => {
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

  // Fetch Academic Courses
  useEffect(() => {
    api.get('admin/ca_records')
      .then(res => {
        const courses = (res.data.data || []).map(item => ({ id: item.id, name: item.name }));
        console.log('✅ Academic Courses:', courses);
        setDropdownData(prev => ({ ...prev, academicCourses: courses }));
      })
      .catch(() => toast.error('Failed to fetch academic courses'));
  }, []);

  // Fetch Subjects & Assignments when Academic Course changes
  useEffect(() => {
    const { academic_course_id } = filters;
    if (!academic_course_id) return;

    console.log('📥 Fetching Subjects & Assignments for:', academic_course_id);
    api.get(`admin/ca_based_weeks_subjects/${academic_course_id}`)
      .then(res => {
        console.log('✅ Subjects & Assignments Response:', res.data.data);
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
      .catch(err => {
        console.error('❌ Failed to fetch subjects/assignments:', err);
        toast.error('Failed to fetch subjects & assignments');
      });
  }, [filters.academic_course_id]);

  // Fetch Topics
  useEffect(() => {
    const { subject_id, assignment_id } = filters;
    if (!subject_id || !assignment_id) return;

    console.log('📥 Fetching Topics for:', { subject_id, assignment_id });
    api.get(`admin/fetch/course/topic/${subject_id}/${assignment_id}`)
      .then(res => {
        console.log('✅ Topics Response:', res.data.data);
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
      .catch(err => {
        console.error('❌ Failed to fetch topics:', err);
        toast.error('Failed to fetch topics');
      });
  }, [filters.subject_id, filters.assignment_id]);

  // Fetch Subtopics
  useEffect(() => {
    const { course_topic_id } = filters;
    if (!course_topic_id) return;

    console.log('📥 Fetching Subtopics for topic:', course_topic_id);
    api.get(`admin/fetch/course/subtopic/${course_topic_id}`)
      .then(res => {
        console.log('✅ Subtopics Response:', res.data.data);
        setDropdownData(prev => ({
          ...prev,
          subtopics: res.data.data || [],
        }));

        setFilters(prev => ({ ...prev, course_subtopic_id: '' }));
      })
      .catch(err => {
        console.error('❌ Failed to fetch subtopics:', err);
        toast.error('Failed to fetch subtopics');
      });
  }, [filters.course_topic_id]);

  const handleChange = (key) => (event) => {
    setFilters(prev => ({ ...prev, [key]: String(event.target.value) }));
  };

  const fetchTests = async () => {
    console.log('📤 Fetching Tests with Filters:', filters);
    setLoading(true);
    try {
      const res = await api.get('admin/assign/test', { params: filters });
      const responseData = res.data.data?.data;
      console.log('✅ Test Fetch Result:', responseData);
      setTests(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
      console.error('❌ Failed to fetch tests:', err);
      toast.error('Failed to fetch test data');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        📚 Test List
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Academic Course */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Academic Course</InputLabel>
            <Select
              value={filters.academic_course_id}
              label="Academic Course"
              onChange={(e) => setFilters(prev => ({
                ...prev,
                academic_course_id: String(e.target.value),
                subject_id: '',
                assignment_id: '',
                course_topic_id: '',
                course_subtopic_id: '',
              }))}
            >
              <MenuItem value="">All</MenuItem>
              {dropdownData.academicCourses.map((opt) => (
                <MenuItem key={opt.id} value={String(opt.id)}>{opt.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Other Dropdowns */}
        {[
          { key: 'subject_id', label: 'Subject', options: dropdownData.subjects },
          { key: 'assignment_id', label: 'Assignment', options: dropdownData.assignments },
          { key: 'course_topic_id', label: 'Topic', options: dropdownData.topics },
          { key: 'course_subtopic_id', label: 'Subtopic', options: dropdownData.subtopics },
        ].map(({ key, label, options }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <FormControl fullWidth size="small">
              <InputLabel>{label}</InputLabel>
              <Select
                value={filters[key]}
                label={label}
                onChange={handleChange(key)}
              >
                <MenuItem value="">All</MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.id || opt._id} value={String(opt.id || opt._id)}>
                    {opt.name || opt.assignment_name || opt.subject_name || opt.topic_name || opt.subtopic_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}

        {/* Apply Button */}
        <Grid item xs={12} sm={6} md={2}>
          <Button fullWidth variant="contained" onClick={fetchTests}>Apply Filters</Button>
        </Grid>
      </Grid>

      {/* Test Table */}
      {loading ? (
        <CircularProgress />
      ) : tests.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No tests found for the selected criteria.</Typography>
      ) : (
        <Grid container spacing={3}>
          {tests.map((test, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  📝 {test.test_name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Course:</strong> {test.course_name} &nbsp;|&nbsp;
                  <strong>Subject:</strong> {test.subject_name} &nbsp;|&nbsp;
                  <strong>Topic:</strong> {test.topic_name} &nbsp;|&nbsp;
                  <strong>Subtopic:</strong> {test.subtopic_name || 'N/A'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell><strong>Question</strong></TableCell>
                        <TableCell><strong>Options</strong></TableCell>
                        <TableCell><strong>Correct Answer</strong></TableCell>
                        <TableCell><strong>Duration (sec)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {test.questions.map((q, qIdx) => (
                        <TableRow key={qIdx} hover>
                          <TableCell sx={{ width: '35%' }}>{q.name}</TableCell>
                          <TableCell>
                            {q.options?.map((opt, i) => (
                              <Chip key={i} label={opt.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                          </TableCell>
                          <TableCell>
                            <Chip label={q.correct_answer} color="success" size="small" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>{q.duration_in_sec}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TestList;
