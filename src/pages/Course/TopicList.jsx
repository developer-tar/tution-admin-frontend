import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Paper, Button,
  Dialog, DialogTitle, DialogContent, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Skeleton, Card, CardContent, Avatar,
  IconButton
} from '@mui/material';
import { 
  Topic as TopicIcon, 
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

// Helper function to get media icon based on type
const getMediaIcon = (mediaType) => {
  if (mediaType?.startsWith('video/')) return <VideoIcon />;
  if (mediaType === 'application/pdf') return <PdfIcon />;
  if (mediaType?.startsWith('image/')) return <ImageIcon />;
  return <ImageIcon />; // Default fallback
};

// Helper function to get media color based on type
const getMediaColor = (mediaType) => {
  if (mediaType?.startsWith('video/')) return 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
  if (mediaType === 'application/pdf') return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
  if (mediaType?.startsWith('image/')) return 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
  return 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)'; // Default gray
};

// Helper function to check if media can be displayed as image
const canDisplayAsImage = (mediaType) => {
  return mediaType?.startsWith('image/');
};
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
  const [mediaViewer, setMediaViewer] = useState({ open: false, url: '', type: '', title: '' });

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

  const openMediaViewer = (url, type, title) => {
    setMediaViewer({ open: true, url, type, title });
  };

  const closeMediaViewer = () => {
    setMediaViewer({ open: false, url: '', type: '', title: '' });
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
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Topic ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Topic Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Academic Year</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Week</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Subtopic Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Subtopic Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#495057' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow 
                    key={idx}
                    sx={{
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.05)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={item.topic_id} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.topic_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.acdemicyears} 
                        size="small" 
                        sx={{ background: '#e8f5e8', color: '#2e7d32' }}
                      />
                    </TableCell>
                    <TableCell>{item.course_name}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Week {item.week_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.week_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.subject_name} 
                        size="small" 
                        sx={{ background: '#fff3e0', color: '#f57c00' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.subtopic?.length || 0} 
                        size="small" 
                        sx={{ 
                          background: item.subtopic?.length > 0 ? '#e8f5e8' : '#ffebee',
                          color: item.subtopic?.length > 0 ? '#2e7d32' : '#c62828',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 200 }}>
                        {item.subtopic?.length > 0 ? (
                          <Box>
                            {item.subtopic.slice(0, 2).map((sub, i) => (
                              <Chip
                                key={i}
                                label={sub.name}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  mr: 0.5, 
                                  mb: 0.5,
                                  fontSize: '10px',
                                  height: 20
                                }}
                              />
                            ))}
                            {item.subtopic.length > 2 && (
                              <Chip
                                label={`+${item.subtopic.length - 2} more`}
                                size="small"
                                sx={{ 
                                  background: '#e3f2fd',
                                  color: '#1976d2',
                                  fontSize: '10px',
                                  height: 20
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No subtopics
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // Check if there's any media in topic_media or subtopic media
                        const hasTopicMedia = item.topic_media?.length > 0;
                        const hasSubtopicMedia = item.subtopic?.some(sub => sub.media?.length > 0);
                        const hasAnyMedia = hasTopicMedia || hasSubtopicMedia;
                        
                        return hasAnyMedia && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => setSelectedTopic(item)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                              }
                            }}
                          >
                            View Media
                          </Button>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          {/* Topic Media Section */}
          {selectedTopic?.topic_media?.length > 0 && (
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '2px solid rgba(102, 126, 234, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    width: 40,
                    height: 40
                  }}>
                    <TopicIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#ff9800' }}>
                      Topic Media: {selectedTopic?.topic_name}
                    </Typography>
                    <Chip 
                      label={`${selectedTopic?.topic_media?.length} media files`} 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 0.5, borderColor: '#ff9800', color: '#ff9800' }}
                    />
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {selectedTopic?.topic_media?.map((media, j) => (
                    <Grid item xs={12} sm={6} md={4} key={j}>
                      <Card sx={{ 
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          '& .media-overlay': {
                            opacity: 1
                          }
                        }
                      }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={canDisplayAsImage(media.type) ? media.url : undefined}
                            sx={{ 
                              width: '100%', 
                              height: 150, 
                              borderRadius: 0,
                              background: getMediaColor(media.type)
                            }}
                            variant="square"
                          >
                            {getMediaIcon(media.type)}
                          </Avatar>
                          <Chip 
                            label={media.type?.split('/')[1]?.toUpperCase() || 'MEDIA'} 
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
                          
                          {/* Fancy Hover Overlay */}
                          <Box 
                            className="media-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(102, 126, 234, 0.8) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s ease'
                            }}
                          >
                            <Button
                              variant="contained"
                              onClick={() => openMediaViewer(media.url, media.type, `${selectedTopic?.topic_name} - Topic Media`)}
                              sx={{
                                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                                color: '#333',
                                fontWeight: 700,
                                px: 3,
                                py: 1.5,
                                borderRadius: 3,
                                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                                textTransform: 'none',
                                fontSize: '14px',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                                }
                              }}
                            >
                              {media.type?.startsWith('video/') ? '🎬 Play Video' :
                               media.type === 'application/pdf' ? '📄 View PDF' : '🖼️ View Image'}
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Subtopic Media Sections */}
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
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            '& .media-overlay': {
                              opacity: 1
                            }
                          }
                        }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={canDisplayAsImage(media.type) ? media.url : undefined}
                              sx={{ 
                                width: '100%', 
                                height: 150, 
                                borderRadius: 0,
                                background: getMediaColor(media.type)
                              }}
                              variant="square"
                            >
                              {getMediaIcon(media.type)}
                            </Avatar>
                            <Chip 
                              label={media.type?.split('/')[1]?.toUpperCase() || 'MEDIA'} 
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
                            
                            {/* Fancy Hover Overlay */}
                            <Box 
                              className="media-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(76, 175, 80, 0.8) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                              }}
                            >
                              <Button
                                variant="contained"
                                onClick={() => openMediaViewer(media.url, media.type, `${sub.name} - Subtopic Media`)}
                                sx={{
                                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                                  color: '#333',
                                  fontWeight: 700,
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 3,
                                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                                  textTransform: 'none',
                                  fontSize: '14px',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                    color: 'white',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                                  }
                                }}
                              >
                                {media.type?.startsWith('video/') ? '🎬 Play Video' :
                                 media.type === 'application/pdf' ? '📄 View PDF' : '🖼️ View Image'}
                              </Button>
                            </Box>
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

      {/* Enhanced Media Viewer Modal */}
      <Dialog
        open={mediaViewer.open}
        onClose={closeMediaViewer}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '85vh',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: '2px solid rgba(102, 126, 234, 0.2)'
          }
        }}
        TransitionProps={{
          timeout: 500
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              background: 'rgba(255,255,255,0.2)',
              width: 40,
              height: 40
            }}>
              {getMediaIcon(mediaViewer.type)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {mediaViewer.title}
              </Typography>
              <Chip 
                label={mediaViewer.type?.split('/')[1]?.toUpperCase() || 'MEDIA'} 
                size="small"
                sx={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '10px'
                }}
              />
            </Box>
          </Box>
          <IconButton
            onClick={closeMediaViewer}
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: '#000',
          position: 'relative'
        }}>
          {mediaViewer.type?.startsWith('video/') ? (
            <Box sx={{ width: '100%', position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 10,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: 2,
                px: 2,
                py: 1
              }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                  🎬 Playing Video - {mediaViewer.type?.split('/')[1]?.toUpperCase()}
                </Typography>
              </Box>
              <video
                controls
                autoPlay
                style={{
                  width: '100%',
                  height: '75vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              >
                <source src={mediaViewer.url} type={mediaViewer.type} />
                Your browser does not support the video tag.
              </video>
            </Box>
          ) : mediaViewer.type === 'application/pdf' ? (
            <Box sx={{ width: '100%', height: '75vh', position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 10,
                background: 'rgba(244, 67, 54, 0.9)',
                borderRadius: 2,
                px: 2,
                py: 1
              }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                  📄 PDF Document Viewer
                </Typography>
              </Box>
              <iframe
                src={mediaViewer.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'white'
                }}
                title="PDF Viewer"
              />
            </Box>
          ) : mediaViewer.type?.startsWith('image/') ? (
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ 
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 10,
                background: 'rgba(76, 175, 80, 0.9)',
                borderRadius: 2,
                px: 2,
                py: 1
              }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                  🖼️ Image Viewer - {mediaViewer.type?.split('/')[1]?.toUpperCase()}
                </Typography>
              </Box>
              <img
                src={mediaViewer.url}
                alt="Media"
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                background: 'rgba(255,255,255,0.1)'
              }}>
                {getMediaIcon(mediaViewer.type)}
              </Avatar>
              <Typography variant="h6" color="white" gutterBottom>
                Media format not supported for preview
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.open(mediaViewer.url, '_blank')}
                sx={{ 
                  mt: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                Open in New Tab
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TopicSubtopicList;
