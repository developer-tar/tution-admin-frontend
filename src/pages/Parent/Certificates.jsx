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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
} from '@mui/material';
import {
  EmojiEvents as AwardIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';

const ParentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const userData = localStorage.getItem('userData');
      let parentToken = null;
      
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          parentToken = parsedData.access_token;
        } catch (error) {
          console.error('Error parsing userData for token:', error);
        }
      }
      
      if (!token && !parentToken) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }
      
      const response = await api.get('parent/certificates', {
        headers: parentToken ? { Authorization: `Bearer ${parentToken}` } : {}
      });
      
      if (response.data && response.data.success) {
        // Use grouped data if available, otherwise use all_certificates
        if (response.data.data && Array.isArray(response.data.data)) {
          setCertificates(response.data.data);
        }
        if (response.data.all_certificates && Array.isArray(response.data.all_certificates)) {
          setAllCertificates(response.data.all_certificates);
        } else if (response.data.data && !Array.isArray(response.data.data)) {
          // If data is not an array, it might be the flat list
          setAllCertificates([]);
        }
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
      
      const userData = localStorage.getItem('userData');
      let parentToken = null;
      
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          parentToken = parsedData.access_token;
        } catch (error) {
          console.error('Error parsing userData for token:', error);
        }
      }
      
      const response = await api.get(`parent/certificates/${certificate.id}/download`, {
        responseType: 'blob',
        headers: parentToken ? { Authorization: `Bearer ${parentToken}` } : {}
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

  // Flatten certificates if grouped by student
  const flatCertificates = certificates.length > 0 && certificates[0]?.student 
    ? certificates.flatMap(group => 
        group.certificates.map(cert => ({
          ...cert,
          student: group.student
        }))
      )
    : allCertificates;

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
              Children's Certificates
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#5a6c7d', ml: 1, mt: 1 }}>
            View and download certificates for your children
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchCertificates} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Certificates by Child */}
      {certificates.length === 0 && flatCertificates.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AwardIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Certificates Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your children haven't received any certificates yet.
          </Typography>
        </Paper>
      ) : certificates.length > 0 && certificates[0]?.student ? (
        // Grouped by student view
        <Box>
          {certificates.map((studentGroup, index) => (
            <Accordion key={studentGroup.student.id || index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: '#667eea' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {studentGroup.student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {studentGroup.student.email}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${studentGroup.certificates.length} Certificate${studentGroup.certificates.length !== 1 ? 's' : ''}`}
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {studentGroup.certificates.map((certificate) => (
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
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        // Flat list view (fallback)
        <Grid container spacing={3}>
          {flatCertificates.map((certificate) => (
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
                  
                  {certificate.student && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        textAlign: 'center',
                        mb: 1
                      }}
                    >
                      {certificate.student.full_name || certificate.student.name}
                    </Typography>
                  )}
                  
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
    </Container>
  );
};

export default ParentCertificates;

