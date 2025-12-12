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
  Paper
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  ReceiptLong as ReceiptIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from '../../api';
import { toast } from 'react-toastify';

const PaperPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPurchases();
  }, [statusFilter, searchTerm]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await api.get('parent/paper-purchases', { params });
      
      if (response.data.success) {
        setPurchases(response.data.data || []);
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

  const handleDownloadPdf = (pdf) => {
    window.open(pdf.url, '_blank');
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
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            fullWidth
            sx={{ maxWidth: 400 }}
            placeholder="Search by paper name, description, category..."
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
          <FormControl sx={{ minWidth: 200 }}>
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
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Paper Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Purchased At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
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
                      {purchase.student_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {purchase.purchased_at 
                        ? new Date(purchase.purchased_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewDetails(purchase)}
                        >
                          View
                        </Button>
                        {purchase.paper_pdfs?.length > 0 && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadPdf(purchase.paper_pdfs[0])}
                          >
                            Download
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
        <DialogContent sx={{ p: 3 }}>
          {selectedPurchase && (
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaperPurchases;

