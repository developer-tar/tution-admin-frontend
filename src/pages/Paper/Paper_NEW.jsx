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
  Skeleton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  FormHelperText,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Euro as EuroIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  PictureAsPdf as PdfIcon,
  AttachFile as AttachFileIcon,
  GetApp as DownloadIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../api';

// Validation schema - Updated for PDF-based papers (questions removed)
const paperSchema = yup.object().shape({
  name: yup.string()
    .required('Paper name is required')
    .max(255, 'Name must not exceed 255 characters'),
  description: yup.string()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    }),
  category_id: yup.number()
    .required('Category is required')
    .integer('Category must be an integer')
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .typeError('Category must be selected'),
  format: yup.number()
    .required('Format is required')
    .integer('Format must be an integer')
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    })
    .typeError('Format must be selected'),
  price: yup.number()
    .required('Price is required')
    .min(0, 'Price must be at least 0')
    .typeError('Price must be a number'),
  currency: yup.string()
    .nullable()
    .length(1, 'Currency must be exactly 1 character')
    .oneOf(['€', '$', '£'], 'Currency must be one of: €, $, £')
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    }),
  duration_minutes: yup.number()
    .nullable()
    .integer('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute')
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .typeError('Duration must be a number'),
  school_id: yup.number()
    .nullable()
    .integer('School ID must be an integer')
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .typeError('School ID must be a number'),
  paper_image: yup.mixed()
    .nullable()
    .test('fileSize', 'Paper image size must not exceed 10MB', (value) => {
      if (!value) return true;
      return value.size <= 10 * 1024 * 1024;
    })
    .test('fileType', 'The uploaded file must be an image', (value) => {
      if (!value) return true;
      return value.type.startsWith('image/');
    })
});

const gradientButtonStyle = {
  background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
  color: '#fff',
  fontWeight: 600,
  paddingX: 2,
  paddingY: 1,
  borderRadius: 2,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
    opacity: 0.9,
  }
};

