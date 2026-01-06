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
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as AwardIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../api';
import { toast } from 'react-toastify';

const awardSchema = yup.object().shape({
  name: yup.string().required('Award name is required').max(255, 'Name cannot exceed 255 characters'),
  description: yup.string().nullable(),
  type: yup.string().nullable(),
  criteria: yup.string().nullable(),
  certificate_template: yup.string().nullable(),
  status: yup.number().oneOf([0, 1]), // 0 = inactive, 1 = active
});

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(awardSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'achievement',
      criteria: '',
      certificate_template: '',
      status: 1,
    },
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch awards when filters change
  useEffect(() => {
    fetchAwards();
  }, [page, rowsPerPage, debouncedSearchTerm, statusFilter, typeFilter]);

  const fetchAwards = async () => {
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

      if (typeFilter) {
        params.type = typeFilter;
      }
      
      const response = await api.get('admin/awards', { params });
      
      if (response.data && response.data.success) {
        const paginatedData = response.data.data;
        
        if (paginatedData && paginatedData.data) {
          setAwards(paginatedData.data || []);
          setTotalRecords(paginatedData.total || 0);
        } else if (Array.isArray(paginatedData)) {
          setAwards(paginatedData);
          setTotalRecords(paginatedData.length);
        } else {
          setAwards([]);
          setTotalRecords(0);
        }
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
      toast.error(error.response?.data?.message || 'Failed to load awards');
      setAwards([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (award = null) => {
    if (award) {
      setSelectedAward(award);
      setIsEditing(true);
      reset({
        name: award.name,
        description: award.description || '',
        type: award.type || 'achievement',
        criteria: award.criteria || '',
        certificate_template: award.certificate_template || '',
        status: award.status !== undefined ? award.status : 1,
      });
    } else {
      setSelectedAward(null);
      setIsEditing(false);
      reset({
        name: '',
        description: '',
        type: 'achievement',
        criteria: '',
        certificate_template: '',
        status: 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAward(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        const response = await api.put(`admin/awards/${selectedAward.id}`, data);
        if (response.data.success) {
          toast.success('Award updated successfully');
          fetchAwards();
          handleCloseDialog();
        }
      } else {
        const response = await api.post('admin/awards', data);
        if (response.data.success) {
          toast.success('Award created successfully');
          fetchAwards();
          handleCloseDialog();
        }
      }
    } catch (error) {
      console.error('Error saving award:', error);
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          toast.error(error.response.data.errors[field][0]);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to save award');
      }
    }
  };

  const handleDeleteClick = (award) => {
    setSelectedAward(award);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`admin/awards/${selectedAward.id}`);
      if (response.data.success) {
        toast.success('Award deleted successfully');
        fetchAwards();
        setDeleteDialogOpen(false);
        setSelectedAward(null);
      }
    } catch (error) {
      console.error('Error deleting award:', error);
      toast.error(error.response?.data?.message || 'Failed to delete award');
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
    return status === 1 ? 'Active' : 'Inactive';
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
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '25px',
          px: 3,
          py: 1,
          boxShadow: '0 4px 15px rgba(240, 147, 251, 0.2)'
        }}>
          <AwardIcon sx={{ fontSize: '24px', color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Awards Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
          <Typography variant="body1" sx={{ color: '#5a6c7d' }}>
            Manage awards and certificates for students
          </Typography>
          {!loading && (
            <Chip 
              label={`Total: ${totalRecords}`} 
              size="small" 
              sx={{ bgcolor: '#f093fb', color: 'white' }}
            />
          )}
        </Box>
      </Box>

      {/* Filters and Add Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search awards..."
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
              <MenuItem value="0">Inactive</MenuItem>
              <MenuItem value="1">Active</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              label="Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="achievement">Achievement</MenuItem>
              <MenuItem value="completion">Completion</MenuItem>
              <MenuItem value="excellence">Excellence</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Award
        </Button>
      </Box>

      {/* Awards Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Certificates Issued</TableCell>
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
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : awards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <AwardIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No awards found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add Award" to create your first award
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                awards.map((award) => (
                  <TableRow key={award.id} hover>
                    <TableCell>{award.name}</TableCell>
                    <TableCell>
                      <Chip label={award.type || 'achievement'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 300, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {award.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>{award.certificates_count || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(award.status)} 
                        color={getStatusColor(award.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(award.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(award)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(award)}
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
        {!loading && awards.length > 0 && (
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AwardIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isEditing ? 'Edit Award' : 'Add Award'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isEditing ? 'Update award details' : 'Create a new award'}
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
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Award Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      <MenuItem value="achievement">Achievement</MenuItem>
                      <MenuItem value="completion">Completion</MenuItem>
                      <MenuItem value="excellence">Excellence</MenuItem>
                    </Select>
                    {errors.type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.type.message}
                      </Typography>
                    )}
                  </FormControl>
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
                    <Select {...field} label="Status" value={field.value ?? 1}>
                      <MenuItem value={0}>Inactive</MenuItem>
                      <MenuItem value={1}>Active</MenuItem>
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

            <Grid item xs={12}>
              <Controller
                name="criteria"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Criteria"
                    multiline
                    rows={3}
                    placeholder="Enter the criteria for earning this award..."
                    error={!!errors.criteria}
                    helperText={errors.criteria?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="certificate_template"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Certificate Template"
                    placeholder="Template name or path (optional)"
                    error={!!errors.certificate_template}
                    helperText={errors.certificate_template?.message}
                  />
                )}
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
        <DialogTitle>Delete Award</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAward?.name}"? This action cannot be undone.
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

export default Awards;

