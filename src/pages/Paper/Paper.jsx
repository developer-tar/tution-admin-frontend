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
  Alert,
  Badge,
  Zoom,
  Fade,
  Slide,
  alpha,
  Avatar,
  Divider
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
  Search as SearchIcon,
  Category as CategoryIcon,
  SaveAlt as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  RemoveRedEye as PreviewIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../api';

// Validation schema
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
  
  // PDF files state
  const [pdfFiles, setPdfFiles] = useState([]);
  const [existingPdfs, setExistingPdfs] = useState([]);
  const [deletedPdfIds, setDeletedPdfIds] = useState([]); // Track deleted PDF IDs
  const [removeImage, setRemoveImage] = useState(false); // Track if image should be removed
  
  // Preview states
  const [imagePreview, setImagePreview] = useState({ open: false, url: null });
  const [pdfPreview, setPdfPreview] = useState({ open: false, url: null, name: null });

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
      paper_image: null
    }
  });

  // PDF file upload handler
  const handlePdfFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const totalCount = files.length + existingPdfs.length;
    if (totalCount > 10) {
      toast.error(`Maximum 10 PDF files allowed per paper (you already have ${existingPdfs.length} PDF(s))`);
      e.target.value = '';
      return;
    }
    
    const errors = [];
    files.forEach((file, index) => {
      if (file.type !== 'application/pdf') {
        errors.push(`File ${index + 1} (${file.name}) must be a PDF`);
      }
      if (file.size > 10485760) {
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
  
  const handleRemovePdf = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Preview image
  const handleImagePreview = (file) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setImagePreview({ open: true, url });
    } else if (typeof file === 'string') {
      setImagePreview({ open: true, url: file });
    }
  };

  // Preview PDF
  const handlePdfPreview = (file, name) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPdfPreview({ open: true, url, name: file.name });
    } else if (typeof file === 'string') {
      setPdfPreview({ open: true, url: file, name });
    }
  };

  // Close previews and cleanup URLs
  const handleCloseImagePreview = () => {
    if (imagePreview.url && imagePreview.url.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview.url);
    }
    setImagePreview({ open: false, url: null });
  };

  const handleClosePdfPreview = () => {
    if (pdfPreview.url && pdfPreview.url.startsWith('blob:')) {
      URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ open: false, url: null, name: null });
  };

  // Fetch functions
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
      const response = await api.get('common/data?param=Formats');
      setFormats(response.data.data || []);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await api.get('admin/master-form/schools?per_page=1000');
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

  // Submit handler
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    console.log('=== SUBMIT PAPER ===');
    console.log('Mode:', editingPaper ? 'EDIT' : 'CREATE');
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('category_id', Number(data.category_id));
      formData.append('format_id', Number(data.format));
      formData.append('price', data.price);
      if (data.currency) formData.append('currency', data.currency);
      
      // Handle image - either new file or removal flag
      if (data.paper_image && data.paper_image instanceof File) {
        formData.append('paper_image', data.paper_image);
      } else if (removeImage && editingPaper) {
        // Send empty string or null to indicate image removal
        formData.append('paper_image', '');
      }
      
      // Add new PDF files
      if (pdfFiles && pdfFiles.length > 0) {
        pdfFiles.forEach((file) => {
          formData.append('paper_pdfs[]', file);
        });
      }
      
      // Add deleted PDF IDs (for existing PDFs that were removed)
      if (editingPaper && deletedPdfIds.length > 0) {
        deletedPdfIds.forEach((pdfId) => {
          formData.append('deleted_pdf_ids[]', pdfId);
        });
        console.log('🗑️ Deleted PDF IDs:', deletedPdfIds);
      }
      
      // Log removal flags
      if (removeImage) {
        console.log('🗑️ Image removal flag set');
      }
      
      if (editingPaper) {
        formData.append('_method', 'PUT');
        const response = await api.post(`admin/paper/${editingPaper.id}`, formData);
        toast.success(response.data.message || 'Paper updated successfully');
      } else {
        const response = await api.post('admin/paper', formData);
        toast.success(response.data.message || 'Paper created successfully');
      }
      
      reset();
      setPdfFiles([]);
      setExistingPdfs([]);
      setExistingImageUrl(null);
      setDeletedPdfIds([]);
      setRemoveImage(false);
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
        paper_image: null
      });
      
      setEditingPaper(paperData);
      setExistingImageUrl(paperData.image);
      setExistingPdfs(paperData.pdfs || []);
      setPdfFiles([]);
      setDeletedPdfIds([]);
      setRemoveImage(false);
      setTabValue(1);
      
      toast.info('Edit mode: Update any fields you want to change');
    } catch (error) {
      console.error('Error loading paper for edit:', error);
      toast.error('Failed to load paper data');
    }
  };

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 4,
      pb: 8
    }}>
      {/* Animated Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            animation: 'slideInDown 0.6s ease-out'
          }}>
            <Avatar sx={{ 
              width: 70, 
              height: 70, 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              boxShadow: '0 8px 32px rgba(245, 87, 108, 0.4)'
            }}>
              <DescriptionIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                color: 'white',
                textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '-0.5px'
              }}>
                Papers Management
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '16px',
                fontWeight: 500
              }}>
                Create and manage PDF-based learning materials
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Enhanced Tabs Card */}
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
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 70,
                px: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: alpha('#667eea', 0.08)
                }
              },
              '& .Mui-selected': {
                color: '#667eea !important',
                background: alpha('#667eea', 0.1)
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab 
              icon={<DescriptionIcon />} 
              iconPosition="start" 
              label="All Papers" 
            />
            <Tab 
              icon={editingPaper ? <EditIcon /> : <AddIcon />} 
              iconPosition="start" 
              label={editingPaper ? "Edit Paper" : "Create Paper"} 
            />
          </Tabs>
        </Card>
      </Zoom>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Fade in timeout={600}>
          <MuiPaper sx={{ 
            p: 4, 
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)'
          }}>
            {/* Fancy Filters */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#667eea'
              }}>
                <FilterListIcon />
                Filter Papers
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category_id}
                      onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                      label="Category"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea'
                        }
                      }}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon fontSize="small" color="primary" />
                            {cat.name}
                          </Box>
                        </MenuItem>
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
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
                        }
                      }}
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
                    startIcon={<SearchIcon />}
                    sx={{ 
                      height: '56px',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '16px',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      }
                    }}
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Fancy Table */}
            <TableContainer sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Image</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Format</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>PDFs</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}><Skeleton height={60} /></TableCell>
                      </TableRow>
                    ))
                  ) : papers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          color: 'text.secondary'
                        }}>
                          <DescriptionIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                          <Typography variant="h6" fontWeight={600}>No papers found</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Create your first paper to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    papers.map((paper, index) => (
                      <Zoom in key={paper.id} timeout={300 + index * 50}>
                        <TableRow sx={{ 
                          '&:hover': {
                            background: alpha('#667eea', 0.05),
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease'
                          }
                        }}>
                          <TableCell>
                            {paper.image ? (
                              <Tooltip title="Click to preview" arrow>
                                <Box 
                                  onClick={() => handleImagePreview(paper.image)}
                                  sx={{ 
                                    cursor: 'pointer',
                                    position: 'relative',
                                    width: 60,
                                    height: 60,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
                                    }
                                  }}
                                >
                                  <img 
                                    src={paper.image} 
                                    alt={paper.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </Box>
                              </Tooltip>
                            ) : (
                              <Avatar sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                width: 60,
                                height: 60
                              }}>
                                <DescriptionIcon />
                              </Avatar>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>{paper.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={<CategoryIcon />}
                              label={paper.category} 
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                background: alpha('#667eea', 0.1),
                                color: '#667eea',
                                border: '1px solid',
                                borderColor: alpha('#667eea', 0.3)
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={500}>{paper.format}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              background: alpha('#4caf50', 0.1),
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: alpha('#4caf50', 0.3)
                            }}>
                              <Typography fontWeight={700} color="#4caf50">
                                {paper.currency || '€'}{paper.price}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              badgeContent={paper.pdfs_count || 0} 
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  fontWeight: 700
                                }
                              }}
                            >
                              <Chip 
                                icon={<PdfIcon />} 
                                label="PDFs" 
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  background: alpha('#f44336', 0.1),
                                  color: '#f44336'
                                }}
                              />
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={paper.status === 2 ? <CheckIcon /> : <InfoIcon />}
                              label={paper.status === 2 ? 'Active' : 'Inactive'} 
                              size="small"
                              sx={{ 
                                fontWeight: 700,
                                ...(paper.status === 2 ? {
                                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                                  color: 'white',
                                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                                } : {
                                  background: alpha('#9e9e9e', 0.2),
                                  color: '#616161'
                                })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details" arrow TransitionComponent={Zoom}>
                                <IconButton 
                                  onClick={() => handleView(paper)} 
                                  size="small"
                                  sx={{ 
                                    background: alpha('#2196f3', 0.1),
                                    '&:hover': {
                                      background: alpha('#2196f3', 0.2),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <ViewIcon sx={{ color: '#2196f3' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit" arrow TransitionComponent={Zoom}>
                                <IconButton 
                                  onClick={() => handleEdit(paper)} 
                                  size="small"
                                  sx={{ 
                                    background: alpha('#ff9800', 0.1),
                                    '&:hover': {
                                      background: alpha('#ff9800', 0.2),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <EditIcon sx={{ color: '#ff9800' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={paper.status === 2 ? "Deactivate" : "Activate"} arrow>
                                <IconButton 
                                  onClick={() => handleToggleStatus(paper)} 
                                  size="small"
                                  disabled={togglingPaperId === paper.id}
                                  sx={{ 
                                    background: alpha(paper.status === 2 ? '#4caf50' : '#9e9e9e', 0.1),
                                    '&:hover': {
                                      background: alpha(paper.status === 2 ? '#4caf50' : '#9e9e9e', 0.2),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  {togglingPaperId === paper.id ? (
                                    <CircularProgress size={20} />
                                  ) : paper.status === 2 ? (
                                    <ToggleOnIcon sx={{ color: '#4caf50' }} />
                                  ) : (
                                    <ToggleOffIcon sx={{ color: '#9e9e9e' }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" arrow TransitionComponent={Zoom}>
                                <IconButton 
                                  onClick={() => handleDelete(paper)} 
                                  size="small"
                                  sx={{ 
                                    background: alpha('#f44336', 0.1),
                                    '&:hover': {
                                      background: alpha('#f44336', 0.2),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <DeleteIcon sx={{ color: '#f44336' }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Zoom>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </MuiPaper>
        </Fade>
      )}

      {tabValue === 1 && (
        <Slide direction="left" in timeout={500}>
          <MuiPaper sx={{ 
            p: 5, 
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 4,
              pb: 3,
              borderBottom: '3px solid',
              borderImage: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1'
            }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
              }}>
                {editingPaper ? <EditIcon sx={{ fontSize: 30 }} /> : <AddIcon sx={{ fontSize: 30 }} />}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                  {editingPaper ? 'Edit Paper' : 'Create New Paper'}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {editingPaper ? 'Update paper details and PDFs' : 'Fill in the details to create a new paper'}
                </Typography>
              </Box>
            </Box>

            {editingPaper && (
              <Alert 
                icon={<InfoIcon />}
                severity="info" 
                sx={{ 
                  mb: 4,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: alpha('#2196f3', 0.3),
                  background: alpha('#2196f3', 0.05),
                  '& .MuiAlert-icon': {
                    color: '#2196f3'
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Editing: <strong style={{ color: '#667eea' }}>{editingPaper.name}</strong>
                </Typography>
                <Typography variant="caption">
                  Update any fields you want to change. Leave others as is.
                </Typography>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                {/* Name */}
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Paper Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea'
                            }
                          }
                        }}
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Category & Format */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.category_id}>
                    <InputLabel>Category *</InputLabel>
                    <Controller
                      name="category_id"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          label="Category *"
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon color="primary" />
                            </InputAdornment>
                          }
                          sx={{
                            borderRadius: 2,
                            '& fieldset': {
                              borderWidth: 2
                            }
                          }}
                        >
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

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.format}>
                    <InputLabel>Format *</InputLabel>
                    <Controller
                      name="format"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          label="Format *"
                          sx={{
                            borderRadius: 2,
                            '& fieldset': {
                              borderWidth: 2
                            }
                          }}
                        >
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

                {/* Price & Currency */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Price"
                        type="number"
                        fullWidth
                        required
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EuroIcon sx={{ color: '#4caf50' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.currency}>
                    <InputLabel>Currency</InputLabel>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          label="Currency"
                          sx={{
                            borderRadius: 2,
                            '& fieldset': {
                              borderWidth: 2
                            }
                          }}
                        >
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

                {/* Paper Image */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    p: 3, 
                    background: alpha('#667eea', 0.05),
                    border: '2px dashed',
                    borderColor: alpha('#667eea', 0.3),
                    borderRadius: 3
                  }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#667eea', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CloudUploadIcon />
                      Paper Thumbnail Image
                    </Typography>
                    <Controller
                      name="paper_image"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <>
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                            sx={{ 
                              mb: 2,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 4,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                              }
                            }}
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
                          {value && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Alert severity="success" icon={<CheckIcon />} sx={{ flex: 1 }}>
                                {value.name}
                              </Alert>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Preview Image" arrow>
                                  <IconButton
                                    onClick={() => handleImagePreview(value)}
                                    sx={{
                                      background: alpha('#2196f3', 0.1),
                                      '&:hover': {
                                        background: alpha('#2196f3', 0.2)
                                      }
                                    }}
                                  >
                                    <PreviewIcon sx={{ color: '#2196f3' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove Image" arrow>
                                  <IconButton
                                    onClick={() => {
                                      onChange(null);
                                      toast.info('Image removed');
                                    }}
                                    sx={{
                                      background: alpha('#f44336', 0.1),
                                      '&:hover': {
                                        background: alpha('#f44336', 0.2)
                                      }
                                    }}
                                  >
                                    <DeleteIcon sx={{ color: '#f44336' }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          )}
                          {existingImageUrl && !value && (
                            <Box sx={{ mt: 2, width: '100%', overflow: 'hidden' }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 2,
                                p: 2,
                                background: alpha('#667eea', 0.03),
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: alpha('#667eea', 0.2),
                                flexWrap: 'wrap',
                                width: '100%',
                                maxWidth: '100%',
                                boxSizing: 'border-box'
                              }}>
                                <Box sx={{ 
                                  position: 'relative',
                                  flexShrink: 0
                                }}>
                                  <img 
                                    src={existingImageUrl} 
                                    alt="Current" 
                                    style={{ 
                                      width: 120,
                                      height: 120,
                                      objectFit: 'cover',
                                      borderRadius: 12,
                                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                                    }} 
                                  />
                                </Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: 1.5,
                                  flex: '1 1 auto',
                                  minWidth: 0,
                                  maxWidth: 'calc(100% - 140px)',
                                  overflow: 'hidden'
                                }}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Current Thumbnail
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Tooltip title="Preview Image" arrow>
                                      <IconButton
                                        onClick={() => handleImagePreview(existingImageUrl)}
                                        size="small"
                                        sx={{
                                          background: alpha('#2196f3', 0.1),
                                          '&:hover': {
                                            background: alpha('#2196f3', 0.2),
                                            transform: 'scale(1.1)'
                                          }
                                        }}
                                      >
                                        <PreviewIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Image" arrow>
                                      <IconButton
                                        onClick={() => {
                                          setExistingImageUrl(null);
                                          setRemoveImage(true);
                                          toast.info('Image will be removed on update');
                                        }}
                                        size="small"
                                        sx={{
                                          background: alpha('#f44336', 0.1),
                                          '&:hover': {
                                            background: alpha('#f44336', 0.2),
                                            transform: 'scale(1.1)'
                                          }
                                        }}
                                      >
                                        <DeleteIcon sx={{ color: '#f44336', fontSize: 20 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          )}
                          {errors.paper_image && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                              {errors.paper_image.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </Card>
                </Grid>

                {/* PDF Files Upload - Fancy Card */}
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
                      <Avatar sx={{ 
                        width: 60, 
                        height: 60, 
                        background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                        boxShadow: '0 8px 24px rgba(244, 67, 54, 0.4)'
                      }}>
                        <PdfIcon sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                          PDF Files Upload
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          Upload up to 10 PDF files (max 10MB each)
                        </Typography>
                      </Box>
                    </Box>
                    
                    {existingPdfs.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#f44336' }}>
                          📎 Existing PDFs ({existingPdfs.length})
                        </Typography>
                        <List sx={{ 
                          background: 'white', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          {existingPdfs.map((pdf, index) => (
                            <ListItem 
                              key={pdf.id}
                              sx={{
                                borderBottom: index < existingPdfs.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                                '&:hover': {
                                  background: alpha('#f44336', 0.05)
                                }
                              }}
                            >
                              <ListItemIcon>
                                <Avatar sx={{ 
                                  background: alpha('#f44336', 0.1),
                                  color: '#f44336'
                                }}>
                                  <PdfIcon />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography fontWeight={600}>
                                    {pdf.original_name || pdf.file_name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary">
                                    {pdf.size_human || 'Unknown size'}
                                  </Typography>
                                }
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Preview PDF" arrow>
                                  <IconButton
                                    onClick={() => handlePdfPreview(pdf.download_url || pdf.url, pdf.original_name || pdf.file_name)}
                                    sx={{
                                      background: alpha('#ff9800', 0.1),
                                      '&:hover': {
                                        background: alpha('#ff9800', 0.2)
                                      }
                                    }}
                                  >
                                    <PreviewIcon sx={{ color: '#ff9800' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download" arrow>
                                  <IconButton
                                    href={pdf.download_url || pdf.url}
                                    target="_blank"
                                    sx={{
                                      background: alpha('#2196f3', 0.1),
                                      '&:hover': {
                                        background: alpha('#2196f3', 0.2)
                                      }
                                    }}
                                  >
                                    <DownloadIcon sx={{ color: '#2196f3' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete PDF" arrow>
                                  <IconButton
                                    onClick={() => {
                                      const pdfToDelete = existingPdfs[index];
                                      // Track deleted PDF ID
                                      if (pdfToDelete && pdfToDelete.id) {
                                        setDeletedPdfIds(prev => [...prev, pdfToDelete.id]);
                                      }
                                      setExistingPdfs(prev => prev.filter((_, i) => i !== index));
                                      toast.info('PDF will be removed on update');
                                    }}
                                    sx={{
                                      background: alpha('#f44336', 0.1),
                                      '&:hover': {
                                        background: alpha('#f44336', 0.2)
                                      }
                                    }}
                                  >
                                    <DeleteIcon sx={{ color: '#f44336' }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<AttachFileIcon />}
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        boxShadow: '0 8px 24px rgba(244, 67, 54, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(244, 67, 54, 0.5)'
                        }
                      }}
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
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#4caf50', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon />
                          Selected PDFs ({pdfFiles.length})
                        </Typography>
                        <List sx={{ 
                          background: 'white', 
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: alpha('#4caf50', 0.3)
                        }}>
                          {pdfFiles.map((file, index) => (
                            <ListItem
                              key={index}
                              sx={{
                                borderBottom: index < pdfFiles.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider'
                              }}
                              secondaryAction={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Preview PDF" arrow>
                                    <IconButton 
                                      onClick={() => handlePdfPreview(file)}
                                      sx={{
                                        background: alpha('#ff9800', 0.1),
                                        '&:hover': {
                                          background: alpha('#ff9800', 0.2)
                                        }
                                      }}
                                    >
                                      <PreviewIcon sx={{ color: '#ff9800' }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remove" arrow>
                                    <IconButton 
                                      edge="end" 
                                      onClick={() => handleRemovePdf(index)}
                                      sx={{
                                        background: alpha('#f44336', 0.1),
                                        '&:hover': {
                                          background: alpha('#f44336', 0.2)
                                        }
                                      }}
                                    >
                                      <DeleteIcon sx={{ color: '#f44336' }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              }
                            >
                              <ListItemIcon>
                                <Avatar sx={{ 
                                  background: alpha('#4caf50', 0.1),
                                  color: '#4caf50'
                                }}>
                                  <PdfIcon />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography fontWeight={600}>
                                    {file.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    <Alert 
                      severity="info" 
                      icon={<InfoIcon />}
                      sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: alpha('#2196f3', 0.3),
                        background: alpha('#2196f3', 0.05),
                        '& .MuiAlert-icon': {
                          color: '#2196f3'
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        📋 Upload Requirements:
                      </Typography>
                      <Typography variant="caption" component="div">
                        ✓ Maximum 10 PDF files per paper<br />
                        ✓ Each PDF must be ≤ 10MB<br />
                        ✓ PDF format only (.pdf)
                      </Typography>
                    </Alert>
                  </Card>
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 3,
                    pt: 3,
                    borderTop: '2px solid',
                    borderColor: 'divider'
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{
                        flex: 1,
                        py: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '18px',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)'
                        },
                        '&:disabled': {
                          background: alpha('#667eea', 0.5)
                        }
                      }}
                    >
                      {isSubmitting ? 'Saving...' : (editingPaper ? 'Update Paper' : 'Create Paper')}
                    </Button>
                    {editingPaper && (
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        startIcon={<CancelIcon />}
                        sx={{
                          flex: 1,
                          py: 2,
                          borderRadius: 3,
                          borderWidth: 2,
                          borderColor: '#667eea',
                          color: '#667eea',
                          fontSize: '18px',
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#764ba2',
                            background: alpha('#667eea', 0.05),
                            transform: 'translateY(-3px)'
                          }
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </MuiPaper>
        </Slide>
      )}

      {/* Fancy View Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 50, 
              height: 50, 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <ViewIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Paper Details</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Complete information about this paper
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setViewDialog(false)}
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {viewingPaper && (
            <Box>
              <Box sx={{ 
                mb: 3, 
                pb: 3, 
                borderBottom: '2px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
                  {viewingPaper.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {viewingPaper.description || 'No description provided'}
                </Typography>
              </Box>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2, 
                    background: alpha('#667eea', 0.05),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#667eea', 0.2)
                  }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Category
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#667eea">
                      {viewingPaper.category_name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2, 
                    background: alpha('#764ba2', 0.05),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#764ba2', 0.2)
                  }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Format
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#764ba2">
                      {viewingPaper.format}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2, 
                    background: alpha('#4caf50', 0.05),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#4caf50', 0.2)
                  }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Price
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="#4caf50">
                      {viewingPaper.currency}{viewingPaper.price}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {viewingPaper.pdfs && viewingPaper.pdfs.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    fontWeight: 700,
                    color: '#f44336',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <PdfIcon />
                    PDF Files ({viewingPaper.pdfs.length})
                  </Typography>
                  <List sx={{ 
                    background: alpha('#f44336', 0.03),
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: alpha('#f44336', 0.2)
                  }}>
                    {viewingPaper.pdfs.map((pdf, index) => (
                      <ListItem 
                        key={pdf.id}
                        sx={{
                          borderBottom: index < viewingPaper.pdfs.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          '&:hover': {
                            background: alpha('#f44336', 0.05)
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                          }}>
                            <PdfIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography fontWeight={700}>
                              {pdf.original_name || pdf.file_name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>
                              {pdf.size_human}
                            </Typography>
                          }
                        />
                        <Tooltip title="Download PDF" arrow>
                          <IconButton
                            href={pdf.download_url || pdf.url}
                            target="_blank"
                            sx={{
                              background: alpha('#2196f3', 0.1),
                              '&:hover': {
                                background: alpha('#2196f3', 0.2),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DownloadIcon sx={{ color: '#2196f3' }} />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, background: alpha('#667eea', 0.03) }}>
          <Button 
            onClick={() => setViewDialog(false)}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 4
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fancy Delete Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, paper: null })} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 80px rgba(244, 67, 54, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', 
          color: 'white',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 50, 
              height: 50, 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <DeleteIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Delete Paper</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '16px' }}>
            Are you sure you want to delete this paper?
          </Typography>
          {deleteDialog.paper && (
            <Box sx={{ 
              p: 3, 
              background: alpha('#f44336', 0.05),
              borderRadius: 2,
              border: '2px solid',
              borderColor: alpha('#f44336', 0.2)
            }}>
              <Typography variant="subtitle1" fontWeight={700} color="#f44336" sx={{ mb: 1 }}>
                {deleteDialog.paper.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deleteDialog.paper.description?.substring(0, 100)}...
              </Typography>
            </Box>
          )}
          <Alert 
            severity="error" 
            icon={<DeleteIcon />}
            sx={{ 
              mt: 3,
              borderRadius: 2,
              border: '2px solid',
              borderColor: alpha('#f44336', 0.3)
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Warning: This action cannot be undone!
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, background: alpha('#f44336', 0.03) }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, paper: null })}
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 2,
              borderWidth: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deletingPaperId !== null}
            startIcon={deletingPaperId !== null ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{
              flex: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(244, 67, 54, 0.4)',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(244, 67, 54, 0.5)'
              }
            }}
          >
            {deletingPaperId !== null ? 'Deleting...' : 'Delete Paper'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onClose={handleCloseImagePreview}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 40, 
              height: 40, 
              background: 'rgba(255,255,255,0.2)'
            }}>
              <ImageIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>Image Preview</Typography>
          </Box>
          <IconButton 
            onClick={handleCloseImagePreview}
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, background: '#f5f5f5' }}>
          {imagePreview.url && (
            <img 
              src={imagePreview.url} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                objectFit: 'contain'
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreview.open}
        onClose={handleClosePdfPreview}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            height: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 40, 
              height: 40, 
              background: 'rgba(255,255,255,0.2)'
            }}>
              <PdfIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>PDF Preview</Typography>
              {pdfPreview.name && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {pdfPreview.name}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            onClick={handleClosePdfPreview}
            sx={{ 
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(100% - 64px)' }}>
          {pdfPreview.url && (
            <iframe
              src={pdfPreview.url}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="PDF Preview"
            />
          )}
        </DialogContent>
      </Dialog>

      <style>
        {`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Paper;
