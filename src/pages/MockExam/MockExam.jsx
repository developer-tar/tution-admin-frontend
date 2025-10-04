import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
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
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Euro as EuroIcon,
  AccessTime as TimeIcon,
  Quiz as QuizIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import api from '../../api';

// Validation schema
const examSchema = yup.object().shape({
  name: yup.string().required('Exam name is required').min(5, 'Name must be at least 5 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  category_id: yup.number().required('Category is required'),
  format: yup.number().required('Format is required'),
  price: yup.number().required('Price is required').min(0, 'Price must be positive'),
  currency: yup.string().required('Currency is required'),
  duration_minutes: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
  school_id: yup.number().nullable().transform((value, originalValue) => {
    return originalValue === '' ? null : value;
  }),
  mock_exam_image: yup.mixed().nullable().test('fileSize', 'Image size must not exceed 10MB', (value) => {
    if (!value) return true; // Allow empty
    return value.size <= 10 * 1024 * 1024; // 10MB in bytes
  }).test('fileType', 'The uploaded file must be an image', (value) => {
    if (!value) return true; // Allow empty
    return value.type.startsWith('image/');
  }),
  questions: yup.array().min(1, 'At least one question is required').of(
    yup.object().shape({
      question: yup.string().required('Question is required').min(10, 'Question must be at least 10 characters'),
      options: yup.object().shape({
        1: yup.string().required('Option 1 is required'),
        2: yup.string().required('Option 2 is required'),
        3: yup.string().required('Option 3 is required'),
        4: yup.string().required('Option 4 is required')
      }),
      answer: yup.string().required('Answer is required'),
      duration_in_sec: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 second'),
      marks: yup.number().required('Marks is required').min(1, 'Marks must be at least 1')
    })
  )
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

const MockExam = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    category_id: '',
    format: ''
  });
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingExam, setViewingExam] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(examSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      format: '',
      price: '',
      currency: '€',
      duration_minutes: '',
      school_id: '',
      questions: [{
        question: '',
        options: { 1: '', 2: '', 3: '', 4: '' },
        answer: '',
        duration_in_sec: '',
        marks: 1
      }]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'questions'
  });

  // Handle CSV upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Only .csv files are allowed.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = [];
        const parsed = results.data.map((row, index) => {
          const options = {
            1: row.option1 || '',
            2: row.option2 || '',
            3: row.option3 || '',
            4: row.option4 || ''
          };
          const answer = row.answer;
          const duration_in_sec = row.duration_in_sec;
          const marks = row.marks;

          // Validation
          const optionValues = Object.values(options).filter(Boolean);
          if (optionValues.length < 2) errors.push(`Row ${index + 2}: Minimum 2 options required.`);
          if (!answer || !optionValues.includes(answer)) errors.push(`Row ${index + 2}: Answer must match one of the options.`);
          if (!duration_in_sec || isNaN(duration_in_sec)) errors.push(`Row ${index + 2}: Duration must be a valid number.`);
          if (!marks || isNaN(marks)) errors.push(`Row ${index + 2}: Marks must be a valid number.`);

          return {
            question: row.question || '',
            options,
            answer,
            duration_in_sec: parseInt(duration_in_sec || 30),
            marks: parseInt(marks || 1)
          };
        });

        if (errors.length > 0) {
          toast.error(`CSV Validation Failed:\n${errors.join('\n')}`);
          return;
        }

        replace(parsed);
        toast.success(`${parsed.length} questions loaded from CSV`);
      },
      error: () => toast.error('Failed to parse CSV')
    });
  };

  // Fetch exams
  const fetchExams = async (applyFilters = false) => {
    setLoading(true);
    try {
      let url = 'admin/mock-exam';
      const params = new URLSearchParams();
      
      if (applyFilters) {
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.format) params.append('format', filters.format);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await api.get(url);
      setExams(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch exams');
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories with tree structure
  const fetchCategories = async () => {
    try {
      const response = await api.get('admin/mock-exam/category-tree');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to regular categories API
      try {
        const fallbackResponse = await api.get('admin/mock-exam/categories');
        setCategories(fallbackResponse.data.data || []);
      } catch (fallbackError) {
        console.error('Fallback categories also failed:', fallbackError);
      }
    }
  };

  // Flatten category tree for dropdown display
  const flattenCategories = (categories, level = 0) => {
    let flattened = [];
    categories.forEach(category => {
      // Clear hierarchy with proper spacing and symbols
      let displayName = category.name;
      if (level > 0) {
        const indent = '    '.repeat(level); // More spacing for clarity
        const symbol = level === 1 ? '└─' : level === 2 ? '  └─' : '    └─'; // Tree-like symbols
        displayName = `${indent}${symbol} ${category.name}`;
      }
      
      flattened.push({
        id: category.id,
        name: displayName,
        level: level,
        originalName: category.name
      });
      
      // Use 'all_children' instead of 'children' based on API response
      if (category.all_children && category.all_children.length > 0) {
        flattened = flattened.concat(flattenCategories(category.all_children, level + 1));
      }
    });
    return flattened;
  };

  // Fetch formats from common data
  const fetchFormats = async () => {
    try {
      const response = await api.get('common/data?param=Formats');
      setFormats(response.data.data || []);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  // Create or update exam
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    
    try {
      const formData = new FormData();
      
      // Basic exam data
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category_id', data.category_id);
      formData.append('format_id', data.format);
      formData.append('price', data.price);
      formData.append('currency', data.currency);
      formData.append('duration_minutes', data.duration_minutes);
      
      // Handle school_id - only append if it's a valid number
      if (data.school_id && data.school_id !== '' && !isNaN(data.school_id)) {
        formData.append('school_id', data.school_id);
      }

      // Handle image upload
      if (data.mock_exam_image) {
        formData.append('mock_exam_image', data.mock_exam_image);
      }

      // Questions data
      data.questions.forEach((question, index) => {
        formData.append(`questions[${index}]`, question.question);
        formData.append(`options[${index}][1]`, question.options[1]);
        formData.append(`options[${index}][2]`, question.options[2]);
        formData.append(`options[${index}][3]`, question.options[3]);
        formData.append(`options[${index}][4]`, question.options[4]);
        formData.append(`answers[${index}]`, question.answer);
        formData.append(`duration_in_sec[${index}]`, question.duration_in_sec);
        formData.append(`marks[${index}]`, question.marks);
      });

      // Debug FormData
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log('Making API call to:', editingExam ? `admin/mock-exam/${editingExam.id}` : 'admin/mock-exam');

      if (editingExam) {
        const response = await api.put(`admin/mock-exam/${editingExam.id}`, formData);
        console.log('Update response:', response);
        toast.success('Exam updated successfully');
      } else {
        const response = await api.post('admin/mock-exam', formData);
        console.log('Create response:', response);
        toast.success('Exam created successfully');
      }

      setTabValue(0); // Switch back to list view
      setEditingExam(null);
      reset();
      fetchExams();
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to save exam');
    }
  };

  // Delete exam
  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      await api.delete(`admin/mock-exam/${examId}`);
      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete exam');
      console.error('Error deleting exam:', error);
    }
  };

  // View exam details
  const handleView = async (examId) => {
    try {
      const response = await api.get(`admin/mock-exam/${examId}`);
      const examData = response.data.data;
      console.log('Exam details with questions:', examData);
      setViewingExam(examData);
      setViewDialog(true);
      toast.success('Exam details loaded successfully');
    } catch (error) {
      toast.error('Failed to load exam details');
      console.error('Error loading exam:', error);
    }
  };

  // Open dialog for editing
  const handleEdit = async (exam) => {
    try {
      const response = await api.get(`admin/mock-exam/${exam.id}`);
      const examData = response.data.data;
      
      setEditingExam(examData);
      reset({
        name: examData.name,
        description: examData.description,
        category_id: examData.category_id,
        format: examData.format,
        price: examData.price,
        currency: examData.currency,
        duration_minutes: examData.duration_minutes,
        school_id: examData.school_id || '',
        questions: examData.questions || [{
          question: '',
          options: { 1: '', 2: '', 3: '', 4: '' },
          answer: '',
          duration_in_sec: '',
          marks: 1
        }]
      });
      setTabValue(1); // Switch to Create Exam tab for editing
    } catch (error) {
      toast.error('Failed to load exam details');
      console.error('Error loading exam:', error);
    }
  };

  // Open create exam tab
  const handleCreate = () => {
    setEditingExam(null);
    reset();
    setTabValue(1); // Switch to Create Exam tab
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Add new question
  const addQuestion = () => {
    append({
      question: '',
      options: { 1: '', 2: '', 3: '', 4: '' },
      answer: '',
      duration_in_sec: '',
      marks: 1
    });
  };

  // Load initial data
  useEffect(() => {
    fetchExams();
    fetchCategories();
    fetchFormats();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} fontWeight={700}>
        Mock Exams
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Exams" />
          <Tab label="Create Exam" />
        </Tabs>
      </Box>

      {/* Tab Panel 0 - List View */}
      {tabValue === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={filters.category_id}
                    onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                    label="Filter by Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {flattenCategories(categories).map((cat, index) => (
                      <MenuItem 
                        key={cat.id} 
                        value={cat.id}
                        sx={{ 
                          fontWeight: cat.level === 0 ? 700 : cat.level === 1 ? 500 : 400,
                          fontSize: cat.level === 0 ? '1rem' : '0.9rem',
                          color: cat.level === 0 ? '#1565c0' : cat.level === 1 ? '#1976d2' : '#666',
                          backgroundColor: cat.level === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          fontFamily: 'monospace',
                          lineHeight: 1.8,
                          py: 1.5,
                          px: 2,
                          my: cat.level === 0 ? 1 : 0.5,
                          mx: 1,
                          borderRadius: cat.level === 0 ? 2 : 1,
                          borderLeft: cat.level > 0 ? `3px solid ${cat.level === 1 ? '#1976d2' : '#90caf9'}` : 'none',
                          '&:hover': {
                            backgroundColor: cat.level === 0 
                              ? 'rgba(25, 118, 210, 0.12)' 
                              : 'rgba(25, 118, 210, 0.06)',
                          },
                          // Add spacing between parent and children
                          ...(cat.level === 0 && index > 0 ? { mt: 2 } : {}),
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          width: '100%'
                        }}>
                          {cat.level === 0 && (
                            <Box sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0
                            }} />
                          )}
                          <span style={{ 
                            whiteSpace: 'pre',
                            fontFamily: 'monospace',
                            fontSize: cat.level === 0 ? '1rem' : '0.9rem'
                          }}>
                            {cat.name}
                          </span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Format</InputLabel>
                  <Select
                    value={filters.format}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                    label="Filter by Format"
                  >
                    <MenuItem value="">All Formats</MenuItem>
                    {formats.map((format) => (
                      <MenuItem key={format.id} value={format.id}>
                        {format.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  onClick={() => fetchExams(true)}
                  fullWidth
                >
                  Apply Filters
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                  sx={gradientButtonStyle}
                  fullWidth
                >
                  Create Exam
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Exams Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Format</strong></TableCell>
                    <TableCell><strong>Price</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Questions</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                      
                        <TableCell><Skeleton width={150} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell><Skeleton width={60} /></TableCell>
                        <TableCell><Skeleton width={60} /></TableCell>
                        <TableCell><Skeleton width={50} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                      </TableRow>
                    ))
                  ) : exams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography>No exams found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((exam) => (
                      <TableRow key={exam.id}>
                      
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {exam.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {exam.description?.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.category || 'N/A'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.format_name || exam.format} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.price} 
                            size="small" 
                            icon={<EuroIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.duration_minutes}min`} 
                            size="small" 
                            icon={<TimeIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.questions_count || 0}`} 
                            size="small" 
                            icon={<QuizIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleView(exam.id)}
                            color="info"
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          {/* <IconButton
                            size="small"
                            onClick={() => handleEdit(exam)}
                            color="primary"
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton> */}
                          {/* <IconButton
                            size="small"
                            onClick={() => handleDelete(exam.id)}
                            color="error"
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton> */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Tab Panel 1 - Create Form */}
      {tabValue === 1 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" mb={3} fontWeight={700}>
            {editingExam ? 'Edit Mock Exam' : 'Create Mock Exam'}
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Basic Exam Info */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Exam Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category_id}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        label="Category"
                      >
                        {flattenCategories(categories).map((cat, index) => (
                          <MenuItem 
                            key={cat.id} 
                            value={cat.id}
                            sx={{ 
                              fontWeight: cat.level === 0 ? 700 : cat.level === 1 ? 500 : 400,
                              fontSize: cat.level === 0 ? '1rem' : '0.9rem',
                              color: cat.level === 0 ? '#1565c0' : cat.level === 1 ? '#1976d2' : '#666',
                              backgroundColor: cat.level === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                              fontFamily: 'monospace',
                              lineHeight: 1.8,
                              py: 1.5,
                              px: 2,
                              my: cat.level === 0 ? 1 : 0.5,
                              mx: 1,
                              borderRadius: cat.level === 0 ? 2 : 1,
                              borderLeft: cat.level > 0 ? `3px solid ${cat.level === 1 ? '#1976d2' : '#90caf9'}` : 'none',
                              '&:hover': {
                                backgroundColor: cat.level === 0 
                                  ? 'rgba(25, 118, 210, 0.12)' 
                                  : 'rgba(25, 118, 210, 0.06)',
                              },
                              // Add spacing between parent and children
                              ...(cat.level === 0 && index > 0 ? { mt: 2 } : {}),
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              width: '100%'
                            }}>
                              {cat.level === 0 && (
                                <Box sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  flexShrink: 0
                                }} />
                              )}
                              <span style={{ 
                                whiteSpace: 'pre',
                                fontFamily: 'monospace',
                                fontSize: cat.level === 0 ? '1rem' : '0.9rem'
                              }}>
                                {cat.name}
                              </span>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography color="error" fontSize={12}>
                        {errors.category_id?.message}
                      </Typography>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="format"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.format}>
                      <InputLabel>Format</InputLabel>
                      <Select {...field} value={field.value || ''} label="Format">
                        {formats.map((format) => (
                          <MenuItem key={format.id} value={format.id}>
                            {format.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography color="error" fontSize={12}>
                        {errors.format?.message}
                      </Typography>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Price"
                      inputProps={{ step: "0.01", min: "0" }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="duration_minutes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Duration (minutes)"
                      inputProps={{ min: "1" }}
                      error={!!errors.duration_minutes}
                      helperText={errors.duration_minutes?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="school_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="School ID (Optional)"
                      inputProps={{ min: "1" }}
                      error={!!errors.school_id}
                      helperText={errors.school_id?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Mock Exam Image Upload */}
              <Grid item xs={12}>
                <Controller
                  name="mock_exam_image"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Box>
                      <Typography variant="subtitle1" mb={1} fontWeight={600}>
                        📸 Exam Image (Optional)
                      </Typography>
                      <Box sx={{ 
                        border: '2px dashed',
                        borderColor: errors.mock_exam_image ? 'error.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(25, 118, 210, 0.04)'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <input
                          {...field}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            onChange(file);
                          }}
                          style={{ display: 'none' }}
                          id="mock-exam-image-upload"
                        />
                        <label htmlFor="mock-exam-image-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                borderColor: 'primary.dark',
                                bgcolor: 'rgba(25, 118, 210, 0.08)'
                              }
                            }}
                          >
                            Choose Image
                          </Button>
                        </label>
                        {value && (
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mb: 2 
                            }}>
                              <img
                                src={URL.createObjectURL(value)}
                                alt="Preview"
                                style={{
                                  maxWidth: '200px',
                                  maxHeight: '150px',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="success.main" fontWeight={500}>
                              ✅ {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => onChange(null)}
                              sx={{ mt: 1 }}
                            >
                              Remove Image
                            </Button>
                          </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Upload an image for your exam (Max: 10MB, Formats: JPG, PNG, GIF, etc.)
                        </Typography>
                      </Box>
                      {errors.mock_exam_image && (
                        <Typography color="error" fontSize={12} mt={1}>
                          {errors.mock_exam_image.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </Grid>

              {/* CSV Upload Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 4, 
                  background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.08) 0%, rgba(21, 101, 192, 0.12) 100%)',
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'info.main',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    animation: 'shimmer 3s infinite',
                  },
                  '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' },
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(2, 136, 209, 0.15)',
                    borderColor: 'info.dark',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h5" mb={2} sx={{ 
                      color: 'info.dark', 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #0288d1, #1565c0)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2
                    }}>
                      <Box sx={{
                        fontSize: '2rem',
                        animation: 'bounce 2s infinite',
                        '@keyframes bounce': {
                          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                          '40%': { transform: 'translateY(-10px)' },
                          '60%': { transform: 'translateY(-5px)' },
                        }
                      }}>
                        📤
                      </Box>
                      Bulk Question Upload
                    </Typography>
                    <Typography variant="body1" mb={4} sx={{ 
                      color: 'info.dark',
                      fontWeight: 500,
                      opacity: 0.9
                    }}>
                      Upload multiple questions at once using CSV format for faster exam creation
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={3} flexWrap="wrap">
                      <Button 
                        variant="contained" 
                        component="label"
                        size="large"
                        sx={{
                          background: 'linear-gradient(45deg, #0288d1 30%, #1565c0 90%)',
                          boxShadow: '0 4px 15px rgba(2, 136, 209, 0.3)',
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          fontSize: '1rem',
                          '&:hover': { 
                            background: 'linear-gradient(45deg, #0277bd 30%, #1565c0 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(2, 136, 209, 0.4)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        📁 Upload CSV File
                        <input type="file" hidden accept=".csv" onChange={handleCSVUpload} />
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{ 
                          borderColor: 'info.main',
                          color: 'info.main',
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': { 
                            borderColor: 'info.dark',
                            bgcolor: 'rgba(2, 136, 209, 0.08)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 15px rgba(2, 136, 209, 0.2)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={() => {
                          const sample = `question,option1,option2,option3,option4,answer,duration_in_sec,marks
What is the capital of France?,Paris,Lyon,Marseille,Nice,Paris,30,1
What is 2+2?,3,4,5,6,4,20,1`;
                          const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'sample_mock_exam_format.csv');
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        📥 Download Sample
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* CSV Format Preview */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 3, 
                  bgcolor: 'grey.50', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="h6" mb={2} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600
                  }}>
                    📊 CSV Format Preview
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          {['question', 'option1', 'option2', 'option3', 'option4', 'answer', 'duration_in_sec', 'marks'].map(header => (
                            <TableCell key={header} sx={{ 
                              color: 'white', 
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}>
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>What is the capital of France?</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Paris</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Lyon</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Marseille</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Nice</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'success.main', fontWeight: 600 }}>Paris</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>30</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>1</TableCell>
                        </TableRow>
                        <TableRow sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>What is 2+2?</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>3</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>4</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>5</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>6</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'success.main', fontWeight: 600 }}>4</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>30</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>1</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>

              {/* Questions Section */}
              {fields.map((field, idx) => (
                <React.Fragment key={field.id}>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      mt: 4, 
                      mb: 3, 
                      p: 3, 
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                        animation: 'slideGlow 2s ease-in-out infinite',
                      },
                      '@keyframes slideGlow': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' },
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ffffff 0%, #f5f5f5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.3), transparent)',
                          zIndex: -1,
                        }
                      }}>
                        {idx + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ 
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.4rem',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                          letterSpacing: '0.5px'
                        }}>
                          Question {idx + 1}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 400,
                          mt: 0.5
                        }}>
                          Fill in the question details below
                        </Typography>
                      </Box>
                      {fields.length > 1 && (
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => remove(idx)}
                          startIcon={<DeleteIcon />}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.7)',
                            borderWidth: 2,
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: 'white',
                              bgcolor: 'rgba(255, 255, 255, 0.15)',
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            },
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name={`questions.${idx}.question`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Question"
                          multiline
                          rows={2}
                          error={!!errors?.questions?.[idx]?.question}
                          helperText={errors?.questions?.[idx]?.question?.message}
                        />
                      )}
                    />
                  </Grid>
                  {[1, 2, 3, 4].map(optIdx => (
                    <Grid item xs={12} sm={6} key={optIdx}>
                      <Controller
                        name={`questions.${idx}.options.${optIdx}`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={`Option ${optIdx}`}
                            error={!!errors?.questions?.[idx]?.options?.[optIdx]}
                            helperText={errors?.questions?.[idx]?.options?.[optIdx]?.message}
                          />
                        )}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name={`questions.${idx}.answer`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Correct Answer"
                          error={!!errors?.questions?.[idx]?.answer}
                          helperText={errors?.questions?.[idx]?.answer?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name={`questions.${idx}.duration_in_sec`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Duration (seconds)"
                          type="number"
                          inputProps={{ min: "1" }}
                          error={!!errors?.questions?.[idx]?.duration_in_sec}
                          helperText={errors?.questions?.[idx]?.duration_in_sec?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name={`questions.${idx}.marks`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Marks"
                          type="number"
                          inputProps={{ min: "1" }}
                          error={!!errors?.questions?.[idx]?.marks}
                          helperText={errors?.questions?.[idx]?.marks?.message}
                        />
                      )}
                    />
                  </Grid>
                </React.Fragment>
              ))}

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    onClick={addQuestion}
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'success.main',
                      color: 'success.main',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: 'success.dark',
                        bgcolor: 'rgba(46, 125, 50, 0.04)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    ➕ Add Another Question
                  </Button>
                </Box>
              </Grid>

              {/* Debug Errors */}
              <Grid item xs={12}>
                {Object.keys(errors).length > 0 && (
                  <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="error">Form Validation Errors:</Typography>
                    <pre>{JSON.stringify(errors, null, 2)}</pre>
                  </Box>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={gradientButtonStyle}
                  onClick={() => console.log('Submit button clicked!', errors)}
                >
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}

      {/* View Exam Details Modal */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="quiz">📝</span> {viewingExam?.name} - Questions
          </Typography>
          <IconButton onClick={() => setViewDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {viewingExam && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Questions ({viewingExam.questions?.length || 0}):
              </Typography>
              
              {viewingExam.questions?.map((question, index) => (
                <Box key={question.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    <strong>Q{index + 1}:</strong> {question.question_text}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={`${question.marks} marks`} size="small" />
                    <Chip label={`${question.duration_in_sec}s`} size="small" />
                  </Box>

                  <Grid container spacing={1}>
                    {question.options?.map((option, optIndex) => (
                      <Grid item xs={12} sm={6} key={option.id}>
                        <Box sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: option.option_text === question.correct_answer ? '#4caf50' : '#e0e0e0',
                          borderRadius: 1,
                          bgcolor: option.option_text === question.correct_answer ? '#e8f5e8' : '#f9f9f9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: option.option_text === question.correct_answer ? 600 : 400,
                              minWidth: '20px'
                            }}
                          >
                            {String.fromCharCode(65 + optIndex)}.
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: option.option_text === question.correct_answer ? 600 : 400,
                              color: option.option_text === question.correct_answer ? '#2e7d32' : 'text.primary'
                            }}
                          >
                            {option.option_text}
                            {option.option_text === question.correct_answer && ' ✓'}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MockExam;
