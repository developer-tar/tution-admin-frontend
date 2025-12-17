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
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
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
  Close as CloseIcon,
  Error as ErrorIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import api from '../../api';

// Validation schema
const examSchema = yup.object().shape({
  name: yup.string()
    .required('Mock exam name is required')
    .min(5, 'Name must be at least 5 characters')
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
      // Convert empty string to undefined to trigger required validation
      return originalValue === '' ? undefined : value;
    })
    .typeError('Category must be selected'),
  format: yup.number()
    .required('Format is required')
    .integer('Format must be an integer')
    .transform((value, originalValue) => {
      // Convert empty string to undefined to trigger required validation
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
  mock_exam_image: yup.mixed()
    .nullable()
    .test('fileSize', 'Mock exam image size must not exceed 10MB', (value) => {
    if (!value) return true; // Allow empty
    return value.size <= 10 * 1024 * 1024; // 10MB in bytes
    })
    .test('fileType', 'The uploaded file must be an image', (value) => {
    if (!value) return true; // Allow empty
    return value.type.startsWith('image/');
  }),
  questions: yup.array()
    .min(1, 'At least one question is required')
    .of(
    yup.object().shape({
        question: yup.string()
          .required('Each question is required')
          .min(10, 'Each question must be at least 10 characters')
          .max(500, 'Each question must not exceed 500 characters'),
        options: yup.object()
          .test('minOptions', 'Each question must have at least two options', function(value) {
            if (!value) return false;
            const optionValues = Object.values(value).filter(opt => opt && opt.trim() !== '');
            return optionValues.length >= 2;
          })
          .test('optionLength', 'Each option must be between 1 and 255 characters', function(value) {
            if (!value) return false;
            for (const opt of Object.values(value)) {
              if (opt && opt.trim() !== '') {
                if (opt.length < 1 || opt.length > 255) {
                  return this.createError({ message: 'Each option must be between 1 and 255 characters' });
                }
              }
            }
            return true;
          })
          .test('nonEmptyOptions', 'Each option must be a non-empty string', function(value) {
            if (!value) return false;
            for (const [key, opt] of Object.entries(value)) {
              if (opt && opt.trim() !== '') {
                // Option is provided and non-empty, which is valid
                continue;
              }
            }
            return true;
          })
          .shape({
            1: yup.string().nullable().transform((v) => v === '' ? null : v),
            2: yup.string().nullable().transform((v) => v === '' ? null : v),
            3: yup.string().nullable().transform((v) => v === '' ? null : v),
            4: yup.string().nullable().transform((v) => v === '' ? null : v)
      }),
        answer: yup.string()
          .required('Each question must have one answer')
          .min(1, 'Answer must be at least 1 character')
          .max(255, 'Answer must not exceed 255 characters')
          .test('answerInOptions', 'The answer must match one of the options', function(value) {
            const { options } = this.parent;
            if (!options || !value) return true; // Let required validation handle empty
            const optionValues = Object.values(options)
              .filter(opt => opt && opt.trim() !== '')
              .map(opt => opt.trim());
            return optionValues.includes(value.trim());
          }),
        duration_in_sec: yup.number()
          .required('Each question must have a duration')
          .integer('Duration must be a number')
          .min(1, 'Duration must be at least 1 second')
          .typeError('Duration must be a number'),
        marks: yup.number()
          .nullable()
          .integer('Marks must be a number')
          .min(1, 'Marks must be at least 1')
          .transform((value, originalValue) => {
            return originalValue === '' ? null : value;
          })
          .typeError('Marks must be a number')
      })
    )
    .test('arrayCountsMatch', 'The number of questions, options, answers, and durations must match', function(questions) {
      if (!questions || questions.length === 0) return true;
      
      const questionCount = questions.length;
      const counts = {
        questions: questionCount,
        options: questions.filter(q => q.options && Object.values(q.options).some(opt => opt && opt.trim() !== '')).length,
        answers: questions.filter(q => q.answer && q.answer.trim() !== '').length,
        durations: questions.filter(q => q.duration_in_sec != null).length,
        marks: questions.filter(q => q.marks != null).length
      };
      
      // Check if all arrays have same count (required arrays)
      const requiredMatch = counts.options === questionCount && 
                           counts.answers === questionCount && 
                           counts.durations === questionCount;
      
      // If marks are provided, they must also match the count
      const marksMatch = counts.marks === 0 || counts.marks === questionCount;
      
      return requiredMatch && marksMatch;
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

// Helper function to format only question-related validation errors into user-friendly messages
// Regular field errors are displayed under their respective input fields
const formatQuestionErrors = (errors) => {
  const errorMessages = [];
  const fieldLabels = {
    question: 'Question',
    answer: 'Correct Answer',
    duration_in_sec: 'Duration (seconds)',
    marks: 'Marks'
  };

  const processErrors = (errObj, prefix = '') => {
    if (!errObj || typeof errObj !== 'object') return;

    Object.keys(errObj).forEach(key => {
      const error = errObj[key];
      
      // If error has a message property, it's a direct error
      if (error?.message) {
        const fieldLabel = fieldLabels[key] || key;
        errorMessages.push(`${prefix}${fieldLabel}: ${error.message}`);
      } 
      // Handle options object (options.1, options.2, etc.)
      else if (key === 'options' && error && typeof error === 'object' && !Array.isArray(error)) {
        Object.keys(error).forEach(optKey => {
          const optError = error[optKey];
          const optionLabel = `Option ${optKey}`;
          if (optError?.message) {
            errorMessages.push(`${prefix}${optionLabel}: ${optError.message}`);
          } else if (optError && typeof optError === 'object') {
            // Handle nested option errors
            processErrors(optError, `${prefix}${optionLabel} - `);
          }
        });
      }
      // Handle array errors (questions array)
      else if (Array.isArray(error)) {
        error.forEach((item, index) => {
          if (item && typeof item === 'object') {
            processErrors(item, `Question ${index + 1} - `);
          } else if (item?.message) {
            // Handle direct array error messages
            errorMessages.push(`${prefix}Question ${index + 1}: ${item.message}`);
          }
        });
      } 
      // Handle nested object errors
      else if (error && typeof error === 'object') {
        processErrors(error, prefix);
      }
    });
  };

  // Only process question-related errors
  if (errors?.questions) {
    processErrors({ questions: errors.questions });
  }

  return errorMessages;
};

const MockExam = () => {
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formats, setFormats] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    category_id: '',
    format: ''
  });
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingExam, setViewingExam] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, exam: null });
  const [deletingExamId, setDeletingExamId] = useState(null);
  const [togglingExamId, setTogglingExamId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(examSchema),
    defaultValues: {
      name: '',
      description: null,
      category_id: '',
      format: '',
      price: '',
      currency: null,
      duration_minutes: null,
      school_id: null,
      questions: [{
        question: '',
        options: { 1: '', 2: '', 3: '', 4: '' },
        answer: '',
        duration_in_sec: '',
        marks: null
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
      const examsData = response.data.data.data || [];
      
      // Map format to format_name - API returns format as string (e.g., "any")
      // If formats array is available, try to find matching format object
      const mappedExams = examsData.map(exam => {
        const mappedExam = { ...exam };
        
        // If format is a string (like "any" from API), use it directly
        if (typeof exam.format === 'string') {
          // Try to find format name from formats array if available
          if (formats.length > 0) {
            const formatObj = formats.find(f => {
              // Try matching by name first
              if (f.name && f.name.toLowerCase() === exam.format.toLowerCase()) {
                return true;
              }
              // Try matching by ID if format string is numeric
              if (!isNaN(exam.format)) {
                const formatId = typeof f.id === 'string' ? parseInt(f.id, 10) : f.id;
                const examFormatId = parseInt(exam.format, 10);
                return formatId === examFormatId;
              }
              return false;
            });
            if (formatObj) {
              mappedExam.format_name = formatObj.name;
            } else {
              // If not found in formats array, use the format string as is
              mappedExam.format_name = exam.format;
            }
          } else {
            // Formats not loaded yet, use format string as is
            mappedExam.format_name = exam.format;
          }
        } else if (exam.format_id && formats.length > 0) {
          // If format_id exists, try to find format name
          const formatObj = formats.find(f => {
            const formatId = typeof f.id === 'string' ? parseInt(f.id, 10) : f.id;
            const examFormatId = typeof exam.format_id === 'string' ? parseInt(exam.format_id, 10) : exam.format_id;
            return formatId === examFormatId;
          });
          if (formatObj) {
            mappedExam.format_name = formatObj.name;
          }
        }
        
        return mappedExam;
      });
      
      setExams(mappedExams);
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

  // Fetch schools
  const fetchSchools = async () => {
    try {
      const response = await api.get('admin/master-form/schools?per_page=1000');
      if (response.data.success) {
        setSchools(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  // Create or update exam
  const onSubmit = async (data) => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('Form submission already in progress, ignoring duplicate request');
      return;
    }

    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    
    try {
      if (editingExam) {
        // For edit mode, UpdateMockExamRequest uses 'sometimes' validation
        // Only send fields that are present (following 'sometimes' pattern)
        const hasImage = data.mock_exam_image && data.mock_exam_image instanceof File;
        const hasQuestions = data.questions && data.questions.length > 0;
        
        // Use FormData if image or questions are present, otherwise use JSON
        if (hasImage || hasQuestions) {
      const formData = new FormData();
          formData.append('_method', 'PUT'); // Method spoofing for Laravel/PHP
      
          // Only append fields that have values (following 'sometimes' pattern)
          if (data.name) {
      formData.append('name', data.name);
          }
          
          if (data.description !== null && data.description !== undefined) {
            formData.append('description', data.description || '');
          }
          
          if (data.category_id) {
            formData.append('category_id', Number(data.category_id));
          }
          
          if (data.format) {
            formData.append('format_id', Number(data.format));
          }
          
          if (data.price !== null && data.price !== undefined) {
      formData.append('price', data.price);
          }
          
          if (data.currency && data.currency !== '') {
      formData.append('currency', data.currency);
          }
          
          if (data.duration_minutes != null) {
      formData.append('duration_minutes', data.duration_minutes);
          }
      
      if (data.school_id && data.school_id !== '' && !isNaN(data.school_id)) {
        formData.append('school_id', data.school_id);
      }

          if (hasImage) {
        formData.append('mock_exam_image', data.mock_exam_image);
      }

          // Add questions data if present (backend update doesn't validate, but accepts if sent)
          if (hasQuestions) {
      data.questions.forEach((question, index) => {
        formData.append(`questions[${index}]`, question.question);
              
              // Convert options object to array format (backend expects array)
              const optionValues = Object.values(question.options)
                .filter(opt => opt && opt.trim() !== '');
              
              optionValues.forEach((optionValue, optIndex) => {
                formData.append(`options[${index}][${optIndex}]`, optionValue);
              });
              
        formData.append(`answers[${index}]`, question.answer);
        formData.append(`duration_in_sec[${index}]`, question.duration_in_sec);
              
              if (question.marks != null) {
        formData.append(`marks[${index}]`, question.marks);
              }
      });
          }

      // Debug FormData
          console.log('Update FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

          // Use POST with _method=PUT for multipart/form-data updates
          const response = await api.post(`admin/mock-exam/${editingExam.id}`, formData);
          console.log('Update response:', response);
          toast.success(response.data.message || 'Exam updated successfully');
        } else {
          // Use JSON when no image and no questions (cleaner for simple updates)
          const updateData = {};
          
          // Only include fields that have values (following 'sometimes' pattern)
          if (data.name) {
            updateData.name = data.name;
          }
          
          if (data.description !== null && data.description !== undefined) {
            updateData.description = data.description || null;
          }
          
          if (data.category_id) {
            updateData.category_id = Number(data.category_id);
          }
          
          if (data.format) {
            updateData.format_id = Number(data.format);
          }
          
          if (data.price !== null && data.price !== undefined) {
            updateData.price = data.price;
          }
          
          if (data.currency && data.currency !== '') {
            updateData.currency = data.currency;
          }
          
          if (data.duration_minutes != null) {
            updateData.duration_minutes = data.duration_minutes;
          }
          
          if (data.school_id && data.school_id !== '' && !isNaN(data.school_id)) {
            updateData.school_id = data.school_id;
          }
          
          console.log('Update JSON payload:', updateData);
          
          const response = await api.put(`admin/mock-exam/${editingExam.id}`, updateData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        console.log('Update response:', response);
          toast.success(response.data.message || 'Exam updated successfully');
        }
      } else {
        // For create mode, always use FormData
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('category_id', Number(data.category_id));
        formData.append('format_id', Number(data.format));
        formData.append('price', data.price);
        formData.append('currency', data.currency);
        formData.append('duration_minutes', data.duration_minutes);
        
        if (data.school_id && data.school_id !== '' && !isNaN(data.school_id)) {
          formData.append('school_id', data.school_id);
        }

        if (data.mock_exam_image) {
          formData.append('mock_exam_image', data.mock_exam_image);
        }

        // Questions data
        data.questions.forEach((question, index) => {
          formData.append(`questions[${index}]`, question.question);
          
          // Convert options object to array format (backend expects array)
          // Filter out empty options and convert to array with 0-based indexing
          const optionValues = Object.values(question.options)
            .filter(opt => opt && opt.trim() !== '');
          
          optionValues.forEach((optionValue, optIndex) => {
            formData.append(`options[${index}][${optIndex}]`, optionValue);
          });
          
          formData.append(`answers[${index}]`, question.answer);
          formData.append(`duration_in_sec[${index}]`, question.duration_in_sec);
          
          // Only append marks if provided (nullable in backend)
          if (question.marks != null) {
            formData.append(`marks[${index}]`, question.marks);
          }
        });

        const response = await api.post('admin/mock-exam', formData);
        console.log('Create response:', response);
        toast.success(response.data.message || 'Exam created successfully');
      }

      setTabValue(0); // Switch back to list view
      setEditingExam(null);
      reset();
      fetchExams();
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error response:', error.response);
      
      // Handle validation errors
      if (error.response?.status === 400 || error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.keys(errors).forEach(key => {
            const errorMessages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
            errorMessages.forEach(msg => toast.error(`${key}: ${msg}`));
          });
        } else {
          toast.error(error.response.data.message || 'Validation error occurred');
        }
      } else if (error.response?.status === 404) {
        toast.error('Mock exam not found');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
      toast.error(error.response?.data?.message || 'Failed to save exam');
    }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if exam is active
  const isExamActive = (exam) => {
    if (!exam) return false;
    const statusValue = exam.status || exam.status_id || exam.exam_status || exam.state;
    if (statusValue === undefined || statusValue === null) {
      return false;
    }
    if (typeof statusValue === 'string') {
      const lowerStatus = statusValue.toLowerCase();
      if (lowerStatus === 'active' || lowerStatus === '2') {
        return true;
      }
      return false;
    }
    const statusNum = typeof statusValue === 'string' ? parseInt(statusValue, 10) : statusValue;
    // Status 2 = Active, Status 3 = Inactive
    return statusNum === 2;
  };

  // Delete exam
  const handleDeleteClick = (exam) => {
    setDeleteDialog({ open: true, exam });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, exam: null });
  };

  const handleDeleteConfirm = async () => {
    const exam = deleteDialog.exam;
    if (!exam || !exam.id) {
      toast.error('Cannot delete: Exam ID not found');
      setDeleteDialog({ open: false, exam: null });
      return;
    }

    setDeletingExamId(exam.id);
    
    try {
      const response = await api.delete(`admin/mock-exam/${exam.id}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Exam deleted successfully');
        setDeleteDialog({ open: false, exam: null });
      fetchExams();
      } else {
        toast.error(response.data.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Cannot delete mock exam. This mock exam has been purchased by one or more parents or students.');
      } else if (error.response?.status === 404) {
        toast.error('Mock exam not found');
        fetchExams();
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete exam');
      }
    } finally {
      setDeletingExamId(null);
    }
  };

  // Toggle exam status
  const handleToggleStatus = async (exam) => {
    if (!exam || !exam.id) {
      toast.error('Cannot toggle status: Exam ID not found');
      return;
    }

    const isActive = isExamActive(exam);
    const action = isActive ? 'deactivate' : 'activate';
    
    console.log('🔄 Toggle Status - Exam ID:', exam.id, '| Status:', exam.status, '| Action:', action);
    
    setTogglingExamId(exam.id);
    
    try {
      const response = await api.patch(`admin/mock-exam/${exam.id}/toggle-status`, {
        action: action
      });
      
      if (response.data.success) {
        toast.success(response.data.message || `Mock exam ${action}d successfully`);
        fetchExams();
      } else {
        toast.error(response.data.message || `Failed to ${action} mock exam`);
      }
    } catch (err) {
      console.error('❌ Error toggling exam status:', err);
      if (err.response?.status === 400) {
        const errors = err.response.data.errors;
        if (errors?.action) {
          toast.error(errors.action[0]);
        } else {
          toast.error(err.response.data.message || 'Invalid action');
        }
      } else if (err.response?.status === 404) {
        toast.error('Mock exam not found');
        fetchExams();
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(err.response?.data?.message || 'Failed to toggle mock exam status');
      }
    } finally {
      setTogglingExamId(null);
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
      
      console.log('Edit - API Response:', examData);
      
      // Transform questions from API format to form format
      const transformedQuestions = examData.questions && examData.questions.length > 0
        ? examData.questions.map((q, index) => {
            // Transform options array to object format { 1: '', 2: '', 3: '', 4: '' }
            const optionsObj = { 1: '', 2: '', 3: '', 4: '' };
            
            if (q.options && Array.isArray(q.options)) {
              // Sort options by order if available, otherwise use array order
              const sortedOptions = [...q.options].sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                  return a.order - b.order;
                }
                return 0;
              });
              
              // Map options to object format
              sortedOptions.forEach((opt, optIndex) => {
                const key = (optIndex + 1).toString();
                optionsObj[key] = opt.option_text || opt.option || '';
              });
            }
            
            return {
              question: q.question_text || q.question || '',
              options: optionsObj,
              answer: q.correct_answer || q.answer || '',
              duration_in_sec: q.duration_in_sec || q.duration || '',
              marks: q.marks || 1
            };
          })
        : [{
          question: '',
          options: { 1: '', 2: '', 3: '', 4: '' },
          answer: '',
          duration_in_sec: '',
          marks: 1
          }];
      
      // Determine format value - prefer format_id, fallback to format string
      let formatValue = examData.format_id;
      if (!formatValue && examData.format) {
        // If format is a string, try to find matching format in formats array
        if (formats.length > 0) {
          const formatObj = formats.find(f => {
            // Try matching by name
            if (f.name && f.name.toLowerCase() === examData.format.toLowerCase()) {
              return true;
            }
            // Try matching by ID if format string is numeric
            if (!isNaN(examData.format)) {
              const formatId = typeof f.id === 'string' ? parseInt(f.id, 10) : f.id;
              const examFormatId = parseInt(examData.format, 10);
              return formatId === examFormatId;
            }
            return false;
          });
          if (formatObj) {
            formatValue = formatObj.id;
          } else {
            // If not found, use format string as is (will be converted to number if possible)
            formatValue = isNaN(examData.format) ? examData.format : parseInt(examData.format, 10);
          }
        } else {
          formatValue = isNaN(examData.format) ? examData.format : parseInt(examData.format, 10);
        }
      }
      
      const formData = {
        name: examData.name || '',
        description: examData.description || '',
        category_id: examData.category_id || '',
        format: formatValue || '',
        price: examData.price || '',
        currency: examData.currency || null,
        duration_minutes: examData.duration_minutes || '',
        school_id: examData.school_id || '',
        questions: transformedQuestions
      };
      
      console.log('Edit - Transformed Form Data:', formData);
      
      // Store existing image URL if available
      const imageUrl = examData.image_url || examData.mock_exam_image_url || examData.image || null;
      setExistingImageUrl(imageUrl);
      
      setEditingExam(examData);
      reset(formData);
      setTabValue(1); // Switch to Create Exam tab for editing
    } catch (error) {
      toast.error('Failed to load exam details');
      console.error('Error loading exam:', error);
      if (error.response?.status === 404) {
        toast.error('Mock exam not found');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  // Open create exam tab
  const handleCreate = () => {
    setEditingExam(null);
    setExistingImageUrl(null);
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

  // Auto-scroll to first validation error
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Small delay to ensure DOM is updated with error states
      const scrollTimer = setTimeout(() => {
        // Priority order: regular fields first, then question errors
        const regularFieldNames = ['name', 'description', 'category_id', 'format', 'price', 'currency', 'duration_minutes', 'school_id', 'mock_exam_image'];
        
        // Find the first regular field with an error using data attributes
        for (const fieldName of regularFieldNames) {
          if (errors[fieldName]) {
            // Use data-field-container attribute to find the Grid item
            const fieldContainer = document.querySelector(`[data-field-container="${fieldName}"]`);
            if (fieldContainer) {
              fieldContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              });
              
              // Try to focus the actual input field within the container
              const inputField = fieldContainer.querySelector('input, textarea, select');
              if (inputField && inputField.focus) {
                try {
                  setTimeout(() => inputField.focus(), 100);
                } catch (e) {
                  // Ignore focus errors
                }
              }
              return;
            }
          }
        }
        
        // If no regular field errors found, check for question errors
        if (errors.questions) {
          // First, try to scroll to the question error summary card
          const errorCard = document.querySelector('[data-question-errors]');
          if (errorCard) {
            errorCard.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            return;
          }
          
          // If error card not visible, try to find the first question field with error
          if (Array.isArray(errors.questions)) {
            for (let index = 0; index < errors.questions.length; index++) {
              const questionError = errors.questions[index];
              if (questionError) {
                // Try to find question input fields
                const questionField = document.querySelector(`input[name="questions.${index}.question"], textarea[name="questions.${index}.question"]`);
                if (questionField) {
                  questionField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                  });
                  try {
                    setTimeout(() => questionField.focus(), 100);
                  } catch (e) {
                    // Ignore focus errors
                  }
                  return;
                }
                
                // Try to find option fields with errors
                if (questionError.options) {
                  for (let optIdx = 1; optIdx <= 4; optIdx++) {
                    if (questionError.options[optIdx]) {
                      const optionField = document.querySelector(`input[name="questions.${index}.options.${optIdx}"]`);
                      if (optionField) {
                        optionField.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center',
                          inline: 'nearest'
                        });
                        try {
                          setTimeout(() => optionField.focus(), 100);
                        } catch (e) {
                          // Ignore focus errors
                        }
                        return;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, 200);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [errors]);

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchFormats();
    fetchSchools();
    // Fetch exams - format mapping will happen in fetchExams function
    fetchExams();
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      {/* Header Section with Gradient */}
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
            <QuizIcon sx={{ fontSize: 28, color: 'white' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
        Mock Exams
      </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '14px', maxWidth: 400 }}>
            Create and manage comprehensive mock exams with multiple choice questions
          </Typography>
        </Box>
      </Box>

      {/* Enhanced Tabs */}
      <Card sx={{ 
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
                '&.Mui-selected': {
                  color: '#667eea',
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizIcon />
                  All Exams
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon />
                  Create Exam
                </Box>
              } 
            />
        </Tabs>
      </Box>
      </Card>

      {/* Tab Panel 0 - List View */}
      {tabValue === 0 && (
        <Box>
          {/* Enhanced Filters Card */}
          <Card sx={{ 
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <QuizIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#263238' }}>
                  Filter & Search Exams
                </Typography>
              </Box>
              <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <QuizIcon sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                        Category
                      </Typography>
                    </Box>
                <FormControl fullWidth>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={filters.category_id}
                    onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                    label="Filter by Category"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
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
                  </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #fff8f0 0%, #fef3e8 100%)',
                    border: '1px solid rgba(255, 152, 0, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TimeIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                        Format
                      </Typography>
                    </Box>
                <FormControl fullWidth>
                  <InputLabel>Filter by Format</InputLabel>
                  <Select
                    value={filters.format}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                    label="Filter by Format"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                  >
                    <MenuItem value="">All Formats</MenuItem>
                    {formats.map((format) => (
                      <MenuItem key={format.id} value={format.id}>
                        {format.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                  </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  onClick={() => fetchExams(true)}
                  fullWidth
                    sx={{
                      height: 56,
                      borderRadius: 2,
                      borderWidth: 2,
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                >
                  Apply Filters
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                    sx={{
                      ...gradientButtonStyle,
                      height: 56,
                      borderRadius: 2,
                      boxShadow: '0 4px 15px rgba(59, 42, 159, 0.3)',
                      '&:hover': {
                        ...gradientButtonStyle['&:hover'],
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(59, 42, 159, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  fullWidth
                >
                  Create Exam
                </Button>
              </Grid>
            </Grid>
            </CardContent>
          </Card>

          {/* Enhanced Exams Table */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Format</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Duration</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Questions</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                        <TableCell><Skeleton width={150} height={40} /></TableCell>
                        <TableCell><Skeleton width={100} height={40} /></TableCell>
                        <TableCell><Skeleton width={80} height={40} /></TableCell>
                        <TableCell><Skeleton width={60} height={40} /></TableCell>
                        <TableCell><Skeleton width={60} height={40} /></TableCell>
                        <TableCell><Skeleton width={50} height={40} /></TableCell>
                        <TableCell><Skeleton width={70} height={40} /></TableCell>
                        <TableCell><Skeleton width={180} height={40} /></TableCell>
                      </TableRow>
                    ))
                  ) : exams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <QuizIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>No Exams Found</Typography>
                          <Typography variant="body2" sx={{ color: '#999' }}>Create your first mock exam to get started</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((exam) => (
                      <TableRow 
                        key={exam.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {/* Exam Image */}
                            {exam.image_url || exam.mock_exam_image_url || exam.image ? (
                              <Box
                                component="img"
                                src={exam.image_url || exam.mock_exam_image_url || exam.image}
                                alt={exam.name}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 2,
                                  objectFit: 'cover',
                                  border: '2px solid',
                                  borderColor: 'rgba(102, 126, 234, 0.2)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)'
                                }}
                              >
                                <QuizIcon sx={{ color: 'white', fontSize: 28 }} />
                              </Box>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" fontWeight={600} sx={{ color: '#263238', mb: 0.5 }}>
                            {exam.name}
                          </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {exam.description?.substring(0, 60)}...
                          </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.category || 'N/A'} 
                            size="small" 
                            variant="outlined"
                            sx={{
                              borderColor: '#667eea',
                              color: '#667eea',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {exam.format_name || exam.format ? (
                          <Chip 
                              label={exam.format_name || exam.format || 'N/A'} 
                            size="small" 
                              sx={{
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.price} ${exam.currency || '€'}`} 
                            size="small" 
                            icon={<EuroIcon sx={{ color: '#4caf50 !important' }} />}
                            sx={{
                              background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.duration_minutes}min`} 
                            size="small" 
                            icon={<TimeIcon sx={{ color: '#ff9800 !important' }} />}
                            sx={{
                              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.questions_count || 0}`} 
                            size="small" 
                            icon={<QuizIcon sx={{ color: '#1976d2 !important' }} />}
                            sx={{
                              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={isExamActive(exam) ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              background: isExamActive(exam) 
                                ? 'linear-gradient(45deg, #4caf50, #2e7d32)' 
                                : 'linear-gradient(45deg, #757575, #616161)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="medium"
                            onClick={() => handleView(exam.id)}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'info.main',
                                  color: 'info.main',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(2, 136, 209, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                          >
                            <ViewIcon />
                          </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Exam">
                              <IconButton
                                size="medium"
                            onClick={() => handleEdit(exam)}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  color: 'primary.main',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                          >
                            <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={isExamActive(exam) ? 'Deactivate' : 'Activate'}>
                              <IconButton
                                size="medium"
                                onClick={() => handleToggleStatus(exam)}
                                disabled={togglingExamId === exam.id}
                                sx={{
                                  border: '1px solid',
                                  borderColor: isExamActive(exam) ? 'success.main' : 'grey.500',
                                  color: isExamActive(exam) ? 'success.main' : 'grey.500',
                                  '&:hover': { 
                                    backgroundColor: isExamActive(exam) 
                                      ? 'rgba(76, 175, 80, 0.1)' 
                                      : 'rgba(158, 158, 158, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                {togglingExamId === exam.id ? (
                                  <CircularProgress size={20} />
                                ) : isExamActive(exam) ? (
                                  <ToggleOnIcon />
                                ) : (
                                  <ToggleOffIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Exam">
                              <IconButton
                                size="medium"
                                onClick={() => handleDeleteClick(exam)}
                                disabled={deletingExamId === exam.id}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'error.main',
                                  color: 'error.main',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                {deletingExamId === exam.id ? (
                                  <CircularProgress size={20} />
                                ) : (
                            <DeleteIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* Tab Panel 1 - Create Form */}
      {tabValue === 1 && (
        <Box>
          {/* Enhanced Form Header */}
          <Card sx={{ 
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{ 
              p: 4,
              position: 'relative',
              zIndex: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}>
                  {editingExam ? (
                    <EditIcon sx={{ color: 'white', fontSize: 28 }} />
                  ) : (
                    <AddIcon sx={{ color: 'white', fontSize: 28 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
            {editingExam ? 'Edit Mock Exam' : 'Create Mock Exam'}
          </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {editingExam ? 'Update exam details and questions' : 'Fill in the form below to create a new mock exam'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card sx={{ 
              mb: 3,
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#263238', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <QuizIcon sx={{ color: '#667eea' }} />
                  Basic Exam Information
                </Typography>
                <Grid container spacing={3}>
              {/* Basic Exam Info */}
                  <Grid item xs={12} sm={6} data-field-container="name">
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                            }
                          }}
                    />
                  )}
                />
              </Grid>
              
                  <Grid item xs={12} sm={6} data-field-container="category_id">
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
                            sx={{
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            }}
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

              <Grid item xs={12} sm={6} data-field-container="format">
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

              <Grid item xs={12} sm={6} data-field-container="price">
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

              <Grid item xs={12} sm={6} data-field-container="currency">
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.currency}>
                      <InputLabel>Currency (Optional)</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        label="Currency (Optional)"
                        sx={{
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value="€">€ (Euro)</MenuItem>
                        <MenuItem value="$">$ (Dollar)</MenuItem>
                        <MenuItem value="£">£ (Pound)</MenuItem>
                      </Select>
                      <Typography color="error" fontSize={12}>
                        {errors.currency?.message}
                      </Typography>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} data-field-container="duration_minutes">
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

              <Grid item xs={12} sm={6} data-field-container="school_id">
                <Controller
                  name="school_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.school_id}>
                      <InputLabel>School (Optional)</InputLabel>
                      <Select
                      {...field}
                        value={field.value || ''}
                        label="School (Optional)"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {schools.map((school) => (
                          <MenuItem key={school.id} value={school.id}>
                            {school.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography color="error" fontSize={12}>
                        {errors.school_id?.message}
                      </Typography>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} data-field-container="description">
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

                  {/* Enhanced Mock Exam Image Upload */}
                  <Grid item xs={12} data-field-container="mock_exam_image">
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #fff8f0 0%, #fef3e8 100%)',
                      border: '1px solid rgba(255, 152, 0, 0.1)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CloudUploadIcon sx={{ color: '#ff9800', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#263238' }}>
                          Exam Image (Optional)
                        </Typography>
                      </Box>
                <Controller
                  name="mock_exam_image"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Box>
                      <Box sx={{ 
                        border: '2px dashed',
                              borderColor: errors.mock_exam_image ? 'error.main' : '#ff9800',
                              borderRadius: 3,
                              p: 4,
                        textAlign: 'center',
                              background: 'white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        '&:hover': {
                                borderColor: '#f57c00',
                                bgcolor: 'rgba(255, 152, 0, 0.04)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(255, 152, 0, 0.15)'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        <input
                          {...field}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                                  if (file) {
                            onChange(file);
                                    setExistingImageUrl(null); // Clear existing image when new one is selected
                                  }
                          }}
                          style={{ display: 'none' }}
                          id="mock-exam-image-upload"
                        />
                        <label htmlFor="mock-exam-image-upload">
                          <Button
                                  variant="contained"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                    background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                                    color: 'white',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                              '&:hover': {
                                      background: 'linear-gradient(45deg, #f57c00, #e65100)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                            }}
                          >
                                  {existingImageUrl ? 'Change Image' : 'Choose Image'}
                          </Button>
                        </label>
                              {/* Show existing image if in edit mode and no new file selected */}
                              {existingImageUrl && !value && (
                                <Box sx={{ mt: 3 }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mb: 2 
                                  }}>
                                    <Box sx={{
                                      position: 'relative',
                                      borderRadius: 3,
                                      overflow: 'hidden',
                                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                      border: '3px solid',
                                      borderColor: '#2196f3'
                                    }}>
                                      <img
                                        src={existingImageUrl}
                                        alt="Current exam image"
                                        style={{
                                          maxWidth: '250px',
                                          maxHeight: '180px',
                                          display: 'block'
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                  <Chip
                                    label="📷 Current Image"
                                    sx={{
                                      background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                                      color: 'white',
                                      fontWeight: 600,
                                      mb: 1
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                                    Upload a new image to replace the current one
                                  </Typography>
                                </Box>
                              )}
                              {/* Show new file preview if a new file is selected */}
                        {value && (
                                <Box sx={{ mt: 3 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mb: 2 
                                  }}>
                                    <Box sx={{
                                      position: 'relative',
                                      borderRadius: 3,
                                      overflow: 'hidden',
                                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                      border: '3px solid',
                                      borderColor: '#4caf50'
                            }}>
                              <img
                                src={URL.createObjectURL(value)}
                                alt="Preview"
                                style={{
                                          maxWidth: '250px',
                                          maxHeight: '180px',
                                          display: 'block'
                                }}
                              />
                            </Box>
                                  </Box>
                                  <Chip
                                    label={`✅ ${value.name} (${(value.size / 1024 / 1024).toFixed(2)} MB)`}
                                    sx={{
                                      background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                                      color: 'white',
                                      fontWeight: 600,
                                      mb: 1
                                    }}
                                  />
                                  <Box>
                            <Button
                              size="small"
                                      variant="outlined"
                              color="error"
                                      onClick={() => {
                                        onChange(null);
                                        // Restore existing image if available
                                        if (existingImageUrl) {
                                          setExistingImageUrl(existingImageUrl);
                                        }
                                      }}
                                      sx={{ 
                                        mt: 1,
                                        borderRadius: 2,
                                        borderWidth: 2
                                      }}
                            >
                                      Remove New Image
                            </Button>
                                  </Box>
                          </Box>
                        )}
                              <Typography variant="body2" color="text.secondary" mt={2} sx={{ fontSize: '0.875rem' }}>
                          Upload an image for your exam (Max: 10MB, Formats: JPG, PNG, GIF, etc.)
                        </Typography>
                      {errors.mock_exam_image && (
                                <Typography color="error" fontSize={14} mt={2} sx={{ fontWeight: 500 }}>
                          {errors.mock_exam_image.message}
                        </Typography>
                      )}
                            </Box>
                    </Box>
                  )}
                />
                    </Paper>
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

                  {/* Enhanced CSV Format Preview */}
              <Grid item xs={12}>
                    <Card sx={{ 
                  mt: 2, 
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      background: 'rgba(255,255,255,0.95)',
                  border: '1px solid',
                      borderColor: 'rgba(2, 136, 209, 0.2)'
                }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0288d1 0%, #1565c0 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)'
                          }}>
                            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>📊</Typography>
                          </Box>
                          <Typography variant="h6" sx={{ 
                            color: '#263238',
                    fontWeight: 600
                  }}>
                            CSV Format Preview
                  </Typography>
                        </Box>
                        <TableContainer component={Paper} sx={{ 
                          borderRadius: 3, 
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                    <Table size="small">
                      <TableHead>
                              <TableRow sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #1565c0 100%)' }}>
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
                              <TableRow sx={{ '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.05)' }, transition: 'all 0.2s' }}>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500 }}>What is the capital of France?</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Paris</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Lyon</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Marseille</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Nice</TableCell>
                                <TableCell sx={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.85rem', 
                                  color: '#2e7d32', 
                                  fontWeight: 700,
                                  background: 'rgba(76, 175, 80, 0.1)'
                                }}>
                                  Paris
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>30</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>1</TableCell>
                        </TableRow>
                              <TableRow sx={{ '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.05)' }, transition: 'all 0.2s' }}>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500 }}>What is 2+2?</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>3</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>4</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>5</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>6</TableCell>
                                <TableCell sx={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.85rem', 
                                  color: '#2e7d32', 
                                  fontWeight: 700,
                                  background: 'rgba(76, 175, 80, 0.1)'
                                }}>
                                  4
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>30</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>1</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                      </CardContent>
                    </Card>
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
                          rows={3}
                          error={!!errors?.questions?.[idx]?.question}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                            }
                          }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                  borderColor: '#667eea',
                                },
                              }
                            }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                            }
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                            }
                          }}
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </React.Fragment>
              ))}

              <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    onClick={addQuestion}
                    startIcon={<AddIcon />}
                        variant="contained"
                    size="large"
                    sx={{
                          background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                          color: 'white',
                          px: 5,
                      py: 1.5,
                      borderRadius: 3,
                          fontWeight: 600,
                          fontSize: '1rem',
                          boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                            background: 'linear-gradient(45deg, #2e7d32, #1b5e20)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                      },
                          transition: 'all 0.3s ease'
                    }}
                  >
                    ➕ Add Another Question
                  </Button>
                </Box>
              </Grid>

                  {/* Question Validation Errors - Only show question-related errors here */}
              <Grid item xs={12}>
                    {errors?.questions && formatQuestionErrors(errors).length > 0 && (
                      <Card 
                        data-question-errors
                        sx={{ 
                          p: 3, 
                          bgcolor: 'error.light', 
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: 'error.main',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                          mt: 2
                        }}>
                        <Typography variant="h6" color="error" sx={{ fontWeight: 600, mb: 2 }}>
                          Please fix the following question errors:
                        </Typography>
                        <List sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.5)', 
                          borderRadius: 2,
                          py: 1
                        }}>
                          {formatQuestionErrors(errors).map((errorMsg, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <ErrorIcon color="error" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={errorMsg}
                                primaryTypographyProps={{
                                  sx: {
                                    color: '#d32f2f',
                                    fontWeight: 500,
                                    fontSize: '0.95rem'
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Card>
                )}
              </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Submit Button Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                sx={{
                  ...gradientButtonStyle,
                  minWidth: 200,
                  height: 56,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(59, 42, 159, 0.4)',
                  '&:hover': {
                    ...gradientButtonStyle['&:hover'],
                    transform: isSubmitting ? 'none' : 'translateY(-3px)',
                    boxShadow: isSubmitting ? '0 8px 24px rgba(59, 42, 159, 0.4)' : '0 12px 32px rgba(59, 42, 159, 0.5)'
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  },
                  transition: 'all 0.3s ease'
                }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                      {editingExam ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingExam ? 'Update Exam' : 'Create Exam'
                  )}
                </Button>
            </Box>
          </form>
        </Box>
      )}

      {/* Enhanced View Exam Details Modal */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 3,
          px: 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QuizIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {viewingExam?.name}
          </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Exam Questions & Details
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setViewDialog(false)}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          {viewingExam && (
            <Box>
              <Card sx={{ 
                mb: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`${viewingExam.questions?.length || 0} Questions`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        height: 36
                      }}
                      icon={<QuizIcon sx={{ color: 'white !important' }} />}
                    />
                    <Chip 
                      label={`${viewingExam.duration_minutes} minutes`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        height: 36
                      }}
                      icon={<TimeIcon sx={{ color: 'white !important' }} />}
                    />
                    <Chip 
                      label={`${viewingExam.price} ${viewingExam.currency || '€'}`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        height: 36
                      }}
                      icon={<EuroIcon sx={{ color: 'white !important' }} />}
                    />
                  </Box>
                </CardContent>
              </Card>
              
              {viewingExam.questions?.map((question, index) => (
                <Card key={question.id} sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.95)',
                  overflow: 'hidden',
                  border: '2px solid transparent',
                  '&:hover': {
                    borderColor: '#667eea',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2, 
                      mb: 3,
                      pb: 2,
                      borderBottom: '2px solid',
                      borderColor: 'divider'
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}>
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#263238', mb: 1 }}>
                          {question.question_text}
                  </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            label={`${question.marks} marks`} 
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          <Chip 
                            label={`${question.duration_in_sec}s`} 
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>
                  </Box>

                    <Grid container spacing={2}>
                    {question.options?.map((option, optIndex) => (
                      <Grid item xs={12} sm={6} key={option.id}>
                        <Box sx={{
                            p: 2,
                            border: '2px solid',
                          borderColor: option.option_text === question.correct_answer ? '#4caf50' : '#e0e0e0',
                            borderRadius: 2,
                            background: option.option_text === question.correct_answer 
                              ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' 
                              : '#f9f9f9',
                          display: 'flex',
                          alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: option.option_text === question.correct_answer 
                                ? 'linear-gradient(135deg, #4caf50, #2e7d32)' 
                                : '#e0e0e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + optIndex)}
                            </Box>
                          <Typography 
                              variant="body1" 
                            sx={{ 
                              fontWeight: option.option_text === question.correct_answer ? 600 : 400,
                                color: option.option_text === question.correct_answer ? '#2e7d32' : 'text.primary',
                                flex: 1
                            }}
                          >
                            {option.option_text}
                          </Typography>
                            {option.option_text === question.correct_answer && (
                              <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700
                              }}>
                                ✓
                              </Box>
                            )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          py: 2.5,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DeleteIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete Mock Exam
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this mock exam?
          </Typography>
          {deleteDialog.exam && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {deleteDialog.exam.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deleteDialog.exam.description?.substring(0, 100)}...
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 500 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderColor: 'grey.400',
              color: 'grey.700',
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deletingExamId !== null}
            startIcon={deletingExamId !== null ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)'
              }
            }}
          >
            {deletingExamId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MockExam;
