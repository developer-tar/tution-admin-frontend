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
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  ReceiptLong as BillingIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';

const ParentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBillingView = location.pathname.includes('/billing');
  
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchParents();
  }, [page, rowsPerPage, searchTerm]);

  const fetchParents = async () => {
    setLoading(true);
    try {
      // Assuming endpoint exists - using parent/students as reference but targeting parents specifically
      // If no specific parent list endpoint, we might need to filter users by role
      const response = await api.get('admin/parents', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        setParents(data.data || []);
        setTotalRecords(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      // Fallback for development/demo if endpoint doesn't exist yet
      // setParents([]); 
      // toast.error('Failed to fetch parent list');
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

  // Convert numeric status codes to readable format
  const getStatusDisplay = (status) => {
    const statusMap = {
      '0': { label: 'Inactive', color: 'error' },
      '1': { label: 'Active', color: 'success' },
      '2': { label: 'Pending', color: 'warning' },
      '3': { label: 'Suspended', color: 'error' },
      '4': { label: 'Verified', color: 'success' },
      '5': { label: 'Blocked', color: 'error' }
    };

    const statusInfo = statusMap[String(status)] || { label: 'Unknown', color: 'default' };
    return statusInfo;
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
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
          {isBillingView ? <BillingIcon sx={{ color: 'white' }} /> : <PersonIcon sx={{ color: 'white' }} />}
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {isBillingView ? 'Billing Management' : 'Parent Management'}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          {isBillingView 
            ? 'Select a parent to view their subscription and billing details' 
            : 'View and manage registered parents and their details'}
        </Typography>
      </Box>

      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextField
              placeholder="Search parents..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: 350,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)' }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Parent Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Students</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">Loading parents...</Typography>
                    </TableCell>
                  </TableRow>
                ) : parents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No parents found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => (
                    <TableRow 
                      key={parent.id} 
                      hover
                      sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.04)' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            width: 40, 
                            height: 40,
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {parent.first_name?.[0] || <PersonIcon />}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} color="#2d3748">
                            {parent.first_name} {parent.last_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                          <EmailIcon fontSize="small" sx={{ opacity: 0.7 }} />
                          {parent.email}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#4a5568' }}>{parent.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${parent.students_count || 0} Students`} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(102, 126, 234, 0.1)', 
                            color: '#667eea',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const statusInfo = getStatusDisplay(parent.status);
                          return (
                            <Chip 
                              label={statusInfo.label} 
                              color={statusInfo.color} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600, 
                                borderRadius: '6px',
                                minWidth: '80px'
                              }}
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Billing & Subscriptions" arrow>
                          <IconButton 
                            onClick={() => navigate(`/admin/parent/${parent.id}/billing`)}
                            sx={{ 
                              color: '#667eea',
                              bgcolor: 'rgba(102, 126, 234, 0.1)',
                              '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' },
                              transition: 'all 0.2s'
                            }}
                          >
                            <BillingIcon />
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
            sx={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ParentList;

