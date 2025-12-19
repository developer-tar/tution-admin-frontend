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
  Divider,
  alpha,
  Fade,
  Zoom,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
  Map as MapIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Public as PublicIcon,
  PinDrop as PinDropIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../api';
import { toast } from 'react-toastify';

// Validation schema matching backend StoreBillingInformationRequest
const billingSchema = yup.object().shape({
  address_line1: yup
    .string()
    .nullable()
    .max(255, 'Address line 1 cannot exceed 255 characters'),
  address_line2: yup
    .string()
    .nullable()
    .max(255, 'Address line 2 cannot exceed 255 characters'),
  city: yup
    .string()
    .nullable()
    .max(100, 'City cannot exceed 100 characters'),
  state: yup
    .string()
    .nullable()
    .max(100, 'State cannot exceed 100 characters'),
  postal_code: yup
    .string()
    .nullable()
    .max(20, 'Postal code cannot exceed 20 characters'),
  country: yup
    .string()
    .nullable()
    .max(100, 'Country cannot exceed 100 characters'),
  phone: yup
    .string()
    .nullable()
    .max(20, 'Phone cannot exceed 20 characters'),
}).test('at-least-one-address', 'At least one address field (Address Line 1, Address Line 2, City, State, Postal Code, or Country) is required', function(value) {
  const { address_line1, address_line2, city, state, postal_code, country } = value;
  // Check if at least one address field has a value
  const hasAddress = !!(address_line1?.trim() || 
                       address_line2?.trim() || 
                       city?.trim() || 
                       state?.trim() || 
                       postal_code?.trim() || 
                       country?.trim());
  return hasAddress;
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
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: yupResolver(billingSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
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
      // Reset country and state IDs as we're using simple text fields now
      setSelectedCountryId(null);
      setSelectedStateId(null);
      
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
      setSelectedCountryId(null);
      setSelectedStateId(null);
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
    setSelectedCountryId(null);
    setSelectedStateId(null);
    reset();
  };

  const onSubmit = async (data) => {
    // Check if at least one address field is filled
    const hasAddress = !!(data.address_line1?.trim() || 
                         data.address_line2?.trim() || 
                         data.city?.trim() || 
                         data.state?.trim() || 
                         data.postal_code?.trim() || 
                         data.country?.trim());
    
    if (!hasAddress) {
      const errorMessage = 'At least one address field (Address Line 1, Address Line 2, City, State, Postal Code, or Country) is required';
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      toast.error(errorMessage);
      // Scroll to top to show error
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"]');
        if (dialogContent) {
          dialogContent.scrollTop = 0;
        }
      }, 100);
      return;
    }

    // Clear root error if validation passes
    setError('root', { type: 'manual', message: '' });

    try {
      if (isEditing) {
        // Update existing billing information - matching UpdateBillingInformationRequest
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const payload = {
          id: selectedBilling.id,
          parent_id: userData.id || userData.parent_id,
          // Only include fields that have values (matching 'sometimes' rule)
          ...(data.address_line1 !== null && data.address_line1 !== undefined && data.address_line1 !== '' ? { address_line1: data.address_line1 } : {}),
          ...(data.address_line2 !== null && data.address_line2 !== undefined && data.address_line2 !== '' ? { address_line2: data.address_line2 } : {}),
          ...(data.city !== null && data.city !== undefined && data.city !== '' ? { city: data.city } : {}),
          ...(data.state !== null && data.state !== undefined && data.state !== '' ? { state: data.state } : {}),
          ...(data.postal_code !== null && data.postal_code !== undefined && data.postal_code !== '' ? { postal_code: data.postal_code } : {}),
          ...(data.country !== null && data.country !== undefined && data.country !== '' ? { country: data.country } : {}),
          ...(data.phone !== null && data.phone !== undefined && data.phone !== '' ? { phone: data.phone } : {}),
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
        // Create new billing information - matching StoreBillingInformationRequest
        // Send all fields as they are (nullable fields can be null/empty)
        const payload = {
          address_line1: data.address_line1 || null,
          address_line2: data.address_line2 || null,
          city: data.city || null,
          state: data.state || null,
          postal_code: data.postal_code || null,
          country: data.country || null,
          phone: data.phone || null,
        };

        const response = await api.post('parent/billing-information', payload);
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
        // Handle validation errors from backend
        Object.keys(error.response.data.errors).forEach((field) => {
          // Handle 'address' custom error field
          if (field === 'address') {
            toast.error(error.response.data.errors[field][0]);
          } else {
            setError(field, {
              type: 'manual',
              message: error.response.data.errors[field][0],
            });
          }
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
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: alpha('#fff', 0.1),
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: alpha('#fff', 0.1),
            }}
          />
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  background: alpha('#fff', 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  flexShrink: 0,
                }}
              >
                <HomeIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {isEditing ? 'Edit Billing Information' : 'Add Billing Information'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {isEditing ? 'Update your delivery address details' : 'Enter your delivery address details'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                color: 'white',
                background: alpha('#fff', 0.2),
                flexShrink: 0,
                '&:hover': {
                  background: alpha('#fff', 0.3),
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          <Box sx={{ p: 3 }}>
            <Zoom in={true} timeout={400}>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: alpha('#667eea', 0.1),
                  border: `1px solid ${alpha('#667eea', 0.3)}`,
                  '& .MuiAlert-icon': {
                    color: '#667eea !important',
                  },
                  '& .MuiAlert-message': {
                    color: '#764ba2 !important',
                    fontWeight: 500,
                  }
                }}
                icon={<LocationIcon sx={{ color: '#667eea !important' }} />}
              >
                At least one address field (Address Line 1, Address Line 2, City, State, Postal Code, or Country) is required.
              </Alert>
            </Zoom>

            {/* Show validation error if validation fails */}
            {errors.root?.message && (
              <Zoom in={true} timeout={400}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: alpha('#f44336', 0.1),
                    border: `1px solid ${alpha('#f44336', 0.3)}`,
                    '& .MuiAlert-icon': {
                      color: '#f44336 !important',
                    },
                    '& .MuiAlert-message': {
                      color: '#d32f2f !important',
                      fontWeight: 600,
                    }
                  }}
                >
                  {errors.root.message}
                </Alert>
              </Zoom>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon sx={{ color: errors.address_line1 ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon sx={{ color: errors.address_line2 ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>

              {/* Country - First in the flow */}
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        placeholder="Enter country..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PublicIcon sx={{ color: errors.country ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>

              {/* State/Province - Second in the flow */}
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        placeholder="Enter state/province..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapIcon sx={{ color: errors.state ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>

              {/* City - Third in the flow */}
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        placeholder="Enter city..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationCityIcon sx={{ color: errors.city ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>

              {/* Postal Code */}
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PinDropIcon sx={{ color: errors.postal_code ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha('#667eea', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                    }
                  }}
                >
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon sx={{ color: errors.phone ? 'error.main' : '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions
          sx={{
            p: 3,
            bgcolor: '#f8f9fa',
            borderTop: `1px solid ${alpha('#000', 0.08)}`,
            gap: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha('#667eea', 0.5),
              color: '#667eea',
              '&:hover': {
                borderColor: '#667eea',
                background: alpha('#667eea', 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
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

