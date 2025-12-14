import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Skeleton,
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
  const [billingInfo, setBillingInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setError
  } = useForm({
    resolver: yupResolver(billingSchema),
    defaultValues: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchBillingInformation();
  }, []);

  const fetchBillingInformation = async () => {
    setLoading(true);
    try {
      const response = await api.get('parent/billing-information');
      if (response.data.success) {
        setBillingInfo(response.data.data || []);
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
        phone: billing.phone || ''
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
        phone: ''
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
    setSubmitting(true);
    try {
      if (isEditing) {
        // Update existing billing information
        const payload = {
          id: selectedBilling.id,
          parent_id: selectedBilling.parent_id,
          ...data
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
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          setError(field, {
            type: 'manual',
            message: errors[field][0]
          });
        });
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while saving billing information');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (billing) => {
    setSelectedBilling(billing);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBilling) return;

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
      toast.error(error.response?.data?.message || 'An error occurred while deleting billing information');
    }
  };

  const formatAddress = (billing) => {
    const parts = [];
    if (billing.address_line1) parts.push(billing.address_line1);
    if (billing.address_line2) parts.push(billing.address_line2);
    if (billing.city) parts.push(billing.city);
    if (billing.state) parts.push(billing.state);
    if (billing.postal_code) parts.push(billing.postal_code);
    if (billing.country) parts.push(billing.country);
    return parts.join(', ') || 'N/A';
  };

  return (
    <Box sx={{ p: 3 }}>
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Billing Address
        </Button>
      </Box>

      {loading ? (
        <Card>
          <CardContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : billingInfo.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LocationIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No billing information found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add a billing address to request paper delivery to your home
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Billing Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billingInfo.map((billing) => (
                  <TableRow key={billing.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          {formatAddress(billing)}
                        </Typography>
                        {billing.address_line1 && (
                          <Typography variant="caption" color="text.secondary">
                            {billing.address_line1}
                            {billing.address_line2 && `, ${billing.address_line2}`}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {billing.phone || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(billing.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

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
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            At least one address field (address, city, state, postal code, or country) must be provided.
          </Alert>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                      variant="outlined"
                      error={!!errors.address_line1}
                      helperText={errors.address_line1?.message}
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
                      variant="outlined"
                      error={!!errors.address_line2}
                      helperText={errors.address_line2?.message}
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
                      variant="outlined"
                      error={!!errors.city}
                      helperText={errors.city?.message}
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
                      label="State"
                      variant="outlined"
                      error={!!errors.state}
                      helperText={errors.state?.message}
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
                      variant="outlined"
                      error={!!errors.postal_code}
                      helperText={errors.postal_code?.message}
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
                      variant="outlined"
                      error={!!errors.country}
                      helperText={errors.country?.message}
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
                      variant="outlined"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              {errors.root && (
                <Grid item xs={12}>
                  <Alert severity="error">{errors.root.message}</Alert>
                </Grid>
              )}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
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

