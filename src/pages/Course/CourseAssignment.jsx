import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Chip,
  Autocomplete,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import api from "../../api";
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  acdemic_course_id: yup
    .number()
    .typeError('Academic Course is required')
    .required('Academic Course is required'),
  week_ids: yup
    .array()
    .of(yup.number().typeError('Invalid week ID'))
    .min(1, 'Please select at least one week')
    .required('Weeks are required'),
});

const CourseAssignment = () => {
  const navigate = useNavigate();
  const [academicCourses, setAcademicCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      acdemic_course_id: '',
      week_ids: [],
    },
  });

  const selectedCourseId = watch('acdemic_course_id');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('admin/ca_records');
        const courses = res.data.data || [];
        
        // Sort courses to show selected course first if any
        const sortedCourses = courses.sort((a, b) => {
          if (selectedCourseId && a.id === selectedCourseId) return -1;
          if (selectedCourseId && b.id === selectedCourseId) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setAcademicCourses(sortedCourses);
      } catch (err) {
        toast.error("Failed to fetch academic records");
      }
    };
    fetchCourses();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchWeeks = async () => {
      try {
        const res = await api.get(`admin/ca_based_remaining_weeks/${selectedCourseId}`);
        const allWeeks = res.data.data || [];
        
        // Show all available weeks for assignment
        setWeeks(allWeeks);
        setValue('week_ids', []);
      } catch (err) {
        toast.error("Failed to fetch weeks");
      }
    };
    fetchWeeks();
  }, [selectedCourseId, setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("acdemic_course_id", data.acdemic_course_id);
    data.week_ids.forEach((id, i) => formData.append(`week_ids[${i}]`, id));

    try {
      const response = await api.post('admin/assign/assignment', formData);
      
      // Check for successful response (201 Created or 200 OK)
      if (response.status === 201 || response.status === 200) {
        toast.success("Assignment created successfully");
        reset();
        // Redirect to assignment list page
        navigate('/admin/assignment-list');
      }
    } catch (err) {
      if (err?.response?.status === 422) {
        const messages = err.response.data?.errors;
        Object.values(messages).forEach((msgArr) => toast.error(msgArr[0]));
      } else {
        toast.error("Failed to create assignment");
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '25px',
          px: 3,
          py: 1,
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
          width: 'fit-content'
        }}>
          <AssignmentIcon sx={{ fontSize: 20, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Course Assignment
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
          Assign academic courses to specific weeks for better organization and scheduling
        </Typography>
      </Box>

      {/* Main Form Card */}
      <Card sx={{ 
        // maxWidth: 700, 
        // mx: 'auto', 
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Academic Course Section */}
            <Grid item xs={6}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <SchoolIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#263238' }}>
                    Select Academic Course
                  </Typography>
                </Box>
                <Controller
                  name="acdemic_course_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={academicCourses}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={academicCourses.find((c) => c.id === field.value) || null}
                      onChange={(e, newValue) => field.onChange(newValue ? newValue.id : '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="Choose an academic course..."
                          error={!!errors.acdemic_course_id}
                          helperText={errors.acdemic_course_id?.message}
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                            }
                          }}
                        />
                      )}
                    />
                  )}
                />
              </Paper>
            </Grid>

            {/* Weeks Section */}
            <Grid item xs={6}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fff8f0 0%, #fef3e8 100%)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CalendarTodayIcon sx={{ color: '#ff9800', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#263238' }}>
                    Select Weeks
                  </Typography>
                </Box>
                <Controller
                  name="week_ids"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={weeks}
                      getOptionLabel={(option) => option.name}
                      value={weeks.filter((w) => field.value.includes(w.id))}
                      onChange={(e, newValue) => field.onChange(newValue.map((item) => item.id))}
                      disableCloseOnSelect
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.name}
                            {...getTagProps({ index })}
                            sx={{
                              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                              color: 'white',
                              fontWeight: 600,
                              m: 0.5,
                              '&:hover': { background: 'linear-gradient(45deg, #f57c00, #e65100)' }
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="Select available weeks..."
                          error={!!errors.week_ids}
                          helperText={errors.week_ids?.message}
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                              '&:hover fieldset': { borderColor: '#ff9800' },
                              '&.Mui-focused fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                            }
                          }}
                        />
                      )}
                    />
                  )}
                />
              </Paper>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                onClick={handleSubmit(onSubmit)}
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '16px',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
                startIcon={<AssignmentIcon />}
                endIcon={<ArrowForwardIcon />}
              >
                Create Assignment
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseAssignment;