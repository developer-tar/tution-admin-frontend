import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../api';
import { toast } from 'react-toastify';

// Validation schema - Create separate schemas for add and edit modes
const createSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  year_id: yup.string().required('Year is required'),
  month_id: yup.string().required('Month is required'),
  day_id: yup.string().required('Day is required'),
  region_id: yup.string().required('Region is required'),
  gender_id: yup.string().required('Gender is required'),
  target_school_id: yup.string().required('Target school is required'),
  display_name: yup.string().required('Display name is required'),
  show_answer_after_n_attempts: yup.number().min(1, 'Must be at least 1').required('Required'),
  allow_view_examiner_report_for_mocks: yup.boolean(),
  can_change_password: yup.boolean(),
  bio: yup.string()
});

const editSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().optional(), // Optional and no minimum length in edit mode
  year_id: yup.string().required('Year is required'),
  month_id: yup.string().required('Month is required'),
  day_id: yup.string().required('Day is required'),
  region_id: yup.string().required('Region is required'),
  gender_id: yup.string().required('Gender is required'),
  target_school_id: yup.string().required('Target school is required'),
  display_name: yup.string().required('Display name is required'),
  show_answer_after_n_attempts: yup.number().min(1, 'Must be at least 1').required('Required'),
  allow_view_examiner_report_for_mocks: yup.boolean(),
  can_change_password: yup.boolean(),
  bio: yup.string()
});

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    years: [],
    months: [],
    days: [],
    regions: [],
    genders: [],
    targetSchools: []
  });
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(isEditMode ? editSchema : createSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      year_id: '',
      month_id: '',
      day_id: '',
      region_id: '',
      gender_id: '',
      target_school_id: '',
      display_name: '',
      show_answer_after_n_attempts: 2,
      allow_view_examiner_report_for_mocks: true,
      can_change_password: true,
      bio: ''
    }
  });

  useEffect(() => {
    fetchDropdowns();
    if (isEditMode) {
      fetchStudentData();
    }
  }, [id, isEditMode]);

  const fetchDropdowns = async () => {
    try {
      console.log('Fetching dropdowns using common API endpoints...');
      
      // Use the common API endpoints that are working in other parts of the application
      const [yearsRes, monthsRes, daysRes, regionsRes, gendersRes, schoolsRes] = await Promise.all([
        api.get('common/data?param=Years'),
        api.get('common/data?param=Months'),
        api.get('common/data?param=Days'),
        api.get('common/data?param=Regions'),
        api.get('common/data?param=Genders'),
        api.get('common/data?param=TargetSchools')
      ]);
      
      console.log('Dropdown API Responses:', {
        years: yearsRes.data,
        months: monthsRes.data,
        days: daysRes.data,
        regions: regionsRes.data,
        genders: gendersRes.data,
        schools: schoolsRes.data
      });
      
      const newDropdowns = {
        years: yearsRes.data.data || [],
        months: monthsRes.data.data || [],
        days: daysRes.data.data || [],
        regions: regionsRes.data.data || [],
        genders: gendersRes.data.data || [],
        targetSchools: schoolsRes.data.data || []
      };
      
      console.log('Setting dropdowns:', newDropdowns);
      setDropdowns(newDropdowns);
      
      // Silent loading - no success toast message
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
      console.error('Dropdown error details:', {
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error('Failed to load form options');
    } finally {
      setDropdownLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      console.log('Fetching student data for ID:', id);
      
      const response = await api.get(`admin/student/${id}/edit`);
      console.log('Student API Response:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('Student data to populate:', data);
        
        // Populate form with student data based on actual API response structure
        const formData = {
          first_name: data.student_user?.first_name || '',
          last_name: data.student_user?.last_name || '',
          email: data.student_user?.email || '',
          password: '', // Don't populate password for security
          year_id: data.year?.id?.toString() || '',
          month_id: data.month?.id?.toString() || '',
          day_id: data.day?.id?.toString() || '',
          region_id: data.region?.id?.toString() || '',
          gender_id: data.gender?.id?.toString() || '',
          target_school_id: data.target_school?.id?.toString() || '',
          display_name: data.display_name || '',
          show_answer_after_n_attempts: data.show_answer_after_n_attempts || 2,
          allow_view_examiner_report_for_mocks: Boolean(data.allow_view_examiner_report_for_mocks),
          can_change_password: Boolean(data.can_change_password),
          bio: data.bio || ''
        };
        
        console.log('Email from API:', data.student_user?.email);
        console.log('Email being set in form:', formData.email);
        
        console.log('Form data being set:', formData);
        reset(formData);
        
        // Silent loading - no success toast message
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error('Failed to load student data');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Clean up submission data
      const submitData = { ...data };
      
      // Convert string IDs to numbers
      const formattedData = {
        ...submitData,
        year_id: parseInt(submitData.year_id),
        month_id: parseInt(submitData.month_id),
        day_id: parseInt(submitData.day_id),
        region_id: parseInt(submitData.region_id),
        gender_id: parseInt(submitData.gender_id),
        target_school_id: parseInt(submitData.target_school_id),
        show_answer_after_n_attempts: parseInt(submitData.show_answer_after_n_attempts)
      };

      // Remove password if empty in edit mode
      if (isEditMode && !formattedData.password) {
        delete formattedData.password;
      }

      let response;
      if (isEditMode) {
        console.log('Updating student with data:', formattedData);
        response = await api.put(`admin/student/${id}`, formattedData);
      } else {
        console.log('Creating student with data:', formattedData);
        // Note: The API documentation doesn't specify a create endpoint, 
        // so using the standard admin/student endpoint
        response = await api.post('admin/student', formattedData);
      }
      
      console.log('Submit response:', response.data);

      if (response.data.success) {
        toast.success(isEditMode ? 'Student updated successfully' : 'Student created successfully');
        navigate('/admin/students');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });
      } else {
        toast.error(isEditMode ? 'Failed to update student' : 'Failed to create student');
      }
    } finally {
      setLoading(false);
    }
  };

  if (dropdownLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading form...</Typography>
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
          {isEditMode ? <EditIcon sx={{ color: 'white' }} /> : <PersonAddIcon sx={{ color: 'white' }} />}
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {isEditMode ? 'Edit Student' : 'Add New Student'}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          {isEditMode ? 'Update student information and settings' : 'Create a new student account with profile details'}
        </Typography>
        
        {isEditMode && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: 2, 
            border: '1px solid rgba(102, 126, 234, 0.2)',
            maxWidth: 500
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
              Editing Student ID: {id}
            </Typography>
            <Typography variant="caption" sx={{ color: '#718096' }}>
              Form will be populated with existing student data
            </Typography>
          </Box>
        )}
      </Box>

      <Card sx={{ 
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      InputProps={{
                        readOnly: isEditMode,
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          backgroundColor: isEditMode ? 'rgba(0,0,0,0.03)' : 'transparent',
                          color: isEditMode ? 'text.secondary' : 'inherit'
                        }
                      }}
                      error={!!errors.email}
                      helperText={isEditMode ? "Email cannot be changed" : errors.email?.message}
                    />
                  )}
                />
              </Grid>

              {!isEditMode && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Controller
                  name="display_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Display Name"
                      fullWidth
                      error={!!errors.display_name}
                      helperText={errors.display_name?.message}
                    />
                  )}
                />
              </Grid>

              {/* Personal Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 600, color: '#2d3748' }}>
                  Personal Details
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="year_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.year_id}>
                      <InputLabel>Year</InputLabel>
                      <Select {...field} label="Year">
                        {dropdowns.years.map((year) => (
                          <MenuItem key={year.id} value={year.id.toString()}>
                            {year.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.year_id && <Typography variant="caption" color="error">{errors.year_id.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="month_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.month_id}>
                      <InputLabel>Birth Month</InputLabel>
                      <Select {...field} label="Birth Month">
                        {dropdowns.months.map((month) => (
                          <MenuItem key={month.id} value={month.id.toString()}>
                            {month.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.month_id && <Typography variant="caption" color="error">{errors.month_id.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="day_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.day_id}>
                      <InputLabel>Birth Day</InputLabel>
                      <Select {...field} label="Birth Day">
                        {dropdowns.days.map((day) => (
                          <MenuItem key={day.id} value={day.id.toString()}>
                            {day.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.day_id && <Typography variant="caption" color="error">{errors.day_id.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="gender_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender_id}>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        {dropdowns.genders.map((gender) => (
                          <MenuItem key={gender.id} value={gender.id.toString()}>
                            {gender.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.gender_id && <Typography variant="caption" color="error">{errors.gender_id.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="region_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.region_id}>
                      <InputLabel>Region</InputLabel>
                      <Select {...field} label="Region">
                        {dropdowns.regions.map((region) => (
                          <MenuItem key={region.id} value={region.id.toString()}>
                            {region.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.region_id && <Typography variant="caption" color="error">{errors.region_id.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="target_school_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.target_school_id}>
                      <InputLabel>Target School</InputLabel>
                      <Select {...field} label="Target School">
                        {dropdowns.targetSchools.map((school) => (
                          <MenuItem key={school.id} value={school.id.toString()}>
                            {school.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.target_school_id && <Typography variant="caption" color="error">{errors.target_school_id.message}</Typography>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 600, color: '#2d3748' }}>
                  Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="show_answer_after_n_attempts"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Show Answer After N Attempts"
                      type="number"
                      fullWidth
                      error={!!errors.show_answer_after_n_attempts}
                      helperText={errors.show_answer_after_n_attempts?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  <Controller
                    name="allow_view_examiner_report_for_mocks"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Allow View Examiner Report for Mocks"
                      />
                    )}
                  />
                  
                  <Controller
                    name="can_change_password"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Can Change Password"
                      />
                    )}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bio"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.bio}
                      helperText={errors.bio?.message}
                    />
                  )}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/students')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 4,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      }
                    }}
                  >
                    {loading ? 'Saving...' : (isEditMode ? 'Update Student' : 'Create Student')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentForm;
