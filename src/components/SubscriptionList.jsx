import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const SubscriptionList = ({ subscriptions, loading }) => {
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>Loading subscriptions...</Typography>
      </Box>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Box sx={{ 
        p: 6, 
        textAlign: 'center', 
        bgcolor: '#f8f9fa', 
        borderRadius: 4,
        border: '1px dashed rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 32, color: 'text.secondary', opacity: 0.5 }} />
        </Box>
        <Typography variant="h6" color="text.secondary">
          No subscriptions found
        </Typography>
      </Box>
    );
  }

  // Flatten the subscriptions array
  const flatSubscriptions = subscriptions.flatMap(group => {
    return group.subscriptions.map(sub => ({
      ...sub,
      student_name: group.student_name,
      student_id: group.student_id
    }));
  });

  if (flatSubscriptions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary">
          No subscriptions found
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'success';
      case 'PAY':
      case 'PENDING':
        return 'warning';
      case 'UNPAID':
      case 'FAILED':
        return 'error';
      case 'NOT_DUE':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {flatSubscriptions.map((sub, index) => (
        <Card 
          key={index} 
          elevation={0}
          sx={{ 
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              {/* Course Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: '8px', 
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea'
                }}>
                  <SchoolIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#2d3748">
                    {sub.course_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Course Subscription
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, height: 30, alignSelf: 'center' }} />

              {/* Student Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="#4a5568">
                    {sub.student_name === 'Unassigned' ? 'Not Assigned' : sub.student_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Student
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Chip 
              label={sub.academic_year} 
              size="small" 
              sx={{ 
                fontWeight: 600, 
                borderRadius: '6px',
                bgcolor: 'rgba(0,0,0,0.05)',
                color: '#4a5568'
              }}
            />
          </Box>

          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#718096', py: 2, pl: 3 }}>Term</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#718096' }}>Due Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#718096' }}>Amount Due</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#718096' }}>Paid</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#718096' }}>Balance</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#718096' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#718096', pr: 3 }}>Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sub.payments.map((payment, payIndex) => (
                    <TableRow key={payIndex} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                      <TableCell sx={{ py: 2, pl: 3, fontWeight: 500 }}>{payment.term_name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4a5568' }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                          <Typography variant="body2">{payment.due_date}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {typeof payment.amount_due === 'number' 
                          ? payment.amount_due.toFixed(2) 
                          : payment.amount_due}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontFamily: 'monospace', fontWeight: 600 }}>
                        {typeof payment.paid_amount === 'number'
                          ? payment.paid_amount.toFixed(2)
                          : payment.paid_amount}
                      </TableCell>
                      <TableCell align="right" sx={{ color: parseFloat(payment.balance) > 0 ? 'error.main' : 'text.secondary', fontFamily: 'monospace', fontWeight: 600 }}>
                        {typeof payment.balance === 'number'
                          ? payment.balance.toFixed(2)
                          : payment.balance}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                          variant={payment.status === 'NOT_DUE' ? 'outlined' : 'filled'}
                          sx={{ minWidth: 80, fontWeight: 700, borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ pr: 3 }}>
                        {payment.status?.toUpperCase() === 'PAID' ? (
                          // Payment is PAID - Show Download Receipt button if PDF URL exists
                          payment.receipt_pdf_url ? (
                            <Tooltip title="Download Receipt" arrow>
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                variant="outlined"
                                sx={{
                                  color: '#16a34a',
                                  borderColor: '#16a34a',
                                  bgcolor: 'rgba(22, 163, 74, 0.05)',
                                  fontSize: '11px',
                                  py: 0.5,
                                  px: 1.5,
                                  minWidth: 'auto',
                                  borderRadius: '6px',
                                  '&:hover': {
                                    bgcolor: 'rgba(22, 163, 74, 0.1)',
                                    borderColor: '#16a34a'
                                  }
                                }}
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = payment.receipt_pdf_url;
                                  link.download = `receipt-${payment.term_name}.pdf`;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                Receipt
                              </Button>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>—</Typography>
                          )
                        ) : (
                          // Payment is NOT PAID - Show Pay Invoice button if receipt URL exists
                          payment.receipt_url ? (
                            <Tooltip title="Pay Invoice" arrow>
                              <Button
                                size="small"
                                startIcon={<PaymentIcon />}
                                variant="contained"
                                sx={{
                                  bgcolor: '#dc2626',
                                  color: '#fff',
                                  fontSize: '11px',
                                  py: 0.5,
                                  px: 1.5,
                                  minWidth: 'auto',
                                  borderRadius: '6px',
                                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                                  '&:hover': {
                                    bgcolor: '#b91c1c',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                                  }
                                }}
                                onClick={() => window.open(payment.receipt_url, '_blank')}
                              >
                                Pay Invoice
                              </Button>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>—</Typography>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SubscriptionList;
