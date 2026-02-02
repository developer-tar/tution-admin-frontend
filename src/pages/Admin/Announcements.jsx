import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Skeleton,
  Paper,
  Alert,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../api';
import { toast } from 'react-toastify';

const announcementSchema = yup.object().shape({
  title: yup.string().required('Title is required').max(255, 'Title cannot exceed 255 characters'),
  message: yup.string().required('Message is required'),
  status: yup.number().required('Status is required').oneOf([0, 1]), // 0 = draft, 1 = publish
  target_audience: yup.array().nullable(),
  specific_users: yup.array().nullable(),
  module_id: yup.number().nullable(),
  academic_year_id: yup.number().nullable(),
  course_id: yup.number().nullable(),
  class_id: yup.number().nullable(),
}).test('targeting-required', 'Either target audience (roles) or specific users must be provided', function(value) {
  const hasTargetAudience = value.target_audience && value.target_audience.length > 0;
  const hasSpecificUsers = value.specific_users && value.specific_users.length > 0;
  return hasTargetAudience || hasSpecificUsers;
});

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [moduleModes, setModuleModes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingModuleModes, setLoadingModuleModes] = useState(false);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(announcementSchema),
    defaultValues: {
      title: '',
      message: '',
      status: 0, // 0 = draft, 1 = publish
      target_audience: [],
      specific_users: [],
      module_id: null,
      academic_year_id: null,
      course_id: null,
      class_id: null,
    },
  });

  // Debounce search term to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch roles, module modes, academic years, students, and parents only once on component mount
  useEffect(() => {
    fetchRoles();
    fetchModuleModes();
    fetchAcademicYears();
    fetchStudents();
    fetchParents();
  }, []); // Empty dependency array - only run once

  // Fetch announcements when filters change
  useEffect(() => {
    fetchAnnouncements();
  }, [page, rowsPerPage, debouncedSearchTerm, statusFilter]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      // Use Common Data API with param=Roles to get roles for target_audience
      // param=Roles excludes Admin, Tutor, and School - returns Student and Parent
      const response = await api.get('common/data?param=Roles');
      
      // Handle response
      const rolesData = response.data?.data || [];
      
      if (Array.isArray(rolesData) && rolesData.length > 0) {
        // Filter and sort active roles (Admin and Tutor already excluded by param=Roles)
        const activeRoles = rolesData
          .filter(role => role && role.id && role.name) // Ensure valid roles
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
        
        setRoles(activeRoles);
      } else {
        // Check if it's an error response
        if (response.data?.error) {
          const errorMsg = response.data.error || 'Failed to load roles';
          toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } else if (response.data?.success === false) {
          const errorMsg = response.data?.message || response.data?.error || 'Failed to load roles';
          toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } else {
          toast.warning('No roles found. Please ensure roles are seeded in the database.');
        }
        setRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      
      // Check if it's a migration error
      if (error.response?.data?.error?.includes('migration') || 
          error.response?.data?.message?.includes('migration') ||
          error.response?.data?.error?.includes('table not found')) {
        toast.error('Roles table not found. Please run: php artisan migrate');
      } else {
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to load roles. Please check your connection and try again.';
        toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
      }
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchModuleModes = async () => {
    setLoadingModuleModes(true);
    try {
      const response = await api.get('common/data', { params: { param: 'ModuleModes' } });
      if (response.data && response.data.success) {
        setModuleModes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching module modes:', error);
      setModuleModes([]);
    } finally {
      setLoadingModuleModes(false);
    }
  };

  const fetchAcademicYears = async () => {
    setLoadingAcademicYears(true);
    try {
      const response = await api.get('admin/announcements/academic-years');
      if (response.data && response.data.success) {
        setAcademicYears(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setAcademicYears([]);
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const fetchCourses = async (moduleId, academicYearId) => {
    if (!moduleId) {
      setCourses([]);
      return;
    }
    
    setLoadingCourses(true);
    try {
      const params = { module_id: moduleId };
      if (academicYearId) {
        params.academic_year_id = academicYearId;
      }
      const response = await api.get('admin/announcements/filtered-items', { params });
      if (response.data && response.data.success) {
        setCourses(response.data.data || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await api.get('admin/announcements/students');
      if (response.data && response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      const response = await api.get('admin/announcements/parents');
      if (response.data && response.data.success) {
        setParents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      setParents([]);
    } finally {
      setLoadingParents(false);
    }
  };

  const fetchClasses = async (courseId, academicYearId) => {
    if (!courseId || !academicYearId) {
      setClasses([]);
      return;
    }
    
    setLoadingClasses(true);
    try {
      const response = await api.get('common/data', { 
        params: { 
          param: 'Classes',
          course_id: courseId,
          academic_year_id: academicYearId
        } 
      });
      if (response.data && response.data.success) {
        setClasses(response.data.data || []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await api.get('admin/announcements', { params });
      
      if (response.data && response.data.success) {
        const paginatedData = response.data.data;
        
        // Handle paginated response structure
        if (paginatedData && paginatedData.data) {
          setAnnouncements(paginatedData.data || []);
          setTotalRecords(paginatedData.total || 0);
        } else if (Array.isArray(paginatedData)) {
          // Fallback: if data is directly an array
          setAnnouncements(paginatedData);
          setTotalRecords(paginatedData.length);
        } else {
          setAnnouncements([]);
          setTotalRecords(0);
        }
      } else {
        const errorMsg = response.data?.message || 'Failed to load announcements';
        toast.error(errorMsg);
        setAnnouncements([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to load announcements. Please ensure the database migration has been run.';
      toast.error(errorMessage);
      
      // Set empty state on error
      setAnnouncements([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setIsEditing(true);
      // Filter out Admin and Tutor roles from target_audience
      const filteredRoles = announcement.roles?.filter(role => {
        const roleName = role.name?.toLowerCase();
        return roleName !== 'admin' && roleName !== 'tutor';
      }) || [];
      
      reset({
        title: announcement.title,
        message: announcement.message,
        status: announcement.status !== undefined ? announcement.status : 0,
        target_audience: filteredRoles.map(r => r.id),
        specific_users: announcement.specific_users?.map(u => u.id) || [],
        module_id: announcement.module_id || null,
        academic_year_id: announcement.academic_year_id || null,
        course_id: announcement.course_id || null,
        class_id: announcement.class_id || null,
      });
      
      // Fetch courses and classes if mode and course are set
      if (announcement.module_id) {
        fetchCourses(announcement.module_id, announcement.academic_year_id);
      }
      if (announcement.course_id && announcement.academic_year_id) {
        fetchClasses(announcement.course_id, announcement.academic_year_id);
      }
    } else {
      setSelectedAnnouncement(null);
      setIsEditing(false);
      reset({
        title: '',
        message: '',
        status: 0, // 0 = draft, 1 = publish
        target_audience: [],
        specific_users: [],
        module_id: null,
        academic_year_id: null,
        course_id: null,
        class_id: null,
      });
      setCourses([]);
      setClasses([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
    setIsEditing(false);
    reset();
    setCourses([]);
    setClasses([]);
  };

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        status: data.status ?? 0, // Default to draft if not set
      };
      
      if (isEditing) {
        const response = await api.put(`admin/announcements/${selectedAnnouncement.id}`, submitData);
        if (response.data.success) {
          toast.success(submitData.status === 0 ? 'Announcement saved as draft' : 'Announcement published successfully');
          fetchAnnouncements();
          handleCloseDialog();
        }
      } else {
        const response = await api.post('admin/announcements', submitData);
        if (response.data.success) {
          toast.success(submitData.status === 0 ? 'Announcement saved as draft' : 'Announcement published successfully');
          fetchAnnouncements();
          handleCloseDialog();
        }
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          toast.error(error.response.data.errors[field][0]);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to save announcement');
      }
    }
  };

  const handleDeleteClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`admin/announcements/${selectedAnnouncement.id}`);
      if (response.data.success) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
        setDeleteDialogOpen(false);
        setSelectedAnnouncement(null);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    return status === 1 ? 'success' : 'default';
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Published' : 'Draft';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
          <NotificationsIcon sx={{ fontSize: '24px', color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Announcements
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
          <Typography variant="body1" sx={{ color: '#5a6c7d' }}>
            Manage announcements for different user roles
          </Typography>
          {!loading && (
            <Chip 
              label={`Total: ${totalRecords}`} 
              size="small" 
              sx={{ bgcolor: '#667eea', color: 'white' }}
            />
          )}
        </Box>
      </Box>

      {/* Filters and Add Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Draft</MenuItem>
              <MenuItem value="1">Published</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Announcement
        </Button>
      </Box>

      {/* Announcements Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Target Audience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Specific Users</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={150} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={150} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No announcements found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add Announcement" to create your first announcement
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id} hover>
                    <TableCell>{announcement.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 300, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {announcement.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {announcement.roles && announcement.roles.length > 0 ? (
                          announcement.roles.map((role) => (
                            <Chip key={role.id} label={role.name} size="small" color="primary" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            None
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {announcement.specific_users && announcement.specific_users.length > 0 ? (
                          announcement.specific_users.map((user) => (
                            <Chip 
                              key={user.id} 
                              label={user.name || user.email} 
                              size="small" 
                              color="secondary"
                              title={user.email}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            None
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(announcement.status)} 
                        color={getStatusColor(announcement.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(announcement)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(announcement)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && announcements.length > 0 && (
          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isEditing ? 'Edit Announcement' : 'Add Announcement'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isEditing ? 'Update announcement details' : 'Create a new announcement'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    error={!!errors.message}
                    helperText={errors.message?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="module_id"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth error={!!errors.module_id} disabled={loadingModuleModes}>
                      <InputLabel>Choose Mode</InputLabel>
                      <Select 
                        {...field} 
                        label="Choose Mode"
                        disabled={loadingModuleModes}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset dependent fields when mode changes
                          setValue('academic_year_id', null);
                          setValue('course_id', null);
                          setValue('class_id', null);
                          setCourses([]);
                          setClasses([]);
                          // Fetch courses if mode is selected
                          if (e.target.value) {
                            fetchCourses(e.target.value, null);
                          }
                        }}
                      >
                      <MenuItem value="">None</MenuItem>
                      {moduleModes.map((mode) => (
                        <MenuItem key={mode.id} value={mode.id}>
                          {mode.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.module_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.module_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="academic_year_id"
                control={control}
                render={({ field }) => {
                  const moduleId = watch('module_id');
                  const selectedMode = moduleModes.find(m => m.id === moduleId);
                  const isCoursesMode = selectedMode?.name?.toLowerCase() === 'courses';
                  return (
                    <FormControl fullWidth error={!!errors.academic_year_id} disabled={loadingAcademicYears || !moduleId || !isCoursesMode}>
                      <InputLabel>Course Year</InputLabel>
                      <Select 
                        {...field} 
                        label="Course Year"
                        disabled={loadingAcademicYears || !moduleId || !isCoursesMode}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset course and class when academic year changes
                          setValue('course_id', null);
                          setValue('class_id', null);
                          setClasses([]);
                          // Fetch courses with new academic year
                          if (moduleId) {
                            fetchCourses(moduleId, e.target.value);
                          }
                          // If a course was already selected, fetch classes with new academic year
                          const courseId = watch('course_id');
                          if (courseId && e.target.value) {
                            fetchClasses(courseId, e.target.value);
                          }
                        }}
                      >
                      <MenuItem value="">Select Course Year</MenuItem>
                      {academicYears.map((year) => (
                        <MenuItem key={year.id} value={year.id}>
                          {year.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.academic_year_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.academic_year_id.message}
                      </Typography>
                    )}
                  </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="course_id"
                control={control}
                render={({ field }) => {
                  const moduleId = watch('module_id');
                  return (
                    <FormControl fullWidth error={!!errors.course_id} disabled={loadingCourses || !moduleId}>
                      <InputLabel>Course</InputLabel>
                      <Select 
                        {...field} 
                        label="Course"
                        disabled={loadingCourses || !moduleId}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset class when course changes
                          setValue('class_id', null);
                          // Fetch classes for selected course and academic year
                          const academicYearId = watch('academic_year_id');
                          if (e.target.value && academicYearId) {
                            fetchClasses(e.target.value, academicYearId);
                          } else {
                            setClasses([]);
                          }
                        }}
                      >
                      <MenuItem value="">Select Course</MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.course_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.course_id.message}
                      </Typography>
                    )}
                  </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="class_id"
                control={control}
                render={({ field }) => {
                  const courseId = watch('course_id');
                  const academicYearId = watch('academic_year_id');
                  const moduleId = watch('module_id');
                  const selectedMode = moduleModes.find(m => m.id === moduleId);
                  const isCoursesMode = selectedMode?.name?.toLowerCase() === 'courses';
                  const isDisabled = loadingClasses || !courseId || !academicYearId || !isCoursesMode;
                  return (
                    <FormControl fullWidth error={!!errors.class_id} disabled={isDisabled}>
                      <InputLabel>Class</InputLabel>
                      <Select 
                        {...field} 
                        label="Class"
                        disabled={isDisabled}
                      >
                      <MenuItem value="">Select Class</MenuItem>
                      {classes.map((classItem) => (
                        <MenuItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </MenuItem>
                      ))}
                    </Select>
                      {errors.class_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.class_id.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status" value={field.value ?? 0}>
                      <MenuItem value={0}>Draft</MenuItem>
                      <MenuItem value={1}>Publish</MenuItem>
                    </Select>
                    {errors.status && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.status.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="target_audience"
                control={control}
                render={({ field }) => {
                  const ALL_OPTION_VALUE = '__ALL__';
                  const allRoleIds = roles.map(r => r.id);
                  const currentValue = Array.isArray(field.value) ? field.value : [];
                  const isAllSelected = roles.length > 0 && currentValue.length === roles.length && 
                                       currentValue.every(id => allRoleIds.includes(id));
                  
                  const handleChange = (event) => {
                    const selectedValues = event.target.value;
                    const previousValues = currentValue;
                    const hadAllBefore = isAllSelected;
                    
                    // Check if "All" option is in the new selection
                    const hasAllNow = selectedValues.includes(ALL_OPTION_VALUE);
                    
                    // Check if "All" was just clicked (toggled)
                    if (hasAllNow && !hadAllBefore) {
                      // "All" was just selected - select all roles
                      field.onChange(allRoleIds);
                    } else if (!hasAllNow && hadAllBefore) {
                      // "All" was just unselected - deselect all roles
                      field.onChange([]);
                    } else if (hasAllNow && hadAllBefore) {
                      // "All" is still selected but user might have unselected a role
                      // Check if all roles are still selected
                      const roleValues = selectedValues.filter(v => v !== ALL_OPTION_VALUE);
                      if (roleValues.length === roles.length) {
                        // All roles still selected, keep "All" selected
                        field.onChange(allRoleIds);
                      } else {
                        // Some roles were unselected, remove "All" and update with remaining roles
                        field.onChange(roleValues);
                      }
                    } else {
                      // Regular role selection/deselection - filter out "All" and update
                      const roleValues = selectedValues.filter(v => v !== ALL_OPTION_VALUE);
                      
                      // If all roles are now selected, automatically select "All" too
                      if (roleValues.length === roles.length && roles.length > 0) {
                        field.onChange(allRoleIds);
                      } else {
                        field.onChange(roleValues);
                      }
                    }
                  };

                  return (
                    <FormControl fullWidth error={!!errors.target_audience} disabled={rolesLoading}>
                      <InputLabel>Target Audience</InputLabel>
                      <Select
                        multiple
                        value={isAllSelected ? [ALL_OPTION_VALUE, ...currentValue] : currentValue}
                        onChange={handleChange}
                        disabled={rolesLoading}
                        input={<OutlinedInput label="Target Audience" />}
                        renderValue={(selected) => {
                          if (rolesLoading) {
                            return <Typography variant="body2" color="text.secondary">Loading roles...</Typography>;
                          }
                          // Filter out the "All" option value
                          const roleValues = selected.filter(v => v !== ALL_OPTION_VALUE);
                          if (roleValues.length === 0) {
                            return <Typography variant="body2" color="text.secondary">Select roles</Typography>;
                          }
                          if (roleValues.length === roles.length && roles.length > 0) {
                            return <Chip label="All Roles" size="small" color="primary" />;
                          }
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {roleValues.map((value) => {
                                const role = roles.find(r => r.id === value);
                                return <Chip key={value} label={role?.name || value} size="small" />;
                              })}
                            </Box>
                          );
                        }}
                      >
                        {(() => {
                          if (rolesLoading) {
                            return (
                              <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">Loading roles...</Typography>
                              </MenuItem>
                            );
                          }
                          if (roles.length === 0) {
                            return (
                              <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">No roles available</Typography>
                              </MenuItem>
                            );
                          }
                          return [
                            <MenuItem 
                              key="all"
                              value={ALL_OPTION_VALUE}
                              sx={{ fontWeight: 'bold' }}
                            >
                              <Checkbox checked={isAllSelected} />
                              <ListItemText primary="All" />
                            </MenuItem>,
                            ...roles.map((role) => (
                              <MenuItem key={role.id} value={role.id}>
                                <Checkbox checked={currentValue.indexOf(role.id) > -1} />
                                <ListItemText primary={role.name} />
                              </MenuItem>
                            ))
                          ];
                        })()}
                      </Select>
                      {errors.target_audience ? (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.target_audience.message}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                          {rolesLoading 
                            ? 'Loading roles from database...' 
                            : roles.length > 0 
                              ? `Select roles to target all users with those roles. You can also select specific users below.`
                              : 'No roles available. Please ensure roles are seeded in the database.'}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="specific_users"
                control={control}
                render={({ field }) => {
                  const allUsers = [...students, ...parents];
                  const currentValue = Array.isArray(field.value) ? field.value : [];
                  
                  return (
                    <FormControl fullWidth error={!!errors.specific_users} disabled={loadingStudents || loadingParents}>
                      <InputLabel>Specific Users (Students & Parents)</InputLabel>
                      <Select
                        multiple
                        value={currentValue}
                        onChange={field.onChange}
                        disabled={loadingStudents || loadingParents}
                        input={<OutlinedInput label="Specific Users (Students & Parents)" />}
                        renderValue={(selected) => {
                          if (loadingStudents || loadingParents) {
                            return <Typography variant="body2" color="text.secondary">Loading users...</Typography>;
                          }
                          if (selected.length === 0) {
                            return <Typography variant="body2" color="text.secondary">Select specific users (optional)</Typography>;
                          }
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((userId) => {
                                const user = allUsers.find(u => u.id === userId);
                                return <Chip key={userId} label={user?.name || userId} size="small" />;
                              })}
                            </Box>
                          );
                        }}
                      >
                        {(() => {
                          if (loadingStudents || loadingParents) {
                            return (
                              <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">Loading users...</Typography>
                              </MenuItem>
                            );
                          }
                          if (allUsers.length === 0) {
                            return (
                              <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">No users available</Typography>
                              </MenuItem>
                            );
                          }
                          return [
                            students.length > 0 && (
                              <MenuItem key="students-header" disabled sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                                <ListItemText primary="Students" />
                              </MenuItem>
                            ),
                            ...students.map((student) => (
                              <MenuItem key={`student-${student.id}`} value={student.id}>
                                <Checkbox checked={currentValue.indexOf(student.id) > -1} />
                                <ListItemText primary={student.name} secondary={student.email} />
                              </MenuItem>
                            )),
                            parents.length > 0 && (
                              <MenuItem key="parents-header" disabled sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                                <ListItemText primary="Parents" />
                              </MenuItem>
                            ),
                            ...parents.map((parent) => (
                              <MenuItem key={`parent-${parent.id}`} value={parent.id}>
                                <Checkbox checked={currentValue.indexOf(parent.id) > -1} />
                                <ListItemText primary={parent.name} secondary={parent.email} />
                              </MenuItem>
                            ))
                          ].filter(Boolean);
                        })()}
                      </Select>
                      {errors.specific_users ? (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.specific_users.message}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                          {loadingStudents || loadingParents 
                            ? 'Loading users from database...' 
                            : allUsers.length > 0 
                              ? `Select specific students and/or parents to target. You can use this instead of or in addition to role-based targeting.`
                              : 'No users available. Please ensure students and parents are registered in the system.'}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            variant="contained"
            color="primary"
            size="small"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAnnouncement?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;

