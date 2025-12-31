import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Paper,
  Container,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import {
  EmojiEvents as AwardIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('admin-token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }
      
      const response = await api.get('student/certificates');
      
      if (response.data && response.data.success) {
        setCertificates(response.data.data || []);
      } else {
        setError('Failed to load certificates');
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err.response?.data?.message || 'Failed to load certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      setDownloading({ ...downloading, [certificate.id]: true });
      
      const response = await api.get(`student/certificates/${certificate.id}/download`, {
        responseType: 'blob',
      });
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificate_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully');
    } catch (err) {
      console.error('Error downloading certificate:', err);
      toast.error(err.response?.data?.message || 'Failed to download certificate');
    } finally {
      setDownloading({ ...downloading, [certificate.id]: false });
    }
  };

  const handlePreview = (certificate) => {
    setSelectedCertificate(certificate);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedCertificate(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={200} />
                  <Skeleton variant="text" width="60%" height={32} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchCertificates} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '25px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
          }}>
            <AwardIcon sx={{ fontSize: '24px', color: 'white' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
              My Certificates
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#5a6c7d', ml: 1, mt: 1 }}>
            View and download your achievement certificates
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchCertificates} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AwardIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Certificates Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't received any certificates yet. Keep working hard!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {certificates.map((certificate) => (
            <Grid item xs={12} md={6} lg={4} key={certificate.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '2px solid #d4af37',
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    color: '#d4af37'
                  }}>
                    <AwardIcon sx={{ fontSize: 64 }} />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      textAlign: 'center',
                      mb: 1,
                      color: '#2c3e50'
                    }}
                    gutterBottom
                  >
                    {certificate.award?.name || 'Certificate'}
                  </Typography>
                  
                  {certificate.award?.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        textAlign: 'center',
                        mb: 2,
                        minHeight: 40
                      }}
                    >
                      {certificate.award.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Chip 
                      label={`Issued: ${new Date(certificate.issued_date).toLocaleDateString()}`}
                      size="small"
                      sx={{ mb: 1, width: '100%' }}
                    />
                    <Chip 
                      label={`Cert #: ${certificate.certificate_number}`}
                      size="small"
                      variant="outlined"
                      sx={{ width: '100%' }}
                    />
                  </Box>
                  
                  {certificate.achievement_details && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        display: 'block',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        mb: 2
                      }}
                    >
                      {certificate.achievement_details}
                    </Typography>
                  )}
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(certificate)}
                    disabled={downloading[certificate.id]}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      }
                    }}
                  >
                    {downloading[certificate.id] ? 'Downloading...' : 'Download PDF'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AwardIcon />
            <Typography variant="h6">
              {selectedCertificate?.award?.name || 'Certificate'}
            </Typography>
          </Box>
          <IconButton onClick={handleClosePreview} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedCertificate && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Certificate Number:</strong> {selectedCertificate.certificate_number}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Issued Date:</strong> {new Date(selectedCertificate.issued_date).toLocaleDateString()}
              </Typography>
              {selectedCertificate.award?.description && (
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong> {selectedCertificate.award.description}
                </Typography>
              )}
              {selectedCertificate.achievement_details && (
                <Typography variant="body1" gutterBottom>
                  <strong>Achievement Details:</strong> {selectedCertificate.achievement_details}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => selectedCertificate && handleDownload(selectedCertificate)}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentCertificates;

