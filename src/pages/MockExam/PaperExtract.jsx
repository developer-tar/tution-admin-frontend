import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper as MuiPaper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Zoom,
  Fade,
  alpha,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
  AttachFile as AttachFileIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../api';

export default function PaperExtract() {
  const [extracts, setExtracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedExtract, setSelectedExtract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    year: '',
    level: '',
    extraction_status: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    paper_id: '',
    subject: '',
    exam_board: '',
    year: '',
    level: '',
    price: '',
    currency: '€',
    source_file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [mainTabValue, setMainTabValue] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionEditData, setQuestionEditData] = useState({});
  const [editingPaper, setEditingPaper] = useState(false);
  const [paperEditData, setPaperEditData] = useState({});
  const [openEditPriceDialog, setOpenEditPriceDialog] = useState(false);
  const [editingPriceExtract, setEditingPriceExtract] = useState(null);
  const [priceEditData, setPriceEditData] = useState({ price: '', currency: '€' });

  useEffect(() => {
    fetchExtracts();
    fetchStatistics();
  }, [pagination.current_page, filters, searchTerm]);

  const fetchExtracts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admin/paper-extracts', { params });

      console.log('Paper Extracts API Response:', response.data); // Debug log

      if (response.data && response.data.success) {
        // Handle paginated response structure
        const paginatedData = response.data.data;
        const extractsList = paginatedData.data || paginatedData || [];

        console.log('Extracts found:', extractsList.length); // Debug log

        setExtracts(extractsList);
        setPagination({
          current_page: paginatedData.current_page || 1,
          per_page: paginatedData.per_page || 15,
          total: paginatedData.total || 0,
          last_page: paginatedData.last_page || 1,
        });
      } else {
        console.error('API response structure:', response.data);
        toast.error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching extracts:', error);
      toast.error('Failed to fetch paper extracts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/paper-extracts/statistics/overview');
      if (response.data && response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleOpenUploadForm = () => {
    setFormData({
      name: '',
      description: '',
      paper_id: '',
      subject: '',
      exam_board: '',
      year: '',
      level: '',
      price: '',
      currency: '€',
      source_file: null,
    });
    setMainTabValue(1);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      description: '',
      paper_id: '',
      subject: '',
      exam_board: '',
      year: '',
      level: '',
      price: '',
      currency: '€',
      source_file: null,
    });
  };

  const resetUploadForm = () => {
    setFormData({
      name: '',
      description: '',
      paper_id: '',
      subject: '',
      exam_board: '',
      year: '',
      level: '',
      price: '',
      currency: '€',
      source_file: null,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast.error('Only PDF and Word documents are allowed');
        return;
      }
      setFormData({ ...formData, source_file: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.source_file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      if (formData.paper_id) formDataToSend.append('paper_id', formData.paper_id);
      formDataToSend.append('subject', formData.subject || '');
      formDataToSend.append('exam_board', formData.exam_board || '');
      formDataToSend.append('year', formData.year || '');
      formDataToSend.append('level', formData.level || '');
      if (formData.price) formDataToSend.append('price', formData.price);
      if (formData.currency) formDataToSend.append('currency', formData.currency);
      formDataToSend.append('source_file', formData.source_file);

      const response = await api.post('/admin/paper-extracts', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        toast.success('Paper extract created successfully. Extraction in progress.');
        resetUploadForm();
        setMainTabValue(0);
        fetchExtracts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error creating extract:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create paper extract';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await api.get(`/admin/paper-extracts/${id}`);
      if (response.data && response.data.success) {
        const extractData = response.data.data;
        console.log('Full extract data:', extractData);
        console.log('Extract questions (extractQuestions):', extractData.extractQuestions);
        console.log('Extract questions (extract_questions):', extractData.extract_questions);
        console.log('Extract questions (questions):', extractData.questions);
        console.log('Questions count (extractQuestions):', extractData.extractQuestions?.length || 0);
        console.log('Questions count (extract_questions):', extractData.extract_questions?.length || 0);
        console.log('Questions count (questions):', extractData.questions?.length || 0);

        // Normalize the questions property name
        if (extractData.extract_questions && !extractData.extractQuestions) {
          extractData.extractQuestions = extractData.extract_questions;
        }

        setSelectedExtract(extractData);
        setOpenViewDialog(true);
      }
    } catch (error) {
      console.error('Error fetching extract:', error);
      toast.error('Failed to fetch extract details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this extract?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/paper-extracts/${id}`);
      if (response.data && response.data.success) {
        toast.success('Paper extract deleted successfully');
        fetchExtracts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting extract:', error);
      toast.error('Failed to delete paper extract');
    }
  };

  const handleSavePrice = async () => {
    if (!editingPriceExtract) return;

    try {
      const response = await api.put(`/admin/paper-extracts/${editingPriceExtract.id}`, {
        price: priceEditData.price || null,
        currency: priceEditData.currency || '€',
      });

      if (response.data && response.data.success) {
        toast.success('Price updated successfully');
        setOpenEditPriceDialog(false);
        setEditingPriceExtract(null);
        setPriceEditData({ price: '', currency: '€' });
        fetchExtracts();
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, current_page: value });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 4,
      pb: 8
    }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              width: 70, 
              height: 70, 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              boxShadow: '0 8px 32px rgba(245, 87, 108, 0.4)'
            }}>
              <FileDownloadIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', textShadow: '2px 2px 8px rgba(0,0,0,0.3)', letterSpacing: '-0.5px' }}>
                Paper Extract
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500 }}>
                Upload PDF to extract questions automatically
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      <Zoom in timeout={600}>
        <Card sx={{ 
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          overflow: 'hidden'
        }}>
          <Tabs 
            value={mainTabValue} 
            onChange={(e, newValue) => setMainTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 70,
                px: 4,
                transition: 'all 0.3s ease',
                '&:hover': { background: alpha('#667eea', 0.08) }
              },
              '& .Mui-selected': { color: '#667eea !important', background: alpha('#667eea', 0.1) },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab icon={<FileDownloadIcon />} iconPosition="start" label="All Extracts" />
            <Tab icon={<AddIcon />} iconPosition="start" label="Upload Paper" />
          </Tabs>
        </Card>
      </Zoom>

      {mainTabValue === 0 && (
        <Fade in timeout={400}>
          <Box>
      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Extracts
                </Typography>
                <Typography variant="h4">
                  {statistics.total_extracts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.completed_extracts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Questions
                </Typography>
                <Typography variant="h4">
                  {statistics.total_questions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Processing
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.processing_extracts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters and Search */}
      <MuiPaper sx={{ p: 4, mb: 3, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', background: 'rgba(255,255,255,0.98)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#667eea' }}>
          <FilterListIcon />
          Filter Extracts
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search extracts..."
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
              <InputLabel>Subject</InputLabel>
              <Select
                value={filters.subject}
                label="Subject"
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {statistics?.subjects?.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={filters.year}
                label="Year"
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {statistics?.years?.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.extraction_status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, extraction_status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setFilters({
                  subject: '',
                  year: '',
                  level: '',
                  extraction_status: '',
                  status: '',
                });
                setSearchTerm('');
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </MuiPaper>

      {/* Extracts Table */}
      <TableContainer component={MuiPaper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>File</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Subject</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Year</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Level</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Price</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Questions</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Uploaded</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}><TableCell colSpan={10}><Skeleton height={60} /></TableCell></TableRow>
              ))
            ) : extracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <FileDownloadIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" fontWeight={600}>No extracts found</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Upload a PDF to extract questions</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              extracts.map((extract) => {
                const fileName = extract.source_file_path
                  ? extract.source_file_path.split('/').pop()
                  : 'N/A';
                const fileExtension = fileName.includes('.')
                  ? fileName.split('.').pop().toUpperCase()
                  : '';
                const extractTitle = extract.name || extract.title || 'Untitled';

                return (
                  <TableRow key={extract.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {extractTitle}
                      </Typography>
                      {extract.description && (
                        <Typography variant="caption" color="text.secondary" sx={{
                          display: 'block',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {extract.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={fileExtension || 'PDF'}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {extract.subject ? (
                        <Chip label={extract.subject} size="small" color="primary" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>{extract.year || '-'}</TableCell>
                    <TableCell>
                      {extract.level ? (
                        <Chip label={extract.level} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {extract.price ? (
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {extract.currency || '€'}{extract.price}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Not set</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {extract.extract_questions_count || extract.questions_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={extract.extraction_status}
                        color={getStatusColor(extract.extraction_status)}
                        size="small"
                      />
                      {extract.extraction_error && (
                        <Tooltip title={extract.extraction_error}>
                          <IconButton size="small" color="error" sx={{ ml: 0.5 }}>
                            <ErrorIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(extract.created_at).toLocaleDateString()}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(extract.created_at).toLocaleTimeString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(extract.id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Price">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingPriceExtract(extract);
                              setPriceEditData({
                                price: extract.price || '',
                                currency: extract.currency || '€',
                              });
                              setOpenEditPriceDialog(true);
                            }}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {extract.source_file_path && (
                          <Tooltip title="Download File">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const fileUrl = `${process.env.REACT_APP_API_URL || ''}/storage/${extract.source_file_path}`;
                                window.open(fileUrl, '_blank');
                              }}
                              color="info"
                            >
                              <FileDownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(extract.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.last_page}
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
          </Box>
        </Fade>
      )}

      {mainTabValue === 1 && (
        <Fade in timeout={400}>
          <MuiPaper component="form" onSubmit={handleSubmit} sx={{ p: 4, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', background: 'rgba(255,255,255,0.98)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#667eea' }}>Upload Paper for Extraction</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Title *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Exam Board" value={formData.exam_board} onChange={(e) => setFormData({ ...formData, exam_board: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Level" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} placeholder="e.g., GCSE, A-Level" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Price" type="number" inputProps={{ step: '0.01', min: '0' }} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select value={formData.currency} label="Currency" onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                    <MenuItem value="€">€ (Euro)</MenuItem>
                    <MenuItem value="£">£ (Pound)</MenuItem>
                    <MenuItem value="$">$ (Dollar)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* PDF Upload Card - like previous Create Paper */}
              <Grid item xs={12}>
                <Card sx={{ 
                  p: 4, 
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)',
                  border: '3px dashed',
                  borderColor: alpha('#f44336', 0.3),
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(244, 67, 54, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)', boxShadow: '0 8px 24px rgba(244, 67, 54, 0.4)' }}>
                      <PdfIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>PDF / Word File Upload</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Upload a single file (max 10MB). PDF or Word document.</Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" component="label" startIcon={<AttachFileIcon />} sx={{ mb: 2, borderRadius: 2, background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5 }}>
                    {formData.source_file ? formData.source_file.name : 'Choose PDF or Word Document'}
                    <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                  </Button>
                  {formData.source_file && (
                    <List sx={{ background: 'white', borderRadius: 2, border: '2px solid', borderColor: alpha('#4caf50', 0.3) }}>
                      <ListItem secondaryAction={<IconButton edge="end" onClick={() => setFormData({ ...formData, source_file: null })} size="small" sx={{ color: '#f44336' }}><DeleteIcon /></IconButton>}>
                        <ListItemIcon><Avatar sx={{ background: alpha('#4caf50', 0.1), color: '#4caf50' }}><PdfIcon /></Avatar></ListItemIcon>
                        <ListItemText primary={formData.source_file.name} secondary={`${(formData.source_file.size / 1024 / 1024).toFixed(2)} MB`} />
                      </ListItem>
                    </List>
                  )}
                  <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3, borderRadius: 2, border: '2px solid', borderColor: alpha('#2196f3', 0.3) }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Requirements:</Typography>
                    <Typography variant="caption" component="div">✓ Max 10MB · PDF, .doc or .docx</Typography>
                  </Alert>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '2px solid', borderColor: 'divider' }}>
                  <Button type="button" variant="outlined" onClick={() => setMainTabValue(0)} sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={uploading} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 700, textTransform: 'none', px: 4 }}>
                    {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload & Extract'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </MuiPaper>
        </Fade>
      )}

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedExtract?.title}</Typography>
            <IconButton
              onClick={() => setOpenViewDialog(false)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedExtract && (
            <Box>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Paper Details" />
                <Tab label={`Questions (${selectedExtract.extractQuestions?.length || selectedExtract.questions?.length || 0})`} />
                <Tab label="File Information" />
              </Tabs>

              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">Basic Information</Typography>
                          {editingPaper ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setEditingPaper(false);
                                  setPaperEditData({});
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={async () => {
                                  try {
                                    const response = await api.put(`/admin/paper-extracts/${selectedExtract.id}`, paperEditData);
                                    if (response.data && response.data.success) {
                                      toast.success('Paper updated successfully');
                                      setSelectedExtract(response.data.data);
                                      setEditingPaper(false);
                                      setPaperEditData({});
                                      fetchExtracts(); // Refresh the list
                                    }
                                  } catch (error) {
                                    console.error('Error updating paper:', error);
                                    toast.error('Failed to update paper');
                                  }
                                }}
                              >
                                Save
                              </Button>
                            </Box>
                          ) : (
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingPaper(true);
                                setPaperEditData({
                                  name: selectedExtract.name || '',
                                  description: selectedExtract.description || '',
                                  subject: selectedExtract.subject || '',
                                  exam_board: selectedExtract.exam_board || '',
                                  year: selectedExtract.year || '',
                                  level: selectedExtract.level || '',
                                  price: selectedExtract.price || '',
                                  currency: selectedExtract.currency || '€',
                                });
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Title</Typography>
                            {editingPaper ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={paperEditData.name || ''}
                                onChange={(e) => setPaperEditData({ ...paperEditData, name: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body1" fontWeight="medium">{selectedExtract.name || selectedExtract.title || 'Untitled'}</Typography>
                            )}
                          </Grid>
                          {selectedExtract.paper && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>Linked Paper</Typography>
                              <Typography variant="body1">{selectedExtract.paper.name}</Typography>
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Description</Typography>
                            {editingPaper ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                value={paperEditData.description || ''}
                                onChange={(e) => setPaperEditData({ ...paperEditData, description: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body1">{selectedExtract.description || '-'}</Typography>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Academic Details</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
                            {editingPaper ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={paperEditData.subject || ''}
                                onChange={(e) => setPaperEditData({ ...paperEditData, subject: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body1">
                                {selectedExtract.subject ? (
                                  <Chip label={selectedExtract.subject} size="small" color="primary" />
                                ) : (
                                  '-'
                                )}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Year</Typography>
                            {editingPaper ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={paperEditData.year || ''}
                                onChange={(e) => setPaperEditData({ ...paperEditData, year: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body1">{selectedExtract.year || '-'}</Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Level</Typography>
                            {editingPaper ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={paperEditData.level || ''}
                                onChange={(e) => setPaperEditData({ ...paperEditData, level: e.target.value })}
                                placeholder="e.g., GCSE, A-Level, 11 Plus"
                              />
                            ) : (
                              <Typography variant="body1">
                                {selectedExtract.level ? (
                                  <Chip label={selectedExtract.level} size="small" variant="outlined" />
                                ) : (
                                  '-'
                                )}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">Exam Board</Typography>
                            {editingPaper ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={paperEditData.exam_board || ''}
                                onChange={(e) => setPaperEditData({ ...paperEditData, exam_board: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body1">{selectedExtract.exam_board || '-'}</Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                            {editingPaper ? (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  inputProps={{ step: "0.01", min: "0" }}
                                  value={paperEditData.price || ''}
                                  onChange={(e) => setPaperEditData({ ...paperEditData, price: e.target.value })}
                                  sx={{ flex: 1 }}
                                />
                                <FormControl size="small" sx={{ minWidth: 80 }}>
                                  <Select
                                    value={paperEditData.currency || '€'}
                                    onChange={(e) => setPaperEditData({ ...paperEditData, currency: e.target.value })}
                                  >
                                    <MenuItem value="€">€</MenuItem>
                                    <MenuItem value="£">£</MenuItem>
                                    <MenuItem value="$">$</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                            ) : (
                              <Typography variant="body1" fontWeight="medium">
                                {selectedExtract.price ? `${selectedExtract.currency || '€'}${selectedExtract.price}` : 'Not set'}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Extraction Status</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={selectedExtract.extraction_status}
                                color={getStatusColor(selectedExtract.extraction_status)}
                                size="medium"
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Total Questions</Typography>
                            <Typography variant="h5" color="primary">{selectedExtract.total_questions || 0}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Total Pages</Typography>
                            <Typography variant="h5">{selectedExtract.total_pages || '-'}</Typography>
                          </Grid>
                          {selectedExtract.extraction_error && (
                            <Grid item xs={12}>
                              <Alert severity="error" sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>Extraction Error:</Typography>
                                <Typography variant="body2">{selectedExtract.extraction_error}</Typography>
                              </Alert>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Upload Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Uploaded Date</Typography>
                            <Typography variant="body1">
                              {new Date(selectedExtract.created_at).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Uploaded By</Typography>
                            <Typography variant="body1">
                              {selectedExtract.creator
                                ? `${selectedExtract.creator.first_name} ${selectedExtract.creator.last_name} (${selectedExtract.creator.email})`
                                : '-'}
                            </Typography>
                          </Grid>
                          {selectedExtract.updated_at && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="textSecondary">Last Updated</Typography>
                              <Typography variant="body1">
                                {new Date(selectedExtract.updated_at).toLocaleString()}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Source File</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">File Path</Typography>
                            <Typography variant="body2" sx={{
                              fontFamily: 'monospace',
                              bgcolor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              wordBreak: 'break-all'
                            }}>
                              {selectedExtract.source_file_path || 'N/A'}
                            </Typography>
                          </Grid>
                          {selectedExtract.source_file_path && (
                            <Grid item xs={12}>
                              <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => {
                                  const fileUrl = `${process.env.REACT_APP_API_URL || ''}/storage/${selectedExtract.source_file_path}`;
                                  window.open(fileUrl, '_blank');
                                }}
                              >
                                Download Source File
                              </Button>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  {selectedExtract.extracted_file_path && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Extracted File</Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="textSecondary">Extracted Text Path</Typography>
                              <Typography variant="body2" sx={{
                                fontFamily: 'monospace',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                wordBreak: 'break-all'
                              }}>
                                {selectedExtract.extracted_file_path}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={() => {
                                  const fileUrl = `${process.env.REACT_APP_API_URL || ''}/storage/${selectedExtract.extracted_file_path}`;
                                  window.open(fileUrl, '_blank');
                                }}
                              >
                                Download Extracted Text
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {selectedExtract.metadata && Object.keys(selectedExtract.metadata).length > 0 && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Additional Metadata</Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box component="pre" sx={{
                            bgcolor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.875rem'
                          }}>
                            {JSON.stringify(selectedExtract.metadata, null, 2)}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  {(selectedExtract.extractQuestions || selectedExtract.questions) && (selectedExtract.extractQuestions || selectedExtract.questions).length > 0 ? (
                    <Box>
                      {(() => {
                        // Group questions by section
                        const questionsBySection = {};
                        (selectedExtract.extractQuestions || selectedExtract.questions || []).forEach((question) => {
                          const section = question.section || 'No Section';
                          if (!questionsBySection[section]) {
                            questionsBySection[section] = [];
                          }
                          questionsBySection[section].push(question);
                        });

                        // Get sections in order
                        const sections = Object.keys(questionsBySection);

                        return sections.map((section, sectionIndex) => (
                          <Box key={section} sx={{ mb: 4 }}>
                            {/* Section Header */}
                            {section !== 'No Section' && (
                              <Box
                                sx={{
                                  mb: 2,
                                  pb: 1,
                                  borderBottom: '2px solid',
                                  borderColor: 'primary.main',
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  {section}
                                </Typography>
                              </Box>
                            )}

                            {/* Questions in this section */}
                            {questionsBySection[section].map((question, index) => (
                              <Accordion
                                key={question.id}
                                defaultExpanded={sectionIndex === 0 && index === 0}
                                sx={{ mb: 2 }}
                              >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Chip
                                      label={`Q${question.question_number}`}
                                      color="primary"
                                      size="small"
                                    />
                                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 'medium' }}>
                                      {question.question_text_clean
                                        ? (question.question_text_clean.length > 100
                                          ? question.question_text_clean.substring(0, 100) + '...'
                                          : question.question_text_clean)
                                        : (question.question_text.length > 100
                                          ? question.question_text.substring(0, 100) + '...'
                                          : question.question_text)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                      {question.question_type && (
                                        <Chip
                                          label={question.question_type.replace('_', ' ')}
                                          size="small"
                                          variant="outlined"
                                        />
                                      )}
                                      <Typography variant="caption" color="text.secondary">
                                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                                      </Typography>
                                      {question.correct_answer && (
                                        <Chip
                                          icon={<CheckCircleIcon />}
                                          label={`Answer: ${question.correct_answer}`}
                                          color="success"
                                          size="small"
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Card variant="outlined">
                                    <CardContent>
                                      {/* Question Text */}
                                      <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                          Question {question.question_number}:
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                          whiteSpace: 'pre-wrap',
                                          wordBreak: 'break-word',
                                          lineHeight: 1.6
                                        }}>
                                          {question.question_text_clean || question.question_text}
                                        </Typography>
                                      </Box>

                                      {/* Images/Charts associated with question */}
                                      {question.media && question.media.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                                            Images/Charts:
                                          </Typography>
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {question.media.map((media, idx) => (
                                              <Box
                                                key={media.id || idx}
                                                sx={{
                                                  border: '1px solid',
                                                  borderColor: 'divider',
                                                  borderRadius: 2,
                                                  p: 1,
                                                  bgcolor: 'grey.50'
                                                }}
                                              >
                                                <img
                                                  src={`${process.env.REACT_APP_API_URL || ''}/storage/${media.file_path}`}
                                                  alt={media.description || `Question ${question.question_number} ${(media.media_type === 'chart' ? 'Chart' : 'Image')} ${idx + 1}`}
                                                  style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                    display: 'block'
                                                  }}
                                                  onError={(e) => {
                                                    e.target.style.display = 'none';
                                                  }}
                                                />
                                                {media.description && (
                                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    {media.description}
                                                  </Typography>
                                                )}
                                              </Box>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}

                                      {/* Multiple Choice Options */}
                                      {question.options && Object.keys(question.options).length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                                            Options:
                                          </Typography>
                                          <List dense>
                                            {Object.entries(question.options).map(([key, value]) => (
                                              <ListItem
                                                key={key}
                                                sx={{
                                                  py: 0.5,
                                                  bgcolor: question.correct_answer === key ? 'success.light' : 'transparent',
                                                  borderRadius: 1,
                                                  mb: 0.5
                                                }}
                                              >
                                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      fontWeight: question.correct_answer === key ? 'bold' : 'normal',
                                                      color: question.correct_answer === key ? 'success.dark' : 'text.primary',
                                                      flex: 1
                                                    }}
                                                  >
                                                    <strong>{key}.</strong> {value}
                                                  </Typography>
                                                  {question.correct_answer === key && (
                                                    <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                                                  )}
                                                </Box>
                                              </ListItem>
                                            ))}
                                          </List>
                                        </Box>
                                      )}

                                      {/* Correct Answer - Editable */}
                                      <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                            Correct Answer:
                                          </Typography>
                                          {editingQuestionId === question.id ? (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="success"
                                              onClick={async () => {
                                                try {
                                                  const response = await api.put(`/admin/paper-extracts/questions/${question.id}`, {
                                                    correct_answer: questionEditData[question.id]?.correct_answer || question.correct_answer || '',
                                                    answer_explanation: questionEditData[question.id]?.answer_explanation || question.answer_explanation || '',
                                                  });
                                                  if (response.data && response.data.success) {
                                                    toast.success('Question updated successfully');
                                                    // Update local state
                                                    const updatedQuestions = (selectedExtract.extractQuestions || selectedExtract.questions || []).map(q =>
                                                      q.id === question.id
                                                        ? { ...q, ...response.data.data }
                                                        : q
                                                    );
                                                    setSelectedExtract({
                                                      ...selectedExtract,
                                                      extractQuestions: updatedQuestions,
                                                      questions: updatedQuestions,
                                                    });
                                                    setEditingQuestionId(null);
                                                    setQuestionEditData({});
                                                  }
                                                } catch (error) {
                                                  console.error('Error updating question:', error);
                                                  toast.error('Failed to update question');
                                                }
                                              }}
                                            >
                                              Save
                                            </Button>
                                          ) : (
                                            <Button
                                              size="small"
                                              startIcon={<EditIcon />}
                                              onClick={() => {
                                                setEditingQuestionId(question.id);
                                                setQuestionEditData({
                                                  ...questionEditData,
                                                  [question.id]: {
                                                    correct_answer: question.correct_answer || '',
                                                    answer_explanation: question.answer_explanation || '',
                                                  },
                                                });
                                              }}
                                            >
                                              Edit
                                            </Button>
                                          )}
                                        </Box>
                                        {editingQuestionId === question.id ? (
                                          <Box>
                                            {question.options && Object.keys(question.options).length > 0 ? (
                                              <FormControl fullWidth sx={{ mb: 2 }}>
                                                <InputLabel>Select Correct Answer</InputLabel>
                                                <Select
                                                  value={questionEditData[question.id]?.correct_answer || question.correct_answer || ''}
                                                  label="Select Correct Answer"
                                                  onChange={(e) => {
                                                    setQuestionEditData({
                                                      ...questionEditData,
                                                      [question.id]: {
                                                        ...questionEditData[question.id],
                                                        correct_answer: e.target.value,
                                                      },
                                                    });
                                                  }}
                                                >
                                                  {Object.entries(question.options).map(([key, value]) => (
                                                    <MenuItem key={key} value={key}>
                                                      {key}: {value}
                                                    </MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            ) : (
                                              <TextField
                                                fullWidth
                                                label="Correct Answer"
                                                value={questionEditData[question.id]?.correct_answer || question.correct_answer || ''}
                                                onChange={(e) => {
                                                  setQuestionEditData({
                                                    ...questionEditData,
                                                    [question.id]: {
                                                      ...questionEditData[question.id],
                                                      correct_answer: e.target.value,
                                                    },
                                                  });
                                                }}
                                                sx={{ mb: 2 }}
                                              />
                                            )}
                                            <TextField
                                              fullWidth
                                              label="Answer Explanation"
                                              multiline
                                              rows={4}
                                              value={questionEditData[question.id]?.answer_explanation || question.answer_explanation || ''}
                                              onChange={(e) => {
                                                setQuestionEditData({
                                                  ...questionEditData,
                                                  [question.id]: {
                                                    ...questionEditData[question.id],
                                                    answer_explanation: e.target.value,
                                                  },
                                                });
                                              }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                              <Button
                                                size="small"
                                                onClick={() => {
                                                  setEditingQuestionId(null);
                                                  setQuestionEditData({});
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            </Box>
                                          </Box>
                                        ) : (
                                          <>
                                            {question.correct_answer ? (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                  label={question.correct_answer}
                                                  color="success"
                                                  size="medium"
                                                  sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                                />
                                                {question.options && question.options[question.correct_answer] && (
                                                  <Typography variant="body2" color="text.secondary">
                                                    - {question.options[question.correct_answer]}
                                                  </Typography>
                                                )}
                                              </Box>
                                            ) : (
                                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                No answer set
                                              </Typography>
                                            )}
                                            {question.answer_explanation && (
                                              <MuiPaper
                                                variant="outlined"
                                                sx={{
                                                  p: 2,
                                                  mt: 2,
                                                  bgcolor: 'grey.50',
                                                  whiteSpace: 'pre-wrap',
                                                  wordBreak: 'break-word',
                                                  borderLeft: '4px solid',
                                                  borderColor: 'primary.main'
                                                }}
                                              >
                                                <Typography variant="body2">
                                                  {question.answer_explanation}
                                                </Typography>
                                              </MuiPaper>
                                            )}
                                          </>
                                        )}
                                      </Box>

                                      {/* Metadata */}
                                      <Divider sx={{ my: 2 }} />
                                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                        {question.page_number && (
                                          <Typography variant="caption" color="text.secondary">
                                            Page: {question.page_number}
                                          </Typography>
                                        )}
                                        {question.topic && (
                                          <Chip
                                            label={`Topic: ${question.topic}`}
                                            size="small"
                                            variant="outlined"
                                            color="info"
                                          />
                                        )}
                                        {question.subtopic && (
                                          <Chip
                                            label={`Subtopic: ${question.subtopic}`}
                                            size="small"
                                            variant="outlined"
                                            color="info"
                                          />
                                        )}
                                        {question.keywords && question.keywords.length > 0 && (
                                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">Keywords:</Typography>
                                            {question.keywords.slice(0, 5).map((keyword, idx) => (
                                              <Chip
                                                key={idx}
                                                label={keyword}
                                                size="small"
                                                variant="outlined"
                                              />
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </Box>
                        ));
                      })()}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No questions extracted yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedExtract.extraction_status === 'processing'
                          ? 'Questions are being extracted. Please refresh in a moment.'
                          : selectedExtract.extraction_status === 'failed'
                            ? 'Extraction failed. Please check the error message.'
                            : 'Questions will appear here once extraction is complete.'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={openEditPriceDialog} onClose={() => setOpenEditPriceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Price</DialogTitle>
        <DialogContent>
          {editingPriceExtract && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Paper: {editingPriceExtract.name || editingPriceExtract.title || 'Untitled'}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    inputProps={{ step: "0.01", min: "0" }}
                    value={priceEditData.price}
                    onChange={(e) => setPriceEditData({ ...priceEditData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={priceEditData.currency}
                      label="Currency"
                      onChange={(e) => setPriceEditData({ ...priceEditData, currency: e.target.value })}
                    >
                      <MenuItem value="€">€ (Euro)</MenuItem>
                      <MenuItem value="£">£ (Pound)</MenuItem>
                      <MenuItem value="$">$ (Dollar)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditPriceDialog(false);
            setEditingPriceExtract(null);
            setPriceEditData({ price: '', currency: '€' });
          }}>
            Cancel
          </Button>
          <Button onClick={handleSavePrice} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

