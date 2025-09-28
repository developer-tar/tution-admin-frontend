import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Paper, Button,
  Dialog, DialogTitle, DialogContent, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const BASE_IMAGE_URL = 'https://yourdomain.com'; // Replace this with your actual domain

const TopicSubtopicList = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    acdemic_course_id: '',
    subject_id: '',
    assignment_id: '',
    course_topic_id: '',
    course_subtopic_id: ''
  });

  const [dropdowns, setDropdowns] = useState({
    courses: [],
    subjects: [],
    assignments: [],
    topics: [],
    subtopics: []
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    fetchTopicSubtopics(false);
    api.get('admin/ca_records').then(res => {
      setDropdowns(prev => ({ ...prev, courses: res.data.data || [] }));
    });
  }, []);

  useEffect(() => {
    if (filters.acdemic_course_id) {
      api.get(`admin/ca_based_weeks_subjects/${filters.acdemic_course_id}`).then(res => {
        setDropdowns(prev => ({
          ...prev,
          subjects: res.data.data?.subjects || [],
          assignments: res.data.data?.assignments || []
        }));
      });
    }
  }, [filters.acdemic_course_id]);

  useEffect(() => {
    if (filters.assignment_id && filters.subject_id) {
      api.get(`admin/fetch/course/topic/${filters.subject_id}/${filters.assignment_id}`).then(res => {
        setDropdowns(prev => ({ ...prev, topics: res.data.data || [] }));
      });
    }
  }, [filters.assignment_id, filters.subject_id]);

  useEffect(() => {
    if (filters.course_topic_id) {
      api.get(`admin/fetch/course/subtopic/${filters.course_topic_id}`).then(res => {
        setDropdowns(prev => ({ ...prev, subtopics: res.data.data || [] }));
      });
    }
  }, [filters.course_topic_id]);

  const fetchTopicSubtopics = async (applyFilters = false) => {
    setLoading(true);
    try {
      const params = applyFilters ? filters : {};
      const res = await api.get('admin/assign/topic/subtopic', { params });
      setData(res.data.data?.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch topic-subtopic list');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'acdemic_course_id' && {
        subject_id: '', assignment_id: '', course_topic_id: '', course_subtopic_id: ''
      }),
      ...((key === 'subject_id' || key === 'assignment_id') && {
        course_topic_id: '', course_subtopic_id: ''
      }),
      ...(key === 'course_topic_id' && { course_subtopic_id: '' })
    }));
  };

  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Topic & Subtopic Media</Typography>
        <Button
          onClick={() => navigate('/admin/course-content')}
          sx={{
            background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
            color: '#fff', fontWeight: 600, px: 3, py: 1, borderRadius: 2, textTransform: 'none',
            '&:hover': { opacity: 0.9 }
          }}
        >
          + Add Content
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { key: 'acdemic_course_id', label: 'Academic Course', options: dropdowns.courses },
          { key: 'subject_id', label: 'Subject', options: dropdowns.subjects },
          { key: 'assignment_id', label: 'Assignment', options: dropdowns.assignments },
          { key: 'course_topic_id', label: 'Topic', options: dropdowns.topics },
          { key: 'course_subtopic_id', label: 'Subtopic', options: dropdowns.subtopics },
        ].map(({ key, label, options }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <TextField
              select fullWidth size="small" label={label}
              value={filters[key]}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              disabled={
                key !== 'acdemic_course_id' &&
                !filters[key === 'subject_id' ? 'acdemic_course_id' :
                  key === 'assignment_id' ? 'acdemic_course_id' :
                    key === 'course_topic_id' ? 'assignment_id' :
                      key === 'course_subtopic_id' ? 'course_topic_id' : '']
              }
            >
              {options.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.name || opt.assignment_name || opt.topic_name || opt.subject_name || opt.subtopic_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ))}

        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => fetchTopicSubtopics(true)}
            sx={{
              background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
              color: '#fff', fontWeight: 600, px: 3, py: 1, borderRadius: 2, textTransform: 'none',
              '&:hover': { opacity: 0.9 }
            }}
          >
            🔍 Apply Filters
          </Button>
          <Button
            onClick={() => {
              setFilters({
                acdemic_course_id: '', subject_id: '', assignment_id: '', course_topic_id: '', course_subtopic_id: ''
              });
              fetchTopicSubtopics(false);
            }}
            variant="outlined"
            sx={{ ml: 2, borderRadius: 2 }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>

      {/* Skeleton or Table */}
      {loading ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['Topic ID', 'Topic Name', 'Academic Year', 'Course', 'Week', 'Subject', 'Media', 'Action'].map((text, i) => (
                  <TableCell key={i}><Skeleton width={100} /></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((__, j) => (
                    <TableCell key={j}><Skeleton width="80%" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : data.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No data found</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Topic ID</b></TableCell>
                <TableCell><b>Topic Name</b></TableCell>
                <TableCell><b>Academic Year</b></TableCell>
                <TableCell><b>Course</b></TableCell>
                <TableCell><b>Week</b></TableCell>
                <TableCell><b>Subject</b></TableCell>
                <TableCell><b>Media</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.topic_id}</TableCell>
                  <TableCell>{item.topic_name}</TableCell>
                  <TableCell>{item.acdemicyears}</TableCell>
                  <TableCell>{item.course_name}</TableCell>
                  <TableCell>{item.week_number} ({item.week_name})</TableCell>
                  <TableCell>{item.subject_name}</TableCell>
                  <TableCell>
                    {item.topic_media?.length > 0 ? (
                      item.topic_media.map((m, i) => (
                        <img
                          key={i}
                          src={`${BASE_IMAGE_URL}${m.url.replace('http://localhost', '')}`}
                          alt=""
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, marginRight: 6 }}
                        />
                      ))
                    ) : 'No media'}
                  </TableCell>
                  <TableCell>
                    {item.subtopic?.length > 0 && (
                      <Button variant="outlined" size="small" onClick={() => setSelectedTopic(item)}>
                        View All Subtopics
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Subtopics */}
      <Dialog open={!!selectedTopic} onClose={() => setSelectedTopic(null)} maxWidth="md" fullWidth>
        <DialogTitle>Subtopics for: {selectedTopic?.topic_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ px: 2, py: 1 }}>
            {selectedTopic?.subtopic?.map((sub, i) => (
              <Box key={i} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600}>{sub.name} (ID: {sub.id})</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {sub.media?.map((media, j) => (
                    <Grid item xs={6} sm={4} md={3} key={j}>
                      <Chip label={media.type} size="small" />
                      <img
                        src={`${BASE_IMAGE_URL}${media.url.replace('http://localhost', '')}`}
                        alt=""
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TopicSubtopicList;
