import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Collapse,
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Tabs,
  Tab,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  ReceiptLong as BillingIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  LocationOn as LocationOnIcon,
  History as HistoryIcon,
  Update as UpdateIcon,
  Computer as ComputerIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import api from '../../api';
import { toast } from 'react-toastify';

const PaperPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [viewDialog, setViewDialog] = useState({ open: false, parent: null });
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseTabValue, setPurchaseTabValue] = useState(0);
  const [filters, setFilters] = useState({
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'latest_purchase_date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchPurchases();
  }, [page, rowsPerPage, searchTerm, filters]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.paymentStatus && { payment_status: filters.paymentStatus }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo && { date_to: filters.dateTo }),
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      };

      const response = await api.get('admin/paper-purchases', { params });
      
      if (response.data.success) {
        setPurchases(response.data.data.data || []);
        setTotalRecords(response.data.data.pagination?.total || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch paper purchases');
      }
    } catch (error) {
      console.error('Error fetching paper purchases:', error);
      toast.error(error.response?.data?.message || 'Failed to load paper purchases');
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

  const handleViewDetails = (parent) => {
    setViewDialog({ open: true, parent });
    setSelectedPurchase(null);
    setPurchaseTabValue(0);
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, parent: null });
    setSelectedPurchase(null);
    setPurchaseTabValue(0);
  };

  // Map payment status enum/numbers to readable strings
  const getPaymentStatusLabel = (status) => {
    // Handle both string and number statuses
    const statusMap = {
      // String statuses
      'paid': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed',
      'canceled': 'Canceled',
      'cancelled': 'Cancelled',
      'expired': 'Expired',
      'refunded': 'Refunded',
      'partially_refunded': 'Partially Refunded',
      // Numeric enum statuses (backend sends enum numbers as keys in payment_status_summary)
      1: 'Paid',
      2: 'Pending',
      3: 'Failed',
      4: 'Canceled',
      5: 'Expired',
      6: 'Refunded',
      7: 'Partially Refunded',
      // String numeric (for payment_status_summary keys)
      '1': 'Paid',
      '2': 'Pending',
      '3': 'Failed',
      '4': 'Canceled',
      '5': 'Expired',
      '6': 'Refunded',
      '7': 'Partially Refunded'
    };
    // Convert to number if it's a string number, then map
    const numStatus = typeof status === 'string' && !isNaN(status) ? parseInt(status) : status;
    return statusMap[numStatus] || statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    // Normalize status for color mapping
    const normalizedStatus = typeof status === 'number' ? status : status?.toLowerCase();
    
    const colors = {
      // String statuses
      'paid': 'success',
      'pending': 'warning',
      'failed': 'error',
      'canceled': 'default',
      'cancelled': 'default',
      'expired': 'default',
      'refunded': 'info',
      'partially_refunded': 'info',
      // Numeric enum statuses
      1: 'success',      // Paid
      2: 'warning',      // Pending
      3: 'error',        // Failed
      4: 'default',      // Canceled
      5: 'default',      // Expired
      6: 'info',         // Refunded
      7: 'info',         // Partially Refunded
      // String numeric
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
          <BillingIcon sx={{ fontSize: '24px', color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Paper Purchases
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          View and manage all paper purchases grouped by parent
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by parent name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                label="Payment Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="partially_refunded">Partially Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Date From"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Date To"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                label="Sort By"
              >
                <MenuItem value="latest_purchase_date">Latest Purchase</MenuItem>
                <MenuItem value="total_amount">Total Amount</MenuItem>
                <MenuItem value="total_papers">Total Papers</MenuItem>
                <MenuItem value="parent_name">Parent Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Total Papers</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Latest Purchase</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                    <TableCell align="right">
                      <Skeleton variant="text" width={40} height={20} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={60} height={20} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No paper purchases found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((parent) => (
                  <TableRow key={parent.parent_id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#667eea' }}>
                            {parent.parent_name?.charAt(0)?.toUpperCase() || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {parent.parent_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {parent.parent_email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {parent.total_papers}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(parent.total_amount, parent.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {parent.latest_purchase_date 
                            ? new Date(parent.latest_purchase_date).toLocaleDateString()
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details" arrow>
                          <IconButton
                            onClick={() => handleViewDetails(parent)}
                            size="small"
                            sx={{
                              color: '#2196f3',
                              bgcolor: 'rgba(33, 150, 243, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(33, 150, 243, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BillingIcon sx={{ color: '#667eea' }} />
            <Typography variant="h6" fontWeight={600}>
              Purchase Details - {viewDialog.parent?.parent_name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {viewDialog.parent && (
            <Box>
              {/* Parent Info */}
              <Card sx={{ mb: 3, bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Parent Name</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {viewDialog.parent.parent_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{viewDialog.parent.parent_email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Total Papers</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {viewDialog.parent.total_papers}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(viewDialog.parent.total_amount, viewDialog.parent.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Latest Purchase</Typography>
                      <Typography variant="body1">
                        {viewDialog.parent.latest_purchase_date 
                          ? new Date(viewDialog.parent.latest_purchase_date).toLocaleString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>


              {/* Purchases List */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Individual Purchases ({viewDialog.parent.purchases?.length || 0})
              </Typography>
              
              {viewDialog.parent.purchases?.map((purchase) => (
                <Card key={purchase.purchase_id} sx={{ mb: 2, border: `1px solid ${alpha('#667eea', 0.2)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                          {purchase.paper_name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            label={purchase.format_name || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: alpha('#667eea', 0.1),
                              color: '#667eea',
                              fontWeight: 500
                            }}
                          />
                          <Chip
                            label={getPaymentStatusLabel(purchase.payment_status)}
                            color={getStatusColor(purchase.payment_status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Amount: {formatCurrency(purchase.amount, purchase.currency)}
                        </Typography>
                        {purchase.student_name && (
                          <Typography variant="body2" color="text.secondary">
                            Student: {purchase.student_name}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Purchased: {purchase.purchased_at 
                            ? new Date(purchase.purchased_at).toLocaleString()
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Latest Billing Information */}
                    {purchase.latest_billing_information && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: alpha('#667eea', 0.05), borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <LocationOnIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Latest Billing Information
                          </Typography>
                          {purchase.latest_billing_information.updated_at && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                              Updated: {new Date(purchase.latest_billing_information.updated_at).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ pl: 3 }}>
                          <Typography variant="body2" component="div">
                            {purchase.latest_billing_information.address_line1 && (
                              <>{purchase.latest_billing_information.address_line1}<br /></>
                            )}
                            {purchase.latest_billing_information.address_line2 && (
                              <>{purchase.latest_billing_information.address_line2}<br /></>
                            )}
                            {purchase.latest_billing_information.city && (
                              <>{purchase.latest_billing_information.city}, </>
                            )}
                            {purchase.latest_billing_information.state && (
                              <>{purchase.latest_billing_information.state} </>
                            )}
                            {purchase.latest_billing_information.postal_code && (
                              <>{purchase.latest_billing_information.postal_code}<br /></>
                            )}
                            {purchase.latest_billing_information.country && (
                              <>{purchase.latest_billing_information.country}<br /></>
                            )}
                            {purchase.latest_billing_information.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2">{purchase.latest_billing_information.phone}</Typography>
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Activity Logs */}
                    {purchase.request_home_activity_logs && purchase.request_home_activity_logs.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <HistoryIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Activity Logs ({purchase.request_home_activity_logs.length})
                          </Typography>
                        </Box>
                        <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {purchase.request_home_activity_logs.map((log, index) => (
                            <Card
                              key={log.id}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                mb: 1.5,
                                bgcolor: alpha('#667eea', 0.05),
                                border: `1px solid ${alpha('#667eea', 0.2)}`,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <UpdateIcon sx={{ color: '#667eea', fontSize: 18 }} />
                                <Chip
                                  label={log.action?.toUpperCase() || 'UNKNOWN'}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#667eea', 0.2),
                                    color: '#667eea',
                                    fontWeight: 600,
                                    height: 20
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
                                <Box sx={{ mb: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    <LocationOnIcon sx={{ fontSize: 14, color: '#667eea' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      Billing Information:
                                    </Typography>
                                  </Box>
                                  <Box sx={{ pl: 2 }}>
                                    <Typography variant="caption" component="div">
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
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                                    Changes:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                                      <Box sx={{ flex: 1, minWidth: 200 }}>
                                        <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                                          Old Values:
                                        </Typography>
                                        <Box sx={{ mt: 0.5, p: 1, bgcolor: alpha('#f44336', 0.1), borderRadius: 1 }}>
                                          {Object.entries(log.old_values)
                                            .filter(([key]) => key !== 'billing_information_id')
                                            .map(([key, value]) => {
                                              if (key === 'billing_information' && typeof value === 'object' && value !== null) {
                                                return (
                                                  <Box key={key} sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 0.25 }}>
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
                                            .filter(([key]) => key !== 'billing_information_id')
                                            .map(([key, value]) => {
                                              if (key === 'billing_information' && typeof value === 'object' && value !== null) {
                                                return (
                                                  <Box key={key} sx={{ mb: 0.5 }}>
                                                    <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 0.25 }}>
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

                              {log.ip_address && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                  <ComputerIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    IP: {log.ip_address}
                                  </Typography>
                                </Box>
                              )}
                            </Card>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseViewDialog} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaperPurchases;

