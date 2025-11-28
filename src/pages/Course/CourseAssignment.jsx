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
  CardContent,
  CircularProgress
} from '@mui/material';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [academicCourses, setAcademicCourses] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAssignment, setFetchingAssignment] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);

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
        const remainingWeeks = res.data.data || [];
        
        console.log('🔵 Fetched remaining weeks:', remainingWeeks);
        console.log('🔵 Assignment data available:', !!assignmentData);
        console.log('🔵 Is edit mode:', isEditMode);
        
        // In edit mode, if we have assignment data with week_details, add the assigned week to the list
        let allWeeks = [...remainingWeeks];
        
        if (isEditMode && assignmentData) {
          console.log('🔵 Processing assignment data for weeks:', assignmentData);
          
          // Check if assignment has week_details (from API response)
          if (assignmentData.week_details) {
            const assignedWeek = assignmentData.week_details;
            console.log('🔵 Found week_details:', assignedWeek);
            
            // Check if this week is not already in the remaining weeks list
            const weekExists = remainingWeeks.some(w => {
              const weekId = typeof w.id === 'string' ? parseInt(w.id, 10) : w.id;
              const assignedWeekId = typeof assignedWeek.id === 'string' ? parseInt(assignedWeek.id, 10) : assignedWeek.id;
              return weekId === assignedWeekId || Number(weekId) === Number(assignedWeekId);
            });
            
            console.log('🔵 Week exists in remaining weeks:', weekExists);
            
            if (!weekExists) {
              // Add the assigned week to the list so it can be displayed in the dropdown
              // Match the structure of remaining weeks - use start_end_date as name if available
              // Check what structure remaining weeks have
              const sampleWeek = remainingWeeks[0];
              console.log('🔵 Sample remaining week structure:', sampleWeek);
              
              // Combine week_number and start_end_date for display
              let weekName = '';
              if (assignedWeek.week_number && assignedWeek.start_end_date) {
                weekName = `${assignedWeek.week_number} - ${assignedWeek.start_end_date}`;
              } else if (assignedWeek.start_end_date) {
                weekName = assignedWeek.start_end_date;
              } else if (assignedWeek.week_number) {
                weekName = assignedWeek.week_number;
              } else {
                weekName = `Week ${assignedWeek.id}`;
              }
              
              // Use the same structure as remaining weeks
              const weekToAdd = {
                id: assignedWeek.id,
                name: weekName,
                start_date: assignedWeek.start_date,
                end_date: assignedWeek.end_date,
                start_end_date: assignedWeek.start_end_date,
                week_number: assignedWeek.week_number
              };
              
              console.log('✅ Adding assigned week to list:', weekToAdd);
              allWeeks.push(weekToAdd);
              
              // Sort weeks by ID to maintain order
              allWeeks.sort((a, b) => {
                const aId = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
                const bId = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
                return aId - bId;
              });
            }
          }
          
          // Also check for week_id and fetch week details if needed
          if (assignmentData.week_id && !assignmentData.week_details) {
            console.log('🔵 Found week_id but no week_details:', assignmentData.week_id);
            // If we have week_id but no week_details, we might need to fetch it
            // For now, we'll try to construct it from available data
            const weekId = assignmentData.week_id;
            const weekExists = remainingWeeks.some(w => {
              const wId = typeof w.id === 'string' ? parseInt(w.id, 10) : w.id;
              return wId === weekId || Number(wId) === Number(weekId);
            });
            
            if (!weekExists) {
              // Add a placeholder week entry so the dropdown can show it
              console.log('✅ Adding placeholder week:', weekId);
              allWeeks.push({
                id: weekId,
                name: `Week ${weekId}`,
                start_date: '',
                end_date: '',
                start_end_date: ''
              });
            }
          }
        }
        
        console.log('🔵 Final weeks list:', allWeeks);
        
        // Show all available weeks (remaining + assigned week if in edit mode)
        setWeeks(allWeeks);
        // Only reset week_ids if not in edit mode or if course changed
        if (!isEditMode) {
          setValue('week_ids', []);
        }
      } catch (err) {
        console.error('Error fetching weeks:', err);
        toast.error("Failed to fetch weeks");
      }
    };
    fetchWeeks();
  }, [selectedCourseId, setValue, isEditMode, assignmentData]);

  // Fetch assignment data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchAssignmentData = async () => {
        setFetchingAssignment(true);
        try {
          const response = await api.get(`admin/assign/assignment/${id}`);
          if (response.data.success) {
            const assignmentData = response.data.data;
            
            // Store assignment data in state for later use (especially for week_ids dropdown)
            setAssignmentData(assignmentData);
            
            // Set academic course immediately (this triggers weeks fetch)
            setValue('acdemic_course_id', assignmentData.acdemic_course_id || '');
            
            // Note: week_ids will be set in a separate useEffect that waits for weeks to load
          }
        } catch (err) {
          console.error('Error fetching assignment:', err);
          if (err.response?.status === 404) {
            toast.error('Assignment not found');
            navigate('/admin/assignment-list');
          } else {
            toast.error('Failed to load assignment data');
          }
        } finally {
          setFetchingAssignment(false);
        }
      };
      fetchAssignmentData();
    }
  }, [id, isEditMode, setValue, navigate]);

  // Set week_ids value when both weeks and assignmentData are available
  useEffect(() => {
    if (isEditMode && assignmentData && weeks.length > 0) {
      // Handle both week_id (singular) and week_ids (array) from API
      let weekIdsToSet = [];
      
      if (assignmentData.week_ids && Array.isArray(assignmentData.week_ids) && assignmentData.week_ids.length > 0) {
        // API returned week_ids as array
        weekIdsToSet = assignmentData.week_ids;
      } else if (assignmentData.week_id !== undefined && assignmentData.week_id !== null) {
        // API returned week_id as singular value - convert to array
        weekIdsToSet = [assignmentData.week_id];
      }
      
      console.log('🔵 Week selection useEffect triggered');
      console.log('🔵 Assignment data:', assignmentData);
      console.log('🔵 Week IDs to set:', weekIdsToSet);
      console.log('🔵 Available weeks:', weeks);
      console.log('🔵 Week IDs in dropdown:', weeks.map(w => ({ id: w.id, name: w.name })));
      
      if (weekIdsToSet.length > 0) {
        // Verify all week IDs exist in the weeks dropdown and convert to numbers
        const validWeekIds = weekIdsToSet
          .map(weekId => {
            // Convert to number if string
            const numWeekId = typeof weekId === 'string' ? parseInt(weekId, 10) : weekId;
            // Check if this week ID exists in the weeks dropdown
            const weekExists = weeks.some(w => {
              const weekIdNum = typeof w.id === 'string' ? parseInt(w.id, 10) : w.id;
              const matches = weekIdNum === numWeekId || Number(weekIdNum) === Number(numWeekId);
              if (matches) {
                console.log('✅ Found matching week:', w);
              }
              return matches;
            });
            return weekExists ? numWeekId : null;
          })
          .filter(id => id !== null);
        
        if (validWeekIds.length > 0) {
          console.log('✅ Setting week_ids:', validWeekIds);
          setValue('week_ids', validWeekIds, { shouldValidate: false, shouldDirty: true });
        } else {
          console.error('❌ Week IDs not found in dropdown:', weekIdsToSet, 'Available weeks:', weeks.map(w => ({ id: w.id, name: w.name })));
        }
      }
    }
  }, [weeks, assignmentData, isEditMode, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    // Prepare request body according to API documentation
    // For update (PUT): use JSON format
    // For create (POST): use FormData (existing implementation)
    let requestData;
    let config = {};
    
    if (isEditMode) {
      // Update: Use JSON format as per API documentation
      requestData = {
        acdemic_course_id: data.acdemic_course_id || undefined,
        week_ids: data.week_ids && data.week_ids.length > 0 ? data.week_ids : undefined
      };
      
      // Remove undefined fields
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined) {
          delete requestData[key];
        }
      });
      
      config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } else {
      // Create: Use FormData (existing implementation)
      // Use week_ids[] format as per API documentation
      const formData = new FormData();
      formData.append("acdemic_course_id", data.acdemic_course_id);
      data.week_ids.forEach((weekId) => formData.append('week_ids[]', weekId));
      requestData = formData;
    }

    try {
      const endpoint = isEditMode 
        ? `admin/assign/assignment/${id}` 
        : 'admin/assign/assignment';
      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](endpoint, requestData, config);
      
      // Check for successful response (201 Created or 200 OK)
      if (response.status === 201 || response.status === 200) {
        toast.success(isEditMode ? "Assignment updated successfully" : "Assignment created successfully");
        if (isEditMode) {
          navigate('/admin/assignment-list');
        } else {
          reset();
          navigate('/admin/assignment-list');
        }
      }
    } catch (err) {
      console.error('Assignment save error:', err.response || err);
      
      if (err?.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error(err.response.data?.message || 'Validation error occurred');
        }
      } else if (err.response?.status === 404) {
        toast.error('Assignment not found');
        if (isEditMode) {
          navigate('/admin/assignment-list');
        }
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(isEditMode 
          ? "Failed to update assignment" 
          : "Failed to create assignment"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAssignment) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading assignment data...
          </Typography>
        </Box>
      </Box>
    );
  }

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
            {isEditMode ? 'Edit Course Assignment' : 'Course Assignment'}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
          {isEditMode 
            ? 'Update the assignment of academic courses to specific weeks'
            : 'Assign academic courses to specific weeks for better organization and scheduling'
          }
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
                disabled={loading || fetchingAssignment}
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
                  '&:disabled': {
                    opacity: 0.6,
                  },
                  transition: 'all 0.3s ease'
                }}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <AssignmentIcon />}
                endIcon={!loading && <ArrowForwardIcon />}
              >
                {loading 
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Assignment' : 'Create Assignment')
                }
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseAssignment;