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
  status: yup.string().required('Status is required').oneOf(['active', 'inactive']),
  target_audience: yup.array().min(1, 'At least one target audience is required').required('Target audience is required'),
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(announcementSchema),
    defaultValues: {
      title: '',
      message: '',
      status: 'active',
      target_audience: [],
    },
  });

  // Debounce search term to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch roles only once on component mount
  useEffect(() => {
    fetchRoles();
  }, []); // Empty dependency array - only run once

  // Fetch announcements when filters change
  useEffect(() => {
    fetchAnnouncements();
  }, [page, rowsPerPage, debouncedSearchTerm, statusFilter]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      // Use Common Data API to get ALL roles from roles table
      // Using 'RolesAll' to get all roles including ADMIN, TUTOR, SCHOOL, STUDENT, PARENT
      const response = await api.get('common/data?param=RolesAll');
      
      // Handle response - match the pattern used in Login.jsx and useCommonDropdowns
      const rolesData = response.data?.data || [];
      
      if (Array.isArray(rolesData) && rolesData.length > 0) {
        // Filter and sort active roles
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
      reset({
        title: announcement.title,
        message: announcement.message,
        status: announcement.status,
        target_audience: announcement.roles?.map(r => r.id) || [],
      });
    } else {
      setSelectedAnnouncement(null);
      setIsEditing(false);
      reset({
        title: '',
        message: '',
        status: 'active',
        target_audience: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        const response = await api.put(`admin/announcements/${selectedAnnouncement.id}`, data);
        if (response.data.success) {
          toast.success('Announcement updated successfully');
          fetchAnnouncements();
          handleCloseDialog();
        }
      } else {
        const response = await api.post('admin/announcements', data);
        if (response.data.success) {
          toast.success('Announcement created successfully');
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
    return status === 'active' ? 'success' : 'default';
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                        {announcement.roles?.map((role) => (
                          <Chip key={role.id} label={role.name} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={announcement.status} 
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
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
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
                              ? `Select one or more roles from ${roles.length} available roles, or select "All" to select all roles`
                              : 'No roles available. Please ensure roles are seeded in the database.'}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {isEditing ? 'Update' : 'Create'}
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

