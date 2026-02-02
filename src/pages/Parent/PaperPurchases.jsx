import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  alpha,
  Tabs,
  Tab,
  Fade,
  IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  ReceiptLong as ReceiptIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  History as HistoryIcon,
  Update as UpdateIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Computer as ComputerIcon,
  Close as CloseIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PaperPurchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [billingInfoList, setBillingInfoList] = useState([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedPaperForRequest, setSelectedPaperForRequest] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [selectedBillingInfoId, setSelectedBillingInfoId] = useState(null);
  const [loadingBillingInfo, setLoadingBillingInfo] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [parentStudents, setParentStudents] = useState([]);
  const [assigningPurchaseId, setAssigningPurchaseId] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, [statusFilter, searchTerm]);

  // Student list for assign dropdown: from student_details (parent_id = logged parent), names from child_id -> users
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('parent/students/names');
        if (response.data.success && Array.isArray(response.data.data)) {
          setParentStudents(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching parent students for paper assign:', err);
      }
    };
    fetchStudents();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('parent/paper-purchases', { params });

      if (response.data.success) {
        const raw = response.data.data ?? response.data;
        const list = Array.isArray(raw) ? raw : (raw?.list ?? raw?.purchases ?? []);
        setPurchases(list);
      } else {
        setPurchases([]);
        toast.error(response.data.message || 'Failed to fetch paper purchases');
      }
    } catch (error) {
      console.error('Error fetching paper purchases:', error);
      setPurchases([]);
      if (error.response?.status === 401) {
        toast.error('Please log in as a parent to view your paper purchases.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load paper purchases');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter purchases based on search term (client-side filtering as backup)
  const filteredPurchases = purchases.filter((purchase) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      purchase.paper_name?.toLowerCase().includes(search) ||
      purchase.paper_description?.toLowerCase().includes(search) ||
      purchase.paper_category?.toLowerCase().includes(search) ||
      purchase.paper_format?.toLowerCase().includes(search) ||
      purchase.student_name?.toLowerCase().includes(search)
    );
  });

  const paginatedPurchases = filteredPurchases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Map payment status enum/numbers to readable strings
  const getPaymentStatusLabel = (status) => {
    const statusMap = {
      'paid': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed',
      'canceled': 'Canceled',
      'cancelled': 'Cancelled',
      'expired': 'Expired',
      'refunded': 'Refunded',
      'partially_refunded': 'Partially Refunded',
      // Numeric enum statuses
      1: 'Paid',
      2: 'Pending',
      3: 'Failed',
      4: 'Canceled',
      5: 'Expired',
      6: 'Refunded',
      7: 'Partially Refunded',
      '1': 'Paid',
      '2': 'Pending',
      '3': 'Failed',
      '4': 'Canceled',
      '5': 'Expired',
      '6': 'Refunded',
      '7': 'Partially Refunded'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const normalizedStatus = typeof status === 'number' ? status : status?.toLowerCase();
    
    const colors = {
      'paid': 'success',
      'pending': 'warning',
      'failed': 'error',
      'canceled': 'default',
      'cancelled': 'default',
      'expired': 'default',
      'refunded': 'info',
      'partially_refunded': 'info',
      // Numeric enum statuses
      1: 'success',
      2: 'warning',
      3: 'error',
      4: 'default',
      5: 'default',
      6: 'info',
      7: 'info',
      '1': 'success',
      '2': 'warning',
      '3': 'error',
      '4': 'default',
      '5': 'default',
      '6': 'info',
      '7': 'info'
    };
    return colors[normalizedStatus] || colors[status] || 'default';
  };

  const formatCurrency = (amount, currency) => {
    const symbols = {
      gbp: '£',
      eur: '€',
      usd: '$'
    };
    // Convert to number if it's a string, handle null/undefined
    const numAmount = amount ? (typeof amount === 'string' ? parseFloat(amount) : amount) : 0;
    const formattedAmount = isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
    return `${symbols[currency?.toLowerCase()] || currency?.toUpperCase() || ''}${formattedAmount}`;
  };

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setDialogOpen(true);
  };

  const handleAssignStudent = async (purchaseId, studentId) => {
    setAssigningPurchaseId(purchaseId);
    try {
      const response = await api.put(`parent/paper-purchases/${purchaseId}/assign-student`, {
        student_id: studentId ? parseInt(studentId, 10) : null,
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Assignment updated.');
        setPurchases((prev) =>
          prev.map((p) =>
            p.purchase_id === purchaseId
              ? {
                  ...p,
                  student_id: response.data.data.student_id ?? null,
                  student_name: response.data.data.student_name ?? null,
                  student_email: response.data.data.student_email ?? null,
                }
              : p
          )
        );
        if (selectedPurchase?.purchase_id === purchaseId) {
          setSelectedPurchase((prev) =>
            prev ? { ...prev, student_id: response.data.data.student_id ?? null, student_name: response.data.data.student_name ?? null, student_email: response.data.data.student_email ?? null } : prev
          );
        }
      } else {
        toast.error(response.data.message || 'Failed to update assignment.');
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      toast.error(error.response?.data?.message || 'Failed to update assignment.');
    } finally {
      setAssigningPurchaseId(null);
    }
  };

  const handleDownloadPdf = (pdf) => {
    window.open(pdf.url, '_blank');
  };


  const handleRequestPaperToHome = async (purchase) => {
    // Check if paper format allows physical delivery
    const format = purchase.paper_format?.toLowerCase();
    if (format && format !== 'physical' && format !== 'any') {
      toast.error('Only physical or any format papers can be requested for home delivery.');
      return;
    }

    // Check if payment status is paid
    if (purchase.payment_status !== 'paid' && purchase.payment_status !== 1 && purchase.payment_status !== '1') {
      toast.error('You do not have access to this paper. Please purchase it first.');
      return;
    }

    // Fetch billing information first
    setLoadingBillingInfo(true);
    try {
      const response = await api.get('parent/billing-information');
      if (response.data.success) {
        const billingData = response.data.data || [];
        
        // Check if billing information exists
        if (billingData.length === 0) {
          toast.info('Please add billing information first before requesting paper delivery.');
          const parentPrefix = process.env.REACT_APP_PARENT_PREFIX || 'parent';
          navigate(`/${parentPrefix}/billing-information`);
          return;
        }
        
        // If billing information exists, set it and open dialog
        setBillingInfoList(billingData);
        
        // Priority 1: Check billing_information_id from the purchase object (from API response)
        let defaultBillingId = null;
        if (purchase.billing_information_id) {
          const billingInfoId = purchase.billing_information_id;
          // Verify this billing ID exists in the fetched list
          const exists = billingData.some(b => b.id === billingInfoId);
          if (exists) {
            defaultBillingId = billingInfoId;
          }
        }
        
        // Priority 2: If not found, check activity logs for billing_information.id in new_values
        if (!defaultBillingId && purchase.request_home_activity_logs && purchase.request_home_activity_logs.length > 0) {
          // Get the most recent activity log
          const latestLog = purchase.request_home_activity_logs[purchase.request_home_activity_logs.length - 1];
          
          // First, check for billing_information.id in new_values.billing_information
          if (latestLog.new_values && 
              latestLog.new_values.billing_information && 
              latestLog.new_values.billing_information.id) {
            const billingInfoId = latestLog.new_values.billing_information.id;
            // Verify this billing ID exists in the fetched list
            const exists = billingData.some(b => b.id === billingInfoId);
            if (exists) {
              defaultBillingId = billingInfoId;
            }
          }
          
          // If not found, check for billing_information_id as fallback
          if (!defaultBillingId && 
              latestLog.new_values && 
              latestLog.new_values.billing_information_id) {
            const billingInfoId = latestLog.new_values.billing_information_id;
            // Verify this billing ID exists in the fetched list
            const exists = billingData.some(b => b.id === billingInfoId);
            if (exists) {
              defaultBillingId = billingInfoId;
            }
          }
        }
        
        // Priority 3: If no billing ID found, use first one as default
        if (!defaultBillingId && billingData.length > 0) {
          defaultBillingId = billingData[0].id;
        }
        
        setSelectedBillingInfoId(defaultBillingId);
        setSelectedPaperForRequest(purchase);
        setRequestDialogOpen(true);
      } else {
        toast.error('Failed to load billing information');
      }
    } catch (error) {
      console.error('Error fetching billing information:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoadingBillingInfo(false);
    }
  };

  const handleConfirmRequest = async () => {
    if (!selectedPaperForRequest || !selectedBillingInfoId) {
      toast.error('Please select a billing address');
      return;
    }

    setRequesting(true);
    try {
      const response = await api.post('parent/request-paper-to-home', {
        paper_id: selectedPaperForRequest.paper_id,
        billing_information_id: selectedBillingInfoId,
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Paper request submitted successfully. We are processing your request.');
        setRequestDialogOpen(false);
        setSelectedPaperForRequest(null);
        setSelectedBillingInfoId(null);
      } else {
        toast.error(response.data.message || 'Failed to submit paper request');
      }
    } catch (error) {
      console.error('Error requesting paper to home:', error);
      if (error.response?.data?.errors) {
        // Display validation errors
        Object.keys(error.response.data.errors).forEach((field) => {
          const errorMessage = error.response.data.errors[field][0];
          toast.error(errorMessage);
        });
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while submitting paper request');
      }
    } finally {
      setRequesting(false);
    }
  };

  const canRequestPaperToHome = (purchase) => {
    // Check payment status
    const isPaid = purchase.payment_status === 'paid' || purchase.payment_status === 1 || purchase.payment_status === '1';
    if (!isPaid) return false;

    // Check paper format - show for physical or any (not download)
    const format = purchase.paper_format?.toLowerCase();
    return format === 'physical' || format === 'any';
  };

  const canDownloadPaper = (purchase) => {
    // Check payment status
    const isPaid = purchase.payment_status === 'paid' || purchase.payment_status === 1 || purchase.payment_status === '1';
    if (!isPaid) return false;

    // Check paper format - show download only for download format
    const format = purchase.paper_format?.toLowerCase();
    return format === 'download' && purchase.paper_pdfs?.length > 0;
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
          <DescriptionIcon sx={{ fontSize: '24px', color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            My Paper Purchases
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          View your purchased papers and download PDFs
        </Typography>
      </Box>

      {/* Filters */}
      <Card 
        sx={{ 
          mb: 3, 
          p: 2.5,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          border: `1px solid ${alpha('#667eea', 0.2)}`,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            fullWidth
            sx={{ 
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  borderWidth: 2,
                },
              },
            }}
            placeholder="Search by paper name, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl 
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  borderWidth: 2,
                },
              },
            }}
          >
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
              <MenuItem value="partially_refunded">Partially Refunded</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Purchases Table */}
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)',
          border: `1px solid ${alpha('#667eea', 0.1)}`,
        }}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Paper Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Format</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Purchased At</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={20} />
                          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={60} height={20} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No paper purchases found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPurchases.map((purchase) => (
                  <TableRow key={purchase.purchase_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {purchase.paper_image && (
                          <Avatar
                            src={purchase.paper_image}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            <DescriptionIcon />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {purchase.paper_name}
                          </Typography>
                          {purchase.paper_description && (
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {purchase.paper_description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {purchase.paper_category ? (
                        <Chip label={purchase.paper_category} size="small" />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.paper_format ? (
                        <Chip label={purchase.paper_format} size="small" variant="outlined" />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(purchase.amount, purchase.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentStatusLabel(purchase.payment_status)}
                        color={getStatusColor(purchase.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <FormControl size="small" sx={{ minWidth: 160 }} disabled={assigningPurchaseId === purchase.purchase_id}>
                          <Select
                            value={purchase.student_id ?? ''}
                            onChange={(e) => handleAssignStudent(purchase.purchase_id, e.target.value)}
                            displayEmpty
                            sx={{
                              fontSize: '0.875rem',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                            }}
                          >
                            <MenuItem value="">
                              <em>Unassigned</em>
                            </MenuItem>
                            {parentStudents.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.full_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {assigningPurchaseId === purchase.purchase_id && (
                          <CircularProgress size={18} sx={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {purchase.purchased_at 
                        ? new Date(purchase.purchased_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewDetails(purchase)}
                        >
                          View
                        </Button>
                        {canDownloadPaper(purchase) && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadPdf(purchase.paper_pdfs[0])}
                          >
                            Download
                          </Button>
                        )}
                        {canRequestPaperToHome(purchase) && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            startIcon={<HomeIcon />}
                            onClick={() => handleRequestPaperToHome(purchase)}
                          >
                            Request Home
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && filteredPurchases.length > 0 && (
          <TablePagination
            component="div"
            count={filteredPurchases.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon />
            <Typography variant="h6">
              {selectedPurchase?.paper_name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPurchase && (
            <Box>
              <Tabs
                value={detailsTabValue}
                onChange={(e, newValue) => setDetailsTabValue(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 3,
                  pt: 2,
                }}
              >
                <Tab label="Details" />
                {selectedPurchase.request_home_activity_logs?.length > 0 && (
                  <Tab 
                    label={`Activity Logs (${selectedPurchase.request_home_activity_logs.length})`}
                  />
                )}
              </Tabs>
              
              {detailsTabValue === 0 && (
                <Box sx={{ p: 3 }}>
                  <List>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={selectedPurchase.paper_description || 'N/A'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Category"
                  secondary={selectedPurchase.paper_category || 'N/A'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Format"
                  secondary={selectedPurchase.paper_format || 'N/A'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Price"
                  secondary={formatCurrency(selectedPurchase.paper_price, selectedPurchase.paper_currency)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Amount Paid"
                  secondary={formatCurrency(selectedPurchase.amount, selectedPurchase.currency)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Payment Status"
                  secondary={
                    <Chip
                      label={getPaymentStatusLabel(selectedPurchase.payment_status)}
                      color={getStatusColor(selectedPurchase.payment_status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
              <Divider />
              {selectedPurchase.student_name && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Purchased For"
                      secondary={selectedPurchase.student_name}
                    />
                  </ListItem>
                  <Divider />
                </>
              )}
              {selectedPurchase.paper_pdfs?.length > 0 && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="PDFs"
                      secondary={`${selectedPurchase.paper_pdfs.length} file(s) available`}
                    />
                  </ListItem>
                  {selectedPurchase.paper_pdfs.map((pdf, index) => (
                    <ListItem key={pdf.id} sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <DownloadIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={pdf.original_name}
                        secondary={`${(pdf.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <Button
                        size="small"
                        onClick={() => handleDownloadPdf(pdf)}
                        startIcon={<DownloadIcon />}
                      >
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </>
              )}
                  </List>
                </Box>
              )}
              
              {detailsTabValue === 1 && selectedPurchase.request_home_activity_logs?.length > 0 && (
                <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                  {selectedPurchase.request_home_activity_logs.map((log, index) => (
                    <Box key={log.id} sx={{ pl: 4, pr: 2, pb: 2 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: alpha('#667eea', 0.05),
                          border: `1px solid ${alpha('#667eea', 0.2)}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <UpdateIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Chip
                            label={log.action?.toUpperCase() || 'UNKNOWN'}
                            size="small"
                            sx={{
                              bgcolor: alpha('#667eea', 0.2),
                              color: '#667eea',
                              fontWeight: 600,
                            }}
                          />
                          <Box sx={{ flex: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {log.created_at
                              ? new Date(log.created_at).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Box>

                        {log.billing_information && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <LocationOnIcon sx={{ fontSize: 16, color: '#667eea' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Billing Information:
                              </Typography>
                            </Box>
                            <Box sx={{ pl: 2.5 }}>
                              <Typography variant="body2" component="div">
                                {log.billing_information.address_line1 && (
                                  <>{log.billing_information.address_line1}<br /></>
                                )}
                                {log.billing_information.address_line2 && (
                                  <>{log.billing_information.address_line2}<br /></>
                                )}
                                {log.billing_information.city && (
                                  <>{log.billing_information.city}, </>
                                )}
                                {log.billing_information.state && (
                                  <>{log.billing_information.state} </>
                                )}
                                {log.billing_information.postal_code && (
                                  <>{log.billing_information.postal_code}<br /></>
                                )}
                                {log.billing_information.country && (
                                  <>{log.billing_information.country}<br /></>
                                )}
                                {log.billing_information.phone && (
                                  <>Phone: {log.billing_information.phone}</>
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {(log.old_values || log.new_values) && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                              Changes:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {log.old_values && Object.keys(log.old_values).length > 0 && (
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                  <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                                    Old Values:
                                  </Typography>
                                  <Box sx={{ mt: 0.5, p: 1, bgcolor: alpha('#f44336', 0.1), borderRadius: 1 }}>
                                    {Object.entries(log.old_values)
                                      .filter(([key]) => key !== 'billing_information_id') // Remove billing_information_id
                                      .map(([key, value]) => {
                                        // Handle nested billing_information object
                                        if (key === 'billing_information' && typeof value === 'object' && value !== null) {
                                          return (
                                            <Box key={key} sx={{ mb: 1 }}>
                                              <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                <strong>{key}:</strong>
                                              </Typography>
                                              <Box sx={{ pl: 1 }}>
                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                  <Typography key={subKey} variant="caption" component="div">
                                                    {subKey}: {String(subValue ?? 'N/A')}
                                                  </Typography>
                                                ))}
                                              </Box>
                                            </Box>
                                          );
                                        }
                                        // Handle regular values
                                        return (
                                          <Typography key={key} variant="caption" component="div">
                                            <strong>{key}:</strong> {String(value ?? 'N/A')}
                                          </Typography>
                                        );
                                      })}
                                  </Box>
                                </Box>
                              )}
                              {log.new_values && Object.keys(log.new_values).length > 0 && (
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                    New Values:
                                  </Typography>
                                  <Box sx={{ mt: 0.5, p: 1, bgcolor: alpha('#4caf50', 0.1), borderRadius: 1 }}>
                                    {Object.entries(log.new_values)
                                      .filter(([key]) => key !== 'billing_information_id') // Remove billing_information_id
                                      .map(([key, value]) => {
                                        // Handle nested billing_information object
                                        if (key === 'billing_information' && typeof value === 'object' && value !== null) {
                                          return (
                                            <Box key={key} sx={{ mb: 1 }}>
                                              <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                <strong>{key}:</strong>
                                              </Typography>
                                              <Box sx={{ pl: 1 }}>
                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                  <Typography key={subKey} variant="caption" component="div">
                                                    {subKey}: {String(subValue ?? 'N/A')}
                                                  </Typography>
                                                ))}
                                              </Box>
                                            </Box>
                                          );
                                        }
                                        // Handle regular values
                                        return (
                                          <Typography key={key} variant="caption" component="div">
                                            <strong>{key}:</strong> {String(value ?? 'N/A')}
                                          </Typography>
                                        );
                                      })}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          {log.ip_address && (
                            <>
                              <ComputerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                IP: {log.ip_address}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedPurchase && canRequestPaperToHome(selectedPurchase) && (
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => {
                setDialogOpen(false);
                handleRequestPaperToHome(selectedPurchase);
              }}
            >
              Request Paper to Home
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Request Paper to Home Dialog */}
      <Dialog
        open={requestDialogOpen}
        onClose={() => {
          setRequestDialogOpen(false);
          setSelectedPaperForRequest(null);
          setSelectedBillingInfoId(null);
        }}
        maxWidth="sm"
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
            p: 3,
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
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Request Paper to Home
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Select delivery address for your paper
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setRequestDialogOpen(false);
                setSelectedPaperForRequest(null);
                setSelectedBillingInfoId(null);
              }}
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
          {selectedPaperForRequest && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 600 }}>
                <strong>Paper:</strong> {selectedPaperForRequest.paper_name}
              </Typography>
              
              {loadingBillingInfo ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : billingInfoList.length === 0 ? (
                <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" color="warning.dark" sx={{ mb: 2 }}>
                    No billing information found. Please add billing information first.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setRequestDialogOpen(false);
                      const parentPrefix = process.env.REACT_APP_PARENT_PREFIX || 'parent';
                      navigate(`/${parentPrefix}/billing-information`);
                    }}
                  >
                    Add Billing Information
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    The paper will be delivered to the following address:
                  </Typography>
                  
                  <RadioGroup
                    value={selectedBillingInfoId ? selectedBillingInfoId.toString() : ''}
                    onChange={(e) => {
                      const newId = parseInt(e.target.value, 10);
                      setSelectedBillingInfoId(newId);
                    }}
                  >
                    {billingInfoList.map((billingInfo) => (
                      <Card
                        key={billingInfo.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          cursor: 'pointer',
                          border: selectedBillingInfoId === billingInfo.id 
                            ? '2px solid #667eea' 
                            : '1px solid #e0e0e0',
                          bgcolor: selectedBillingInfoId === billingInfo.id 
                            ? alpha('#667eea', 0.05) 
                            : 'white',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#667eea',
                            bgcolor: alpha('#667eea', 0.02),
                          }
                        }}
                        onClick={() => {
                          setSelectedBillingInfoId(billingInfo.id);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" component="div">
                              {billingInfo.address_line1 && (
                                <>{billingInfo.address_line1}<br /></>
                              )}
                              {billingInfo.address_line2 && (
                                <>{billingInfo.address_line2}<br /></>
                              )}
                              {billingInfo.city && (
                                <>{billingInfo.city}, </>
                              )}
                              {billingInfo.state && (
                                <>{billingInfo.state} </>
                              )}
                              {billingInfo.postal_code && (
                                <>{billingInfo.postal_code}<br /></>
                              )}
                              {billingInfo.country && (
                                <>{billingInfo.country}<br /></>
                              )}
                              {billingInfo.phone && (
                                <>Phone: {billingInfo.phone}</>
                              )}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            value={billingInfo.id.toString()}
                            control={<Radio />}
                            label=""
                            sx={{ m: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                      </Card>
                    ))}
                  </RadioGroup>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Note: We are processing your request. You will be notified once the paper is dispatched.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRequestDialogOpen(false);
              setSelectedPaperForRequest(null);
            }}
            disabled={requesting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRequest}
            variant="contained"
            disabled={requesting || billingInfoList.length === 0 || !selectedBillingInfoId}
            startIcon={<HomeIcon />}
          >
            {requesting ? 'Submitting...' : 'Confirm Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaperPurchases;

