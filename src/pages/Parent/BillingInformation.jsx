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
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../api';
import { toast } from 'react-toastify';

// Validation schema
const billingSchema = yup.object().shape({
  address_line1: yup.string().max(255, 'Address line 1 cannot exceed 255 characters'),
  address_line2: yup.string().max(255, 'Address line 2 cannot exceed 255 characters'),
  city: yup.string().max(100, 'City cannot exceed 100 characters'),
  state: yup.string().max(100, 'State cannot exceed 100 characters'),
  postal_code: yup.string().max(20, 'Postal code cannot exceed 20 characters'),
  country: yup.string().max(100, 'Country cannot exceed 100 characters'),
  phone: yup.string().max(20, 'Phone cannot exceed 20 characters'),
}).test('at-least-one-address', 'At least one address field is required', function(value) {
  const { address_line1, address_line2, city, state, postal_code, country } = value;
  return !!(address_line1 || address_line2 || city || state || postal_code || country);
});

const BillingInformation = () => {
  const [billingInfoList, setBillingInfoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(billingSchema),
    defaultValues: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
    },
  });

  useEffect(() => {
    fetchBillingInformation();
  }, []);

  const fetchBillingInformation = async () => {
    setLoading(true);
    try {
      const response = await api.get('parent/billing-information');
      if (response.data.success) {
        setBillingInfoList(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch billing information');
      }
    } catch (error) {
      console.error('Error fetching billing information:', error);
      toast.error(error.response?.data?.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (billing = null) => {
    if (billing) {
      setSelectedBilling(billing);
      setIsEditing(true);
      reset({
        address_line1: billing.address_line1 || '',
        address_line2: billing.address_line2 || '',
        city: billing.city || '',
        state: billing.state || '',
        postal_code: billing.postal_code || '',
        country: billing.country || '',
        phone: billing.phone || '',
      });
    } else {
      setSelectedBilling(null);
      setIsEditing(false);
      reset({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBilling(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        // Update existing billing information
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const payload = {
          id: selectedBilling.id,
          parent_id: userData.id || userData.parent_id,
          ...data,
        };

        const response = await api.put('parent/billing-information', payload);
        if (response.data.success) {
          toast.success('Billing information updated successfully');
          fetchBillingInformation();
          handleCloseDialog();
        } else {
          toast.error(response.data.message || 'Failed to update billing information');
        }
      } else {
        // Create new billing information
        const response = await api.post('parent/billing-information', data);
        if (response.data.success) {
          toast.success('Billing information created successfully');
          fetchBillingInformation();
          handleCloseDialog();
        } else {
          toast.error(response.data.message || 'Failed to create billing information');
        }
      }
    } catch (error) {
      console.error('Error saving billing information:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors
        Object.keys(error.response.data.errors).forEach((field) => {
          setError(field, {
            type: 'manual',
            message: error.response.data.errors[field][0],
          });
        });
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while saving billing information');
      }
    }
  };

  const handleDeleteClick = (billing) => {
    setSelectedBilling(billing);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`parent/billing-information/${selectedBilling.id}`);
      if (response.data.success) {
        toast.success('Billing information deleted successfully');
        fetchBillingInformation();
        setDeleteDialogOpen(false);
        setSelectedBilling(null);
      } else {
        toast.error(response.data.message || 'Failed to delete billing information');
      }
    } catch (error) {
      console.error('Error deleting billing information:', error);
      toast.error(error.response?.data?.message || 'Failed to delete billing information');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = billingInfoList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          <HomeIcon sx={{ fontSize: '24px', color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Billing Information
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          Manage your billing addresses for paper delivery
        </Typography>
      </Box>

      {/* Add Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Billing Information
        </Button>
      </Box>

      {/* Billing Information Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Postal Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : billingInfoList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <LocationIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No billing information found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add Billing Information" to create your first address
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((billing) => (
                  <TableRow key={billing.id} hover>
                    <TableCell>
                      <Box>
                        {billing.address_line1 && (
                          <Typography variant="body2">{billing.address_line1}</Typography>
                        )}
                        {billing.address_line2 && (
                          <Typography variant="body2" color="text.secondary">
                            {billing.address_line2}
                          </Typography>
                        )}
                        {!billing.address_line1 && !billing.address_line2 && (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{billing.city || 'N/A'}</TableCell>
                    <TableCell>{billing.state || 'N/A'}</TableCell>
                    <TableCell>{billing.postal_code || 'N/A'}</TableCell>
                    <TableCell>{billing.country || 'N/A'}</TableCell>
                    <TableCell>{billing.phone || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(billing)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(billing)}
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
        {!loading && billingInfoList.length > 0 && (
          <TablePagination
            component="div"
            count={billingInfoList.length}
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
      >
        <DialogTitle>
          {isEditing ? 'Edit Billing Information' : 'Add Billing Information'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              At least one address field (Address Line 1, Address Line 2, City, State, Postal Code, or Country) is required.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="address_line1"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address Line 1"
                      error={!!errors.address_line1}
                      helperText={errors.address_line1?.message}
                      placeholder="123 Main Street"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address_line2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address Line 2"
                      error={!!errors.address_line2}
                      helperText={errors.address_line2?.message}
                      placeholder="Apt 4B, Suite 5C"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      placeholder="London"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State/Province"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      placeholder="Greater London"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="postal_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Postal Code"
                      error={!!errors.postal_code}
                      helperText={errors.postal_code?.message}
                      placeholder="SW1A 1AA"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Country"
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      placeholder="United Kingdom"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      placeholder="+44 20 1234 5678"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Billing Information</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this billing information? This action cannot be undone.
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

export default BillingInformation;

