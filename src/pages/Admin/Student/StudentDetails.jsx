import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api';
import { toast } from 'react-toastify';

const StudentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`admin/student/${id}/edit`);
      if (response.data.success) {
        setStudent(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student details');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading student details...</Typography>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Student not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/admin/students')}
        sx={{ 
          mb: 3,
          color: '#5a6c7d',
          fontWeight: 600,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
        }}
      >
        Back to Student List
      </Button>

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
          <PersonIcon sx={{ color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Student Details
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          View comprehensive student profile and assigned courses
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Student Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '2.5rem',
                fontWeight: 600
              }}>
                {student.student_user?.first_name?.[0] || 'S'}
              </Avatar>
              
              <Typography variant="h5" fontWeight={700} color="#2d3748" gutterBottom>
                {student.student_user?.first_name} {student.student_user?.last_name}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {student.display_name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {student.student_user?.email}
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admin/student/${id}/edit`)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  }
                }}
              >
                Edit Student
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Student Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SchoolIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Year</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {student.year?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {student.gender?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Birth Date</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {student.day?.name} {student.month?.name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LocationIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Region</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {student.region?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SchoolIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Target School</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {student.target_school?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {student.bio && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <PsychologyIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Bio</Typography>
                        <Typography variant="body1">
                          {student.bio}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                Account Settings
              </Typography>
              
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Show Answer After Attempts" 
                    secondary={`${student.show_answer_after_n_attempts || 2} attempts`}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="View Examiner Report for Mocks" 
                    secondary={
                      <Chip 
                        label={student.allow_view_examiner_report_for_mocks ? 'Allowed' : 'Not Allowed'}
                        color={student.allow_view_examiner_report_for_mocks ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Can Change Password" 
                    secondary={
                      <Chip 
                        label={student.can_change_password ? 'Yes' : 'No'}
                        color={student.can_change_password ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Courses Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                Assigned Courses ({student.assigned_courses?.length || 0})
              </Typography>
              
              {student.assigned_courses && student.assigned_courses.length > 0 ? (
                <List>
                  {student.assigned_courses.map((course, index) => (
                    <ListItem key={course.id || index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={course.course_name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={course.is_completed ? 'Completed' : 'In Progress'}
                              color={course.is_completed ? 'success' : 'primary'}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Assigned: {new Date(course.assigned_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No courses assigned yet
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Parent Information */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                Parent Information
              </Typography>
              
              {student.parent ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      }}>
                        {student.parent.first_name?.[0] || 'P'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {student.parent.first_name} {student.parent.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.parent.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No parent assigned
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDetails;