const Paper = () => {
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formats, setFormats] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    category_id: '',
    format: ''
  });
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingPaper, setViewingPaper] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, paper: null });
  const [deletingPaperId, setDeletingPaperId] = useState(null);
  const [togglingPaperId, setTogglingPaperId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  
  // PDF files state - NEW for multiple PDF uploads (max 10 files)
  const [pdfFiles, setPdfFiles] = useState([]);
  const [existingPdfs, setExistingPdfs] = useState([]); // For edit mode

  // Form handling
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(paperSchema),
    defaultValues: {
      name: '',
      description: null,
      category_id: '',
      format: '',
      price: '',
      currency: '€',
      duration_minutes: null,
      school_id: null,
      paper_image: null
    }
  });

  // PDF file upload handler - NEW (max 10 files, 10MB each)
  const handlePdfFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (consider existing PDFs in edit mode)
    const totalCount = files.length + existingPdfs.length;
    if (totalCount > 10) {
      toast.error(`Maximum 10 PDF files allowed per paper (you already have ${existingPdfs.length} PDF(s))`);
      e.target.value = '';
      return;
    }
    
    // Validate each file
    const errors = [];
    files.forEach((file, index) => {
      if (file.type !== 'application/pdf') {
        errors.push(`File ${index + 1} (${file.name}) must be a PDF`);
      }
      if (file.size > 10485760) { // 10MB
        errors.push(`File ${index + 1} (${file.name}) exceeds 10MB`);
      }
    });
    
    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      e.target.value = '';
      return;
    }
    
    setPdfFiles(files);
    toast.success(`${files.length} PDF file(s) selected`);
  };
  
  // Remove PDF file from selection
  const handleRemovePdf = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch papers
  const fetchPapers = async (applyFilters = false) => {
    setLoading(true);
    try {
      let url = 'admin/paper';
      const params = new URLSearchParams();
      
      if (applyFilters) {
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.format) params.append('format', filters.format);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await api.get(url);
      const papersData = response.data.data.data || [];
      setPapers(papersData);
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories, formats, schools
  const fetchCategories = async () => {
    try {
      const response = await api.get('admin/paper/category-tree');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFormats = async () => {
    try {
      const response = await api.get('admin/formats');
      setFormats(response.data.data || []);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await api.get('admin/schools');
      setSchools(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  useEffect(() => {
    fetchPapers();
    fetchCategories();
    fetchFormats();
    fetchSchools();
  }, []);

  // Submit handler - Updated for PDF uploads
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    console.log('=== SUBMIT PAPER ===');
    console.log('Mode:', editingPaper ? 'EDIT' : 'CREATE');
    console.log('Form data:', data);
    console.log('PDF files:', pdfFiles.length);
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('category_id', Number(data.category_id));
      formData.append('format_id', Number(data.format));
      formData.append('price', data.price);
      if (data.currency) formData.append('currency', data.currency);
      if (data.duration_minutes) formData.append('duration_minutes', data.duration_minutes);
      if (data.school_id) formData.append('school_id', data.school_id);
      
      // Image file
      if (data.paper_image && data.paper_image instanceof File) {
        formData.append('paper_image', data.paper_image);
      }
      
      // PDF files - NEW (max 10)
      if (pdfFiles && pdfFiles.length > 0) {
        pdfFiles.forEach((file) => {
          formData.append('paper_pdfs[]', file);
        });
        console.log(`✅ Added ${pdfFiles.length} PDF file(s) to FormData`);
      }
      
      // Log FormData
      console.log('=== FormData Contents ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      if (editingPaper) {
        // Edit mode
        formData.append('_method', 'PUT');
        const response = await api.post(`admin/paper/${editingPaper.id}`, formData);
        toast.success(response.data.message || 'Paper updated successfully');
      } else {
        // Create mode
        const response = await api.post('admin/paper', formData);
        toast.success(response.data.message || 'Paper created successfully');
      }
      
      // Reset form
      reset();
      setPdfFiles([]);
      setExistingPdfs([]);
      setExistingImageUrl(null);
      setEditingPaper(null);
      setTabValue(0);
      fetchPapers();
      
    } catch (error) {
      console.error('Error submitting paper:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit paper';
      toast.error(errorMsg);
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach(key => {
          toast.error(`${key}: ${validationErrors[key].join(', ')}`);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // View paper details
  const handleView = async (paper) => {
    try {
      const response = await api.get(`admin/paper/${paper.id}`);
      setViewingPaper(response.data.data);
      setViewDialog(true);
    } catch (error) {
      console.error('Error fetching paper details:', error);
      toast.error('Failed to load paper details');
    }
  };

  // Edit paper
  const handleEdit = async (paper) => {
    try {
      const response = await api.get(`admin/paper/${paper.id}`);
      const paperData = response.data.data;
      
      reset({
        name: paperData.name || '',
        description: paperData.description || null,
        category_id: paperData.category_id || '',
        format: paperData.format_id || '',
        price: paperData.price || '',
        currency: paperData.currency || '€',
        duration_minutes: paperData.duration_minutes || null,
        school_id: paperData.school_id || null,
        paper_image: null
      });
      
      setEditingPaper(paperData);
      setExistingImageUrl(paperData.image);
      setExistingPdfs(paperData.pdfs || []);
      setPdfFiles([]);
      setTabValue(1);
      
      toast.info('Edit mode: Update any fields you want to change');
    } catch (error) {
      console.error('Error loading paper for edit:', error);
      toast.error('Failed to load paper data');
    }
  };

  // Delete paper
  const handleDelete = (paper) => {
    setDeleteDialog({ open: true, paper });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.paper) return;
    
    setDeletingPaperId(deleteDialog.paper.id);
    try {
      await api.delete(`admin/paper/${deleteDialog.paper.id}`);
      toast.success('Paper deleted successfully');
      fetchPapers();
      setDeleteDialog({ open: false, paper: null });
    } catch (error) {
      console.error('Error deleting paper:', error);
      toast.error(error.response?.data?.message || 'Failed to delete paper');
    } finally {
      setDeletingPaperId(null);
    }
  };

  // Toggle status
  const handleToggleStatus = async (paper) => {
    setTogglingPaperId(paper.id);
    try {
      const action = paper.status === 2 ? 'deactivate' : 'activate';
      await api.patch(`admin/paper/${paper.id}/toggle-status`, { action });
      toast.success(`Paper ${action}d successfully`);
      fetchPapers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    } finally {
      setTogglingPaperId(null);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    reset();
    setPdfFiles([]);
    setExistingPdfs([]);
    setExistingImageUrl(null);
    setEditingPaper(null);
    setTabValue(0);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 4 
      }}>
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '25px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
            width: 'fit-content'
          }}>
            <DescriptionIcon sx={{ fontSize: 28, color: 'white' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
              Papers
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '14px', maxWidth: 400 }}>
            Create and manage PDF-based papers for students
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ 
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Papers" />
          <Tab label={editingPaper ? "Edit Paper" : "Create Paper"} />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <MuiPaper sx={{ p: 3, borderRadius: 3 }}>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category_id}
                  onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={filters.format}
                  onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                  label="Format"
                >
                  <MenuItem value="">All Formats</MenuItem>
                  {formats.map(fmt => (
                    <MenuItem key={fmt.id} value={fmt.id}>{fmt.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => fetchPapers(true)}
                startIcon={<FilterListIcon />}
                sx={{ ...gradientButtonStyle, height: '56px' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>

          {/* Papers Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Format</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>PDFs</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : papers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>No papers found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  papers.map(paper => (
                    <TableRow key={paper.id}>
                      <TableCell>{paper.name}</TableCell>
                      <TableCell>{paper.category}</TableCell>
                      <TableCell>{paper.format}</TableCell>
                      <TableCell>{paper.currency}{paper.price}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={<PdfIcon />} 
                          label={paper.pdfs_count || 0} 
                          size="small" 
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={paper.status === 2 ? 'Active' : 'Inactive'} 
                          color={paper.status === 2 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton onClick={() => handleView(paper)} size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(paper)} size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={paper.status === 2 ? "Deactivate" : "Activate"}>
                          <IconButton 
                            onClick={() => handleToggleStatus(paper)} 
                            size="small"
                            disabled={togglingPaperId === paper.id}
                          >
                            {togglingPaperId === paper.id ? (
                              <CircularProgress size={20} />
                            ) : paper.status === 2 ? (
                              <ToggleOnIcon color="success" />
                            ) : (
                              <ToggleOffIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(paper)} size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MuiPaper>
      )}

      {tabValue === 1 && (
        <MuiPaper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {editingPaper ? 'Edit Paper' : 'Create New Paper'}
          </Typography>

          {editingPaper && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Editing: <strong>{editingPaper.name}</strong>. Update any fields you want to change.
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Name */}
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Paper Name *"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.category_id}>
                  <InputLabel>Category *</InputLabel>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Category *">
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.category_id && (
                    <FormHelperText>{errors.category_id.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Format */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.format}>
                  <InputLabel>Format *</InputLabel>
                  <Controller
                    name="format"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Format *">
                        <MenuItem value="">Select Format</MenuItem>
                        {formats.map(fmt => (
                          <MenuItem key={fmt.id} value={fmt.id}>{fmt.name}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.format && (
                    <FormHelperText>{errors.format.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Price */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price *"
                      type="number"
                      fullWidth
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><EuroIcon /></InputAdornment>
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Currency */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.currency}>
                  <InputLabel>Currency</InputLabel>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Currency">
                        <MenuItem value="€">€ Euro</MenuItem>
                        <MenuItem value="$">$ Dollar</MenuItem>
                        <MenuItem value="£">£ Pound</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.currency && (
                    <FormHelperText>{errors.currency.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Duration */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="duration_minutes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Duration (minutes)"
                      type="number"
                      fullWidth
                      error={!!errors.duration_minutes}
                      helperText={errors.duration_minutes?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><TimeIcon /></InputAdornment>
                      }}
                    />
                  )}
                />
              </Grid>

              {/* School */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.school_id}>
                  <InputLabel>School</InputLabel>
                  <Controller
                    name="school_id"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="School">
                        <MenuItem value="">None</MenuItem>
                        {schools.map(school => (
                          <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.school_id && (
                    <FormHelperText>{errors.school_id.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Paper Image */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Paper Thumbnail Image</Typography>
                <Controller
                  name="paper_image"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 1 }}
                      >
                        Upload Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            onChange(file);
                            if (file) toast.success(`Image selected: ${file.name}`);
                          }}
                          {...field}
                        />
                      </Button>
                      {value && <Typography variant="caption" display="block">{value.name}</Typography>}
                      {existingImageUrl && !value && (
                        <Box sx={{ mt: 1 }}>
                          <img src={existingImageUrl} alt="Current" style={{ maxHeight: 100 }} />
                        </Box>
                      )}
                      {errors.paper_image && (
                        <Typography color="error" variant="caption">{errors.paper_image.message}</Typography>
                      )}
                    </>
                  )}
                />
              </Grid>

              {/* PDF Files Upload - NEW */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: '#f8f9fa', border: '2px dashed #dee2e6' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon color="primary" />
                    PDF Files (Max 10 files, 10MB each)
                  </Typography>
                  
                  {existingPdfs.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Existing PDFs ({existingPdfs.length})
                      </Typography>
                      <List dense>
                        {existingPdfs.map((pdf, index) => (
                          <ListItem key={pdf.id}>
                            <ListItemIcon>
                              <PdfIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={pdf.original_name || pdf.file_name}
                              secondary={pdf.size_human || 'Unknown size'}
                            />
                            <IconButton
                              size="small"
                              href={pdf.download_url || pdf.url}
                              target="_blank"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ mb: 2 }}
                  >
                    {editingPaper ? 'Add More PDFs' : 'Upload PDFs'}
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileChange}
                    />
                  </Button>
                  
                  {pdfFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                        Selected PDFs ({pdfFiles.length})
                      </Typography>
                      <List dense>
                        {pdfFiles.map((file, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <IconButton edge="end" onClick={() => handleRemovePdf(index)}>
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <PdfIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={file.name}
                              secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    • Maximum 10 PDF files per paper<br />
                    • Each PDF must be ≤ 10MB<br />
                    • PDF format only (.pdf)
                  </Alert>
                </Card>
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
                    sx={gradientButtonStyle}
                  >
                    {isSubmitting ? 'Saving...' : (editingPaper ? 'Update Paper' : 'Create Paper')}
                  </Button>
                  {editingPaper && (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      startIcon={<CloseIcon />}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </MuiPaper>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Paper Details</Typography>
            <IconButton onClick={() => setViewDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingPaper && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{viewingPaper.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {viewingPaper.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography>{viewingPaper.category_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Format</Typography>
                  <Typography>{viewingPaper.format}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Price</Typography>
                  <Typography>{viewingPaper.currency}{viewingPaper.price}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography>{viewingPaper.duration_minutes} minutes</Typography>
                </Grid>
              </Grid>

              {viewingPaper.pdfs && viewingPaper.pdfs.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    PDF Files ({viewingPaper.pdfs.length})
                  </Typography>
                  <List>
                    {viewingPaper.pdfs.map((pdf) => (
                      <ListItem key={pdf.id}>
                        <ListItemIcon>
                          <PdfIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={pdf.original_name || pdf.file_name}
                          secondary={pdf.size_human}
                        />
                        <IconButton
                          href={pdf.download_url || pdf.url}
                          target="_blank"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, paper: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white' }}>
          Delete Paper
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>Are you sure you want to delete this paper?</Typography>
          {deleteDialog.paper && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>{deleteDialog.paper.name}</Typography>
            </Box>
          )}
          <Typography color="error" sx={{ mt: 2 }}>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, paper: null })}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deletingPaperId !== null}
            startIcon={deletingPaperId !== null ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deletingPaperId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Paper;



