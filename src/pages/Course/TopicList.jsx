import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Paper, Button,
  Dialog, DialogTitle, DialogContent, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Skeleton, Card, CardContent, Avatar
} from '@mui/material';
import { 
  Topic as TopicIcon, 
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  Collections as CollectionsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const BASE_IMAGE_URL = 'https://yourdomain.com'; // Replace this with your actual domain
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
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        {/* Left Side - Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 56,
            height: 56
          }}>
            <TopicIcon sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Topic & Subtopic Media
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage course topics and their multimedia content
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Add Button */}
        <Button
        
           sx={gradientButtonStyle} onClick={() => navigate('/admin/course-content')}>
                          + Add Content
                  </Button>
             
      </Box>

      {/* Filters Card */}
      <Card sx={{ 
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              width: 48,
              height: 48
            }}>
              <FilterIcon sx={{ color: 'white' }} />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Filter Topics & Subtopics
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              { key: 'acdemic_course_id', label: 'Academic Course', options: dropdowns.courses },
              { key: 'subject_id', label: 'Subject', options: dropdowns.subjects },
              { key: 'assignment_id', label: 'Assignment', options: dropdowns.assignments },
              { key: 'course_topic_id', label: 'Topic', options: dropdowns.topics },
              { key: 'course_subtopic_id', label: 'Subtopic', options: dropdowns.subtopics },
            ].map(({ key, label, options }) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  select 
                  fullWidth 
                  label={label}
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  disabled={
                    key !== 'acdemic_course_id' &&
                    !filters[key === 'subject_id' ? 'acdemic_course_id' :
                      key === 'assignment_id' ? 'acdemic_course_id' :
                        key === 'course_topic_id' ? 'assignment_id' :
                          key === 'course_subtopic_id' ? 'course_topic_id' : '']
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'white'
                    }
                  }}
                >
                  {options.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>
                      {opt.name || opt.assignment_name || opt.topic_name || opt.subject_name || opt.subtopic_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={() => fetchTopicSubtopics(true)}
                startIcon={<FilterIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  color: '#fff', 
                  fontWeight: 600, 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 3, 
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  setFilters({
                    acdemic_course_id: '', subject_id: '', assignment_id: '', course_topic_id: '', course_subtopic_id: ''
                  });
                  fetchTopicSubtopics(false);
                }}
                startIcon={<RefreshIcon />}
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#f57c00',
                    background: 'rgba(255, 152, 0, 0.1)'
                  }
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card sx={{ 
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        {loading ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                  {['Topic ID', 'Topic Name', 'Academic Year', 'Course', 'Week', 'Subject', 'Media', 'Action'].map((text, i) => (
                    <TableCell key={i} sx={{ fontWeight: 600 }}>
                      <Skeleton width={100} />
                    </TableCell>
                  ))}
                </TableRow>
              {loading ? (
                <Grid container spacing={3}>
                  {[...Array(6)].map((_, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={index}>
                      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                              <Skeleton width="60%" height={24} />
                              <Skeleton width="40%" height={20} sx={{ mt: 0.5 }} />
              mx: 'auto', 
              mb: 2,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
            }}>
              <TopicIcon sx={{ fontSize: 40, color: '#1976d2' }} />
            </Avatar>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Topics Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or add some content
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {data.map((item, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  {/* Header with ID and Title */}
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Chip 
                        label={`#${item.topic_id}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        label={item.acdemicyears}
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                          color: '#2e7d32',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700,
                      mt: 1,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.topic_name}
                    </Typography>
                  </Box>

                  {/* Media Preview */}
                  <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.topic_media?.length > 0 ? (
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          p: 1,
                          width: '100%',
                          height: '100%',
                          overflowX: 'auto',
                          '&::-webkit-scrollbar': {
                            height: '6px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '3px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '3px',
                          },
                        }}>
                          {item.topic_media.map((m, i) => (
                            <Box 
                              key={i}
                              sx={{
                                flex: '0 0 auto',
                                width: 120,
                                height: 120,
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                '&:hover .media-overlay': {
                                  opacity: 1
                                }
                              }}
                            >
                              <img
                                src={`${BASE_IMAGE_URL}${m.url.replace('http://localhost', '')}`}
                                alt={`Media ${i + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                              <Box 
                                className="media-overlay"
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: 'rgba(0,0,0,0.4)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.3s ease',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                              >
                                <ZoomInIcon />
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          p: 3,
                          textAlign: 'center',
                          color: 'text.secondary'
                        }}>
                          <ImageIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                          <Typography variant="body2">No media available</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Footer with Actions */}
                  <Box sx={{ 
                    p: 2, 
                    mt: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box>
                      <Chip 
                        label={item.subject_name}
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                          color: '#f57c00',
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Week {item.week_number}
                      </Typography>
                    </Box>
                    
                    {item.subtopic?.length > 0 && (
                      <Button 
                        variant="contained"
                        size="small"
                        onClick={() => setSelectedTopic(item)}
                        sx={{
                          background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
                          color: 'white',
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        View ({item.subtopic.length})
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>

      {/* Enhanced Dialog for Subtopics */}
      <Dialog 
        open={!!selectedTopic} 
        onClose={() => setSelectedTopic(null)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3
        }}>
          <Avatar sx={{ background: 'rgba(255,255,255,0.2)' }}>
            <TopicIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Subtopics for: {selectedTopic?.topic_name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedTopic?.subtopic?.length || 0} subtopics found
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedTopic?.subtopic?.map((sub, i) => (
            <Card key={i} sx={{ 
              mb: 3, 
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                    width: 40,
                    height: 40
                  }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                      {i + 1}
                    </Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {sub.name}
                    </Typography>
                    <Chip 
                      label={`ID: ${sub.id}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {sub.media?.length > 0 ? (
                    sub.media.map((media, j) => (
                      <Grid item xs={12} sm={6} md={4} key={j}>
                        <Card sx={{ 
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={`${BASE_IMAGE_URL}${media.url.replace('http://localhost', '')}`}
                              sx={{ 
                                width: '100%', 
                                height: 150, 
                                borderRadius: 0
                              }}
                              variant="square"
                            >
                              {media.type === 'video' ? <VideoIcon /> : 
                               media.type === 'pdf' ? <PdfIcon /> : <ImageIcon />}
                            </Avatar>
                            <Chip 
                              label={media.type?.toUpperCase() || 'MEDIA'} 
                              size="small"
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: 'text.secondary'
                      }}>
                        <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2">
                          No media available for this subtopic
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TopicSubtopicList;
