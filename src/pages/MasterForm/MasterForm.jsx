import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../api';

// Entity configurations based on the complete API specifications
// 
// STATUS COLUMN LOGIC:
// - Entities WITH status field: schools, genders, regions, target_schools, days, months, years
//   → Show ONLY their own status column (no automatic Status column)
//   → Status values: 'active'/'inactive' for schools, 1/2/3 for others
//   → Deletion info shown below status chip when deleted_at exists
// 
// - Entities WITHOUT status field: formats, weekdays, academic_years, weeks  
//   → Show automatic Status column (Active/Deleted based on deleted_at)
//   → academic_years also hides Created At column
//
// - All entities show red border, background tint, and reduced opacity when deleted_at !== null
//
const ENTITY_CONFIGS = {
  schools: { 
    name: 'Schools', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 255, label: 'School Name' },
      { name: 'address', type: 'text', required: false, maxLength: 255, label: 'Address' },
      { name: 'phone', type: 'tel', required: false, maxLength: 255, label: 'Phone' },
      { name: 'email', type: 'email', required: false, maxLength: 255, label: 'Email' },
      { name: 'logo', type: 'text', required: false, maxLength: 255, label: 'Logo URL' },
      { name: 'website', type: 'url', required: false, maxLength: 255, label: 'Website' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]}
    ]
  },
  // roles: { name: 'Roles', fields: [{ name: 'name', type: 'text', required: true, maxLength: 255, label: 'Role Name' }] }, // Hidden/Commented out
  genders: { 
    name: 'Genders', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 60, label: 'Gender Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  regions: { 
    name: 'Regions', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 100, label: 'Region Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  // formats: { 
  //   name: 'Formats', 
  //   fields: [
  //     { name: 'name', type: 'text', required: true, maxLength: 255, label: 'Format Name' },
  //     { name: 'description', type: 'textarea', required: false, label: 'Description' }
  //   ]
  // },
  target_schools: { 
    name: 'Target Schools', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 20, label: 'Target School Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  days: { 
    name: 'Days', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 2, label: 'Day Code (e.g., Mo, Tu)' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  months: { 
    name: 'Months', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 10, label: 'Month Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  weekdays: { 
    name: 'Weekdays', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 255, label: 'Weekday Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  years: { 
    name: 'Years', 
    fields: [
      { name: 'name', type: 'number', required: true, min: 1900, max: 2100, label: 'Year' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  locations: { 
    name: 'Locations', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 255, label: 'Location Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  subjects: { 
    name: 'Subjects', 
    fields: [
      { name: 'name', type: 'text', required: true, maxLength: 255, label: 'Subject Name' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ]
  },
  academic_years: { 
    name: 'Academic Years', 
    fields: [
      { name: 'start_year', type: 'number', required: true, min: 1900, max: 2100, label: 'Start Year', placeholder: 'e.g., 2025' },
      { name: 'end_year', type: 'number', required: true, min: 1900, max: 2100, label: 'End Year', placeholder: 'e.g., 2026' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ],
    type: 'academic'
  },
  weeks: { 
    name: 'Weeks', 
    fields: [
      { name: 'academic_year_id', type: 'select', required: true, label: 'Academic Year' },
      { name: 'week_number', type: 'text', required: true, maxLength: 2, label: 'Week Number', placeholder: 'e.g., 1' },
      { name: 'start_date', type: 'datetime-local', required: true, label: 'Start Date' },
      { name: 'end_date', type: 'datetime-local', required: true, label: 'End Date' },
      { name: 'status', type: 'select', required: false, label: 'Status', options: [
        { value: 1, label: 'Pending' },
        { value: 2, label: 'Approved' },
        { value: 3, label: 'Rejected' }
      ]}
    ],
    type: 'weeks'
  }
};

// Dynamic validation schema generator based on field configurations
const getValidationSchema = (entityType) => {
  const config = ENTITY_CONFIGS[entityType];
  if (!config) {
    return yup.object({
      name: yup.string().required('Name is required').max(255)
    });
  }

  const schemaFields = {};
  
  config.fields.forEach(field => {
    let validator;
    
    switch (field.type) {
      case 'number':
        validator = yup.number();
        if (field.required) validator = validator.required(`${field.label} is required`);
        if (field.min) validator = validator.min(field.min, `${field.label} must be at least ${field.min}`);
        if (field.max) validator = validator.max(field.max, `${field.label} must not exceed ${field.max}`);
        break;
        
      case 'email':
        validator = yup.string();
        if (field.required) validator = validator.required(`${field.label} is required`);
        if (field.maxLength) validator = validator.max(field.maxLength, `${field.label} must not exceed ${field.maxLength} characters`);
        validator = validator.email('Must be a valid email address');
        break;
        
      case 'url':
        validator = yup.string();
        if (field.required) validator = validator.required(`${field.label} is required`);
        if (field.maxLength) validator = validator.max(field.maxLength, `${field.label} must not exceed ${field.maxLength} characters`);
        validator = validator.url('Must be a valid URL');
        break;
        
      case 'select':
        if (field.options && field.options.length > 0) {
          const validValues = field.options.map(opt => opt.value);
          validator = yup.mixed();
          if (field.required) validator = validator.required(`${field.label} is required`);
          validator = validator.oneOf(validValues, `${field.label} must be one of: ${validValues.join(', ')}`);
        } else {
          validator = yup.mixed();
          if (field.required) validator = validator.required(`${field.label} is required`);
        }
        break;
        
      case 'datetime-local':
        validator = yup.string();
        if (field.required) validator = validator.required(`${field.label} is required`);
        break;
        
      default: // text, textarea, tel
        validator = yup.string();
        if (field.required) validator = validator.required(`${field.label} is required`);
        if (field.maxLength) validator = validator.max(field.maxLength, `${field.label} must not exceed ${field.maxLength} characters`);
        break;
    }
    
    schemaFields[field.name] = validator;
  });
  
  // Special validation for academic years
  if (entityType === 'academic_years') {
    // Add custom validation for consecutive years
    schemaFields.end_year = schemaFields.end_year.test(
      'consecutive-years',
      'End year must be exactly one year after start year',
      function(value) {
        const startYear = this.parent.start_year;
        if (!startYear || !value) return true; // Let required validation handle empty values
        return parseInt(value) === parseInt(startYear) + 1;
      }
    );
  }
  
  // Special validation for weeks dates
  if (entityType === 'weeks') {
    // Add custom validation for week_number (string that represents 1-52)
    schemaFields.week_number = schemaFields.week_number.test(
      'valid-week-number',
      'Week number must be between 1 and 52',
      function(value) {
        if (!value) return true; // Let required validation handle empty values
        const weekNum = parseInt(value);
        return !isNaN(weekNum) && weekNum >= 1 && weekNum <= 52;
      }
    );
    
    schemaFields.end_date = schemaFields.end_date.test(
      'after-start-date',
      'End date must be after start date',
      function(value) {
        if (!value || !this.parent.start_date) return true;
        return new Date(value) > new Date(this.parent.start_date);
      }
    );
  }
  
  return yup.object(schemaFields);
};

const MasterForm = () => {
  // State management
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [records, setRecords] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entitiesLoading, setEntitiesLoading] = useState(true);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [restoringRecordId, setRestoringRecordId] = useState(null);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    severity: 'warning'
  });
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage, setPerPage] = useState(15);
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Form setup
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(selectedEntity ? getValidationSchema(selectedEntity) : yup.object())
  });

  // Helper function to show confirmation dialog
  const showConfirmDialog = (title, message, onConfirm, options = {}) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      severity: options.severity || 'warning'
    });
  };

  // Helper function to close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false, onConfirm: null }));
  };

  // Fetch available entities on component mount
  useEffect(() => {
    fetchEntities();
  }, []);

  // Fetch records when entity or pagination changes
  useEffect(() => {
    if (selectedEntity) {
      fetchRecords();
    }
  }, [selectedEntity, currentPage, perPage, includeDeleted]);

  // Fetch academic years for weeks entity
  useEffect(() => {
    if (selectedEntity === 'weeks') {
      fetchAcademicYears();
    }
  }, [selectedEntity]);

  const fetchEntities = async () => {
    try {
      setEntitiesLoading(true);
      const response = await api.get('admin/master-form/entities');
      if (response.data.success) {
        // Filter out roles and formats entities from the API response
        const filteredEntities = response.data.data.filter(entity => entity !== 'roles' && entity !== 'formats');
        setEntities(filteredEntities);
        if (filteredEntities.length > 0) {
          setSelectedEntity(filteredEntities[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch entities');
      console.error('Error fetching entities:', error);
    } finally {
      setEntitiesLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!selectedEntity) return;
    
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        include_trashed: includeDeleted
      };
      
      // Try to include academic year relationship for weeks
      if (selectedEntity === 'weeks') {
        params.with = 'academic_year';
      }
      
      const response = await api.get(`admin/master-form/${selectedEntity}`, { params });
      if (response.data.success) {
        const recordsData = response.data.data.data || [];
        setRecords(recordsData);
        setTotalPages(response.data.data.last_page || 1);
        setTotalRecords(response.data.data.total || 0);
        
        // Debug log for weeks data
        if (selectedEntity === 'weeks') {
          console.log('Weeks data received:', recordsData);
          console.log('Sample record:', recordsData[0]);
          console.log('Academic years in state:', academicYears);
          
          // If academic year relationship is not loaded, ensure we have academic years in state
          if (recordsData.length > 0 && !recordsData[0].academic_year && academicYears.length === 0) {
            console.log('Academic year relationship not loaded, fetching academic years...');
            fetchAcademicYears();
          }
          
          // Log each record's academic year info
          recordsData.forEach((record, index) => {
            console.log(`Record ${index + 1}:`, {
              id: record.id,
              academic_year_id: record.academic_year_id,
              academic_year: record.academic_year,
              week_number: record.week_number
            });
          });
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch ${ENTITY_CONFIGS[selectedEntity]?.name || selectedEntity}`);
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      setAcademicYearsLoading(true);
      const response = await api.get('admin/master-form/academic_years', {
        params: { per_page: 100 } // Get more records to ensure we have all academic years
      });
      if (response.data.success) {
        const academicYearData = response.data.data.data || [];
        setAcademicYears(academicYearData);
        console.log('Academic years loaded:', academicYearData); // Debug log
        
        if (academicYearData.length === 0) {
          toast.warning('No academic years found. Please create academic years first.');
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      toast.error('Failed to fetch academic years');
    } finally {
      setAcademicYearsLoading(false);
    }
  };

  // Calculate week dates based on academic year and week number
  const calculateWeekDates = async (academicYearId, weekNumber) => {
    try {
      // Find the selected academic year
      const selectedAcademicYear = academicYears.find(year => year.id === parseInt(academicYearId));
      if (!selectedAcademicYear || !selectedAcademicYear.start_end_year) {
        console.log('Academic year not found or missing start_end_year');
        return;
      }

      // Parse the academic year to get start and end years
      const [startYear, endYear] = selectedAcademicYear.start_end_year.split('/').map(Number);
      
      // Academic year typically starts in June and ends in May of next year
      // For simplicity, let's assume it starts on June 1st
      const academicYearStart = new Date(startYear, 5, 1); // June 1st (month 5 = June)
      
      // Calculate the start date of the specified week
      // Week 1 starts on the first Monday of the academic year
      const firstMonday = new Date(academicYearStart);
      const dayOfWeek = firstMonday.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Fix Monday calculation logic
      let daysToAdd;
      if (dayOfWeek === 1) {
        // Already Monday
        daysToAdd = 0;
      } else if (dayOfWeek === 0) {
        // Sunday, add 1 day to get to Monday
        daysToAdd = 1;
      } else {
        // Tuesday-Saturday, calculate days to next Monday
        daysToAdd = 8 - dayOfWeek;
      }
      
      firstMonday.setDate(firstMonday.getDate() + daysToAdd);
      
      // Calculate the start date for the specified week number
      const weekStartDate = new Date(firstMonday);
      weekStartDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
      weekStartDate.setHours(0, 0, 0, 0); // Set to 00:00:00 for Monday start
      
      // Calculate the end date (Sunday at 22:00 as per backend requirements)
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6); // Add 6 days to get to Sunday
      weekEndDate.setHours(22, 0, 0, 0); // Set to 22:00:00
      
      // Debug logging to verify Monday calculation
      if (process.env.NODE_ENV === 'development') {
        console.log('Week calculation debug:', {
          academicYear: selectedAcademicYear.start_end_year,
          academicYearStart: academicYearStart.toDateString(),
          firstMonday: firstMonday.toDateString(),
          weekNumber: weekNumber,
          weekStartDate: weekStartDate.toDateString() + ' ' + weekStartDate.toTimeString(),
          weekEndDate: weekEndDate.toDateString() + ' ' + weekEndDate.toTimeString(),
          startDayOfWeek: weekStartDate.getDay(), // Should be 1 (Monday)
          endDayOfWeek: weekEndDate.getDay() // Should be 0 (Sunday)
        });
      }
      
      // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
      const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      const startDateFormatted = formatDateTimeLocal(weekStartDate);
      const endDateFormatted = formatDateTimeLocal(weekEndDate);
      
      // Set the calculated dates in the form
      setValue('start_date', startDateFormatted);
      setValue('end_date', endDateFormatted);
      
      // Show a helpful toast message
      toast.success(`Week ${weekNumber} dates calculated: ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`);
      
    } catch (error) {
      console.error('Error calculating week dates:', error);
      toast.error('Failed to calculate week dates');
    }
  };

  // Helper function to adjust date to nearest Monday (for start date)
  const adjustToMonday = (date) => {
    const newDate = new Date(date);
    const dayOfWeek = newDate.getDay();
    
    if (dayOfWeek === 1) {
      // Already Monday
      return newDate;
    } else if (dayOfWeek === 0) {
      // Sunday, go forward 1 day to Monday
      newDate.setDate(newDate.getDate() + 1);
    } else {
      // Tuesday-Saturday, go back to previous Monday
      newDate.setDate(newDate.getDate() - (dayOfWeek - 1));
    }
    
    newDate.setHours(0, 0, 0, 0); // Set to 00:00
    return newDate;
  };

  // Helper function to adjust date to nearest Sunday (for end date)
  const adjustToSunday = (date) => {
    const newDate = new Date(date);
    const dayOfWeek = newDate.getDay();
    
    if (dayOfWeek === 0) {
      // Already Sunday
      newDate.setHours(22, 0, 0, 0); // Set to 22:00
      return newDate;
    } else {
      // Monday-Saturday, go forward to next Sunday
      newDate.setDate(newDate.getDate() + (7 - dayOfWeek));
      newDate.setHours(22, 0, 0, 0); // Set to 22:00
      return newDate;
    }
  };

  const handleEntityChange = (entity) => {
    setSelectedEntity(entity);
    setCurrentPage(1);
    setRecords([]);
    reset();
    
    // Load academic years when switching to weeks entity
    if (entity === 'weeks') {
      fetchAcademicYears();
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setViewMode(false);
    setCurrentRecord(null);
    reset();
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setViewMode(false);
    setCurrentRecord(record);
    
    // Dynamically populate form fields based on entity configuration
    const config = ENTITY_CONFIGS[selectedEntity];
    if (config && config.fields) {
      config.fields.forEach(fieldConfig => {
        let value = record[fieldConfig.name];
        
        // Special handling for Academic Years - parse start_end_year to populate start_year and end_year
        if (selectedEntity === 'academic_years' && (fieldConfig.name === 'start_year' || fieldConfig.name === 'end_year')) {
          const startEndYear = record.start_end_year;
          if (startEndYear && typeof startEndYear === 'string' && startEndYear.includes('/')) {
            const [startYear, endYear] = startEndYear.split('/');
            value = fieldConfig.name === 'start_year' ? parseInt(startYear) : parseInt(endYear);
          }
        }
        // Handle special cases for different field types
        else if (fieldConfig.type === 'datetime-local' && value) {
          // Convert datetime to datetime-local format (remove seconds if present)
          value = value.split(' ')[0] + 'T' + value.split(' ')[1]?.substring(0, 5) || value.split(' ')[0];
        } else if (fieldConfig.type === 'number' && value) {
          value = parseInt(value);
        }
        
        setValue(fieldConfig.name, value || '');
      });
    }
    
    setDialogOpen(true);
  };

  const handleView = (record) => {
    setViewMode(true);
    setEditMode(false);
    setCurrentRecord(record);
    
    // Dynamically populate form fields based on entity configuration
    const config = ENTITY_CONFIGS[selectedEntity];
    if (config && config.fields) {
      config.fields.forEach(fieldConfig => {
        let value = record[fieldConfig.name];
        
        // Special handling for Academic Years - parse start_end_year to populate start_year and end_year
        if (selectedEntity === 'academic_years' && (fieldConfig.name === 'start_year' || fieldConfig.name === 'end_year')) {
          const startEndYear = record.start_end_year;
          if (startEndYear && typeof startEndYear === 'string' && startEndYear.includes('/')) {
            const [startYear, endYear] = startEndYear.split('/');
            value = fieldConfig.name === 'start_year' ? parseInt(startYear) : parseInt(endYear);
          }
        }
        // Handle special cases for different field types
        else if (fieldConfig.type === 'datetime-local' && value) {
          // Convert datetime to datetime-local format (remove seconds if present)
          value = value.split(' ')[0] + 'T' + value.split(' ')[1]?.substring(0, 5) || value.split(' ')[0];
        } else if (fieldConfig.type === 'number' && value) {
          value = parseInt(value);
        }
        
        setValue(fieldConfig.name, value || '');
      });
    }
    
    setDialogOpen(true);
  };

  const handleDelete = async (record) => {
    const entityName = ENTITY_CONFIGS[selectedEntity]?.name.slice(0, -1) || 'record';
    const recordName = record.name || record.week_number || record.start_end_year || `${entityName} #${record.id}`;
    
    showConfirmDialog(
      'Delete Confirmation',
      `Are you sure you want to delete "${recordName}"?\n\nThis action cannot be undone.`,
      () => performDelete(record),
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
        severity: 'error'
      }
    );
  };

  const performDelete = async (record) => {
    const entityName = ENTITY_CONFIGS[selectedEntity]?.name.slice(0, -1) || 'record';
    
    try {
      setDeletingRecordId(record.id);
      const response = await api.delete(`admin/master-form/${selectedEntity}/${record.id}`);
      if (response.data.success) {
        toast.success(response.data.message || `${entityName} deleted successfully`);
        fetchRecords();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Record not found');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.keys(errors).forEach(key => {
            toast.error(`${key}: ${errors[key].join(', ')}`);
          });
        } else {
          toast.error('Validation error occurred');
        }
      } else {
        toast.error('Failed to delete record');
      }
      console.error('Error deleting record:', error);
    } finally {
      setDeletingRecordId(null);
    }
  };

  const handleRestore = async (record) => {
    const entityName = ENTITY_CONFIGS[selectedEntity]?.name.slice(0, -1) || 'record';
    const recordName = record.name || record.week_number || record.start_end_year || `${entityName} #${record.id}`;
    
    showConfirmDialog(
      'Restore Confirmation',
      `Are you sure you want to restore "${recordName}"?`,
      () => performRestore(record),
      {
        confirmText: 'Restore',
        cancelText: 'Cancel',
        severity: 'info'
      }
    );
  };

  const performRestore = async (record) => {
    const entityName = ENTITY_CONFIGS[selectedEntity]?.name.slice(0, -1) || 'record';

    try {
      setRestoringRecordId(record.id);
      const response = await api.post(`admin/master-form/${selectedEntity}/${record.id}/restore`);
      if (response.data.success) {
        toast.success(response.data.message || `${entityName} restored successfully`);
        fetchRecords();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Cannot restore this record');
      } else if (error.response?.status === 404) {
        toast.error('Record not found');
      } else {
        toast.error('Failed to restore record');
      }
      console.error('Error restoring record:', error);
    } finally {
      setRestoringRecordId(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      let response;
      
      // Format data based on entity type
      let formattedData = { ...data };
      if (selectedEntity === 'weeks') {
        // Validate week number
        const weekNumber = parseInt(data.week_number);
        if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 52) {
          toast.error('Week number must be between 1 and 52');
          setSubmitting(false);
          return;
        }
        
        // Format dates according to backend requirements
        // Convert datetime-local format to proper ISO format
        // Use local date parsing to avoid timezone issues
        const [startDateStr, startTimeStr] = data.start_date.split('T');
        const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
        let startDate = new Date(startYear, startMonth - 1, startDay, ...startTimeStr.split(':').map(Number));
        
        const [endDateStr, endTimeStr] = data.end_date.split('T');
        const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
        let endDate = new Date(endYear, endMonth - 1, endDay, ...endTimeStr.split(':').map(Number));
        
        // Debug logging for date validation
        if (process.env.NODE_ENV === 'development') {
          console.log('Date validation debug:', {
            startDateInput: data.start_date,
            endDateInput: data.end_date,
            startDate: startDate.toString(),
            endDate: endDate.toString(),
            startDayOfWeek: startDate.getDay(),
            endDayOfWeek: endDate.getDay(),
            endHours: endDate.getHours()
          });
        }
        
        // Auto-correct dates if they're not Monday/Sunday
        let correctedStartDate = startDate;
        let correctedEndDate = endDate;
        let datesCorrected = false;
        
        if (startDate.getDay() !== 1) {
          correctedStartDate = adjustToMonday(startDate);
          datesCorrected = true;
        }
        
        if (endDate.getDay() !== 0) {
          correctedEndDate = adjustToSunday(endDate);
          datesCorrected = true;
        }
        
        // If dates were corrected, show a warning but continue
        if (datesCorrected) {
          toast.warning('Dates have been auto-corrected to follow Monday-Sunday pattern');
          console.log('Dates corrected:', {
            originalStart: startDate.toString(),
            correctedStart: correctedStartDate.toString(),
            originalEnd: endDate.toString(),
            correctedEnd: correctedEndDate.toString()
          });
        }
        
        // Use corrected dates for backend submission
        startDate = correctedStartDate;
        endDate = correctedEndDate;
        
        // Format data for backend
        formattedData.academic_year_id = parseInt(data.academic_year_id);
        formattedData.week_number = String(weekNumber); // Backend expects string, not integer
        formattedData.start_date = startDate.toISOString().slice(0, 19); // Remove milliseconds
        formattedData.end_date = endDate.toISOString().slice(0, 19); // Remove milliseconds
        formattedData.status = parseInt(data.status) || 1; // Default to Pending if not set
      }
      
      // Academic Years validation and formatting (Enhanced to match backend validation)
      if (selectedEntity === 'academic_years') {
        const startYear = parseInt(data.start_year);
        const endYear = parseInt(data.end_year);
        
        // Validate data types
        if (isNaN(startYear) || isNaN(endYear)) {
          toast.error('Both years must be valid numbers');
          setSubmitting(false);
          return;
        }
        
        // Validate year range (1900-2100)
        if (startYear < 1900 || startYear > 2100 || endYear < 1900 || endYear > 2100) {
          toast.error('Years must be between 1900 and 2100');
          setSubmitting(false);
          return;
        }
        
        // Validate consecutive years (end_year must equal start_year + 1)
        if (endYear !== startYear + 1) {
          toast.error('Must be consecutive years (e.g., 2025/2026, not 2025/2028)');
          setSubmitting(false);
          return;
        }
        
        // Format data to match backend expectations
        formattedData.start_year = startYear;
        formattedData.end_year = endYear;
        formattedData.status = parseInt(data.status) || 1; // Default to Pending if not set
      }

      // Debug logging for API request
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request Debug:', {
          method: editMode ? 'PUT' : 'POST',
          endpoint: editMode ? `admin/master-form/${selectedEntity}/${currentRecord?.id}` : `admin/master-form/${selectedEntity}`,
          payload: formattedData,
          entity: selectedEntity
        });
      }

      if (editMode && currentRecord) {
        response = await api.put(`admin/master-form/${selectedEntity}/${currentRecord.id}`, formattedData);
      } else {
        response = await api.post(`admin/master-form/${selectedEntity}`, formattedData);
      }

      if (response.data.success) {
        const entityName = ENTITY_CONFIGS[selectedEntity]?.name.slice(0, -1) || 'Record';
        toast.success(response.data.message || `${entityName} ${editMode ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        reset();
        fetchRecords();
      }
    } catch (error) {
      // Enhanced error logging
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          data: error.config?.data
        }
      });

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        console.log('Validation errors:', errors);
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key].join(', ')}`);
        });
      } else if (error.response?.status === 404) {
        toast.error('Record not found');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 500) {
        toast.error(`Server error: ${error.response?.data?.message || 'Internal server error'}`);
      } else if (error.response) {
        // API responded with error status
        toast.error(`API Error (${error.response.status}): ${error.response?.data?.message || error.response.statusText}`);
      } else if (error.request) {
        // Network error
        toast.error('Network error: Unable to reach server');
      } else {
        // Other error
        toast.error(`Failed to ${editMode ? 'update' : 'create'} record: ${error.message}`);
      }
      console.error('Error saving record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Test function to manually test weeks API
  const testWeeksAPI = async () => {
    try {
      const testData = {
        academic_year_id: 8,
        week_number: "1",
        start_date: "2027-06-07T00:00:00",
        end_date: "2027-06-13T22:00:00",
        status: 1
      };
      
      console.log('Testing weeks API with data:', testData);
      const response = await api.post('admin/master-form/weeks', testData);
      console.log('Test API Response:', response.data);
      toast.success('Test API call successful!');
    } catch (error) {
      console.error('Test API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(`Test API failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Add this to window for manual testing
  if (process.env.NODE_ENV === 'development') {
    window.testWeeksAPI = testWeeksAPI;
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentRecord(null);
    setEditMode(false);
    setViewMode(false);
    reset();
  };

  const renderFormFields = () => {
    if (!selectedEntity) return null;

    const config = ENTITY_CONFIGS[selectedEntity];
    if (!config || !config.fields) return null;

    return (
      <Grid container spacing={2}>
        {config.fields.map((fieldConfig) => {
          const gridSize = config.fields.length > 2 ? 12 : 6;
          
          return (
            <Grid item xs={12} sm={fieldConfig.type === 'textarea' ? 12 : gridSize} key={fieldConfig.name}>
              <Controller
                name={fieldConfig.name}
                control={control}
                defaultValue=""
                render={({ field }) => {
                  const fieldError = errors[fieldConfig.name];
                  
                  // Handle different field types
                  switch (fieldConfig.type) {
                    case 'select':
                      // Special handling for academic_year_id in weeks
                      if (fieldConfig.name === 'academic_year_id') {
                        return (
                          <FormControl fullWidth error={!!fieldError}>
                            <InputLabel>{fieldConfig.label} {fieldConfig.required && '*'}</InputLabel>
                            <Select
                              {...field}
                              label={fieldConfig.label}
                              disabled={viewMode || academicYearsLoading}
                              onChange={(e) => {
                                field.onChange(e);
                                // Auto-suggest week dates when academic year changes for weeks
                                if (selectedEntity === 'weeks') {
                                  const academicYearId = e.target.value;
                                  const weekNumber = parseInt(control._formValues.week_number);
                                  if (academicYearId && !isNaN(weekNumber) && weekNumber >= 1 && weekNumber <= 52) {
                                    calculateWeekDates(academicYearId, weekNumber);
                                  }
                                }
                              }}
                            >
                              {academicYearsLoading ? (
                                <MenuItem disabled>
                                  <Typography variant="body2" color="text.secondary">
                                    Loading academic years...
                                  </Typography>
                                </MenuItem>
                              ) : academicYears.length === 0 ? (
                                <MenuItem disabled>
                                  <Typography variant="body2" color="text.secondary">
                                    No academic years available
                                  </Typography>
                                </MenuItem>
                              ) : (
                                academicYears.map((year) => (
                                  <MenuItem key={year.id} value={year.id}>
                                    {year.start_end_year || `${year.start_year}/${year.end_year}`}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                            {fieldError && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                {fieldError.message}
                              </Typography>
                            )}
                          </FormControl>
                        );
                      }
                      
                      // Regular select field
                      return (
                        <FormControl fullWidth error={!!fieldError}>
                          <InputLabel>{fieldConfig.label} {fieldConfig.required && '*'}</InputLabel>
                          <Select
                            {...field}
                            label={fieldConfig.label}
                            disabled={viewMode}
                          >
                            {fieldConfig.options?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldError && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                              {fieldError.message}
                            </Typography>
                          )}
                        </FormControl>
                      );
                      
                    case 'textarea':
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          label={`${fieldConfig.label} ${fieldConfig.required ? '*' : ''}`}
                          error={!!fieldError}
                          helperText={fieldError?.message}
                          disabled={viewMode}
                          inputProps={{ maxLength: fieldConfig.maxLength }}
                        />
                      );
                      
                    case 'datetime-local':
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label={`${fieldConfig.label} ${fieldConfig.required ? '*' : ''}`}
                          type="datetime-local"
                          error={!!fieldError}
                          helperText={fieldError?.message}
                          disabled={viewMode}
                          InputLabelProps={{ shrink: true }}
                        />
                      );
                      
                    case 'number':
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label={`${fieldConfig.label} ${fieldConfig.required ? '*' : ''}`}
                          type="number"
                          error={!!fieldError}
                          helperText={fieldError?.message}
                          disabled={viewMode}
                          inputProps={{ 
                            min: fieldConfig.min, 
                            max: fieldConfig.max,
                            maxLength: fieldConfig.maxLength 
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-fill end year when start year changes for academic_years
                            if (selectedEntity === 'academic_years' && fieldConfig.name === 'start_year') {
                              const startYear = parseInt(e.target.value);
                              if (!isNaN(startYear)) {
                                setValue('end_year', startYear + 1);
                              }
                            }
                          }}
                        />
                      );
                      
                    default: // text, email, url, tel
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label={`${fieldConfig.label} ${fieldConfig.required ? '*' : ''}`}
                          type={fieldConfig.type}
                          placeholder={fieldConfig.placeholder}
                          error={!!fieldError}
                          helperText={fieldError?.message}
                          disabled={viewMode}
                          inputProps={{ maxLength: fieldConfig.maxLength }}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-suggest week dates when week number changes for weeks
                            if (selectedEntity === 'weeks' && fieldConfig.name === 'week_number') {
                              const weekNumber = parseInt(e.target.value);
                              const academicYearId = control._formValues.academic_year_id;
                              if (!isNaN(weekNumber) && academicYearId && weekNumber >= 1 && weekNumber <= 52) {
                                calculateWeekDates(academicYearId, weekNumber);
                              }
                            }
                          }}
                        />
                      );
                  }
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderTableHeaders = () => {
    if (!selectedEntity) return null;

    const config = ENTITY_CONFIGS[selectedEntity];
    if (!config) return null;

    // Check if entity already has a status field
    const hasStatusField = config.fields.some(field => field.name === 'status');
    
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Entity: ${selectedEntity}, Has Status Field: ${hasStatusField}`);
      console.log('Fields:', config.fields.map(f => f.name));
    }

    return (
      <>
        <TableCell>ID</TableCell>
        {config.fields.map((field) => (
          <TableCell key={field.name}>
            {field.label}
          </TableCell>
        ))}
        {selectedEntity !== 'academic_years' && <TableCell>Created At</TableCell>}
        {!hasStatusField && selectedEntity !== 'schools' && <TableCell>Status</TableCell>}
        <TableCell align="center">Actions</TableCell>
      </>
    );
  };

  const renderTableRow = (record) => {
    if (!selectedEntity) return null;

    const config = ENTITY_CONFIGS[selectedEntity];
    if (!config) return null;

    const isDeleted = record.deleted_at !== null;

    // Helper function to render field value with fancy styling
    const renderFieldValue = (fieldConfig, value, currentRecord = null) => {
      // Special handling for Academic Years - parse start_end_year to display start_year and end_year
      if (selectedEntity === 'academic_years' && (fieldConfig.name === 'start_year' || fieldConfig.name === 'end_year')) {
        const startEndYear = currentRecord?.start_end_year;
        
        // Debug logging for Academic Years parsing
        if (process.env.NODE_ENV === 'development') {
          console.log('Academic Years parsing:', {
            fieldName: fieldConfig.name,
            startEndYear: startEndYear,
            currentRecord: currentRecord
          });
        }
        
        if (startEndYear && typeof startEndYear === 'string' && startEndYear.includes('/')) {
          const [startYear, endYear] = startEndYear.split('/');
          const displayValue = fieldConfig.name === 'start_year' ? startYear : endYear;
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {displayValue}
            </Typography>
          );
        }
        return <Typography variant="body2" color="text.secondary">—</Typography>;
      }

      if (!value && value !== 0) return <Typography variant="body2" color="text.secondary">—</Typography>;

      switch (fieldConfig.type) {
        case 'select':
          // Handle status fields with colored chips
          if (fieldConfig.name === 'status' && fieldConfig.options) {
            const option = fieldConfig.options.find(opt => 
              opt.value === value || opt.value === parseInt(value) || opt.value === String(value)
            );
            
            // Debug logging for status field rendering
            if (process.env.NODE_ENV === 'development') {
              console.log('Status field debug:', {
                fieldName: fieldConfig.name,
                value: value,
                valueType: typeof value,
                options: fieldConfig.options,
                foundOption: option
              });
            }
            // Enhanced color mapping for all status types
            const colors = { 
              // Numeric statuses (1=Pending, 2=Approved, 3=Rejected)
              1: 'warning', 
              2: 'success', 
              3: 'error',
              // String numeric statuses
              '1': 'warning',
              '2': 'success', 
              '3': 'error',
              // String statuses for schools
              'active': 'success', 
              'inactive': 'warning',
              // Additional safety for any other values
              'pending': 'warning',
              'approved': 'success', 
              'rejected': 'error'
            };
            
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Chip
                  label={option?.label || value}
                  size="small"
                  color={colors[value] || 'default'}
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
                {/* Show deletion info for status fields too */}
                {currentRecord?.deleted_at && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 0.5,
                    mt: 0.5,
                    p: 0.5,
                    backgroundColor: 'error.light',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.main'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: 'error.dark', 
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      🗑️ Deleted: {new Date(currentRecord.deleted_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }
          
          // Handle academic_year_id for weeks
          if (fieldConfig.name === 'academic_year_id') {
            let academicYearDisplay = 'N/A';
            if (record.academic_year) {
              if (record.academic_year.start_end_year) {
                academicYearDisplay = record.academic_year.start_end_year;
              } else if (record.academic_year.start_year && record.academic_year.end_year) {
                academicYearDisplay = `${record.academic_year.start_year}/${record.academic_year.end_year}`;
              }
            } else if (value && academicYears.length > 0) {
              const foundYear = academicYears.find(year => year.id === value);
              if (foundYear) {
                if (foundYear.start_end_year) {
                  academicYearDisplay = foundYear.start_end_year;
                } else if (foundYear.start_year && foundYear.end_year) {
                  academicYearDisplay = `${foundYear.start_year}/${foundYear.end_year}`;
                }
              }
            }
            return (
              <Chip
                label={academicYearDisplay}
                size="small"
                color={academicYearDisplay !== 'N/A' ? 'primary' : 'default'}
                variant="outlined"
              />
            );
          }
          
          // Regular select field
          const option = fieldConfig.options?.find(opt => opt.value === value);
          return (
            <Chip
              label={option?.label || value}
              size="small"
              color="info"
              variant="outlined"
            />
          );

        case 'email':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">📧</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {value}
              </Typography>
            </Box>
          );

        case 'url':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">🔗</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={() => window.open(value, '_blank')}
              >
                {value}
              </Typography>
            </Box>
          );

        case 'tel':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">📞</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {value}
              </Typography>
            </Box>
          );

        case 'datetime-local':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">📅</Typography>
              <Typography variant="body2">
                {new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Typography>
            </Box>
          );

        case 'number':
          return (
            <Chip
              label={value.toLocaleString()}
              size="small"
              color="secondary"
              variant="outlined"
            />
          );

        case 'textarea':
          return (
            <Typography 
              variant="body2" 
              sx={{ 
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={value}
            >
              {value}
            </Typography>
          );

        default: // text
          return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {value}
            </Typography>
          );
      }
    };

    return (
      <TableRow 
        key={record.id} 
        sx={{ 
          opacity: isDeleted ? 0.7 : 1,
          position: 'relative',
          backgroundColor: isDeleted ? 'rgba(244, 67, 54, 0.02)' : 'transparent',
          '&:hover': {
            backgroundColor: isDeleted 
              ? 'rgba(244, 67, 54, 0.06)' 
              : 'rgba(102, 126, 234, 0.04)',
          },
          '&::before': isDeleted ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: 'error.main'
          } : {}
        }}
      >
        {/* ID Column */}
        <TableCell>
          <Chip
            label={`#${record.id}`}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </TableCell>

        {/* Dynamic Field Columns */}
        {config.fields.map((fieldConfig) => (
          <TableCell key={fieldConfig.name}>
            {renderFieldValue(fieldConfig, record[fieldConfig.name], record)}
          </TableCell>
        ))}

        {/* Created At Column - Hidden for Academic Years */}
        {selectedEntity !== 'academic_years' && (
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">📅</Typography>
                <Typography variant="body2">
                  {record.created_at ? new Date(record.created_at).toLocaleDateString() : '—'}
                </Typography>
              </Box>
              {isDeleted && record.deleted_at && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  mt: 0.5,
                  p: 0.5,
                  backgroundColor: 'error.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'error.main'
                }}>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>🗑️</Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'error.dark', 
                    fontWeight: 600,
                    fontSize: '11px'
                  }}>
                    Deleted: {new Date(record.deleted_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </TableCell>
        )}

        {/* Status Column - Only show if entity doesn't have its own status field */}
        {(() => {
          const hasStatusField = config.fields.some(field => field.name === 'status');
          if (process.env.NODE_ENV === 'development') {
            console.log(`Row render - Entity: ${selectedEntity}, Has Status Field: ${hasStatusField}`);
          }
          return !hasStatusField && selectedEntity !== 'schools';
        })() && (
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip 
                label={isDeleted ? 'Deleted' : 'Active'} 
                color={isDeleted ? 'error' : 'success'} 
                size="small"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              {isDeleted && record.deleted_at && (
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary', 
                  fontSize: '10px',
                  textAlign: 'center'
                }}>
                  {new Date(record.deleted_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              )}
            </Box>
          </TableCell>
        )}

        {/* Actions Column */}
        <TableCell align="center">
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title="View">
              <IconButton 
                onClick={() => handleView(record)} 
                size="small"
                disabled={deletingRecordId === record.id || restoringRecordId === record.id}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            {!isDeleted && (
              <>
                <Tooltip title="Edit">
                  <IconButton 
                    onClick={() => handleEdit(record)} 
                    size="small" 
                    color="primary"
                    disabled={deletingRecordId === record.id || restoringRecordId === record.id}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={deletingRecordId === record.id ? "Deleting..." : "Delete"}>
                  <IconButton 
                    onClick={() => handleDelete(record)} 
                    size="small" 
                    color="error"
                    disabled={deletingRecordId === record.id || restoringRecordId === record.id}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                    }}
                  >
                    {deletingRecordId === record.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            border: '2px solid #f3f3f3',
                            borderTop: '2px solid #f44336',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                      </Box>
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </>
            )}
            {isDeleted && (
              <Tooltip title={restoringRecordId === record.id ? "Restoring..." : "Restore"}>
                <IconButton 
                  onClick={() => handleRestore(record)} 
                  size="small" 
                  color="success"
                  disabled={deletingRecordId === record.id || restoringRecordId === record.id}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                  }}
                >
                  {restoringRecordId === record.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #4caf50',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <RestoreIcon />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  if (entitiesLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Fancy Header */}
      <Box sx={{ 
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 4,
        color: 'white',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <Typography sx={{ fontSize: '32px' }}>🗂️</Typography>
            </Box>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 0.5
              }}>
                Master Form Management
              </Typography>
              <Typography variant="h6" sx={{ 
                opacity: 0.9,
                fontWeight: 400
              }}>
                Manage all master data entities in the system
              </Typography>
            </Box>
          </Box>
          
          {/* Stats Cards */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 3,
              p: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              minWidth: 150
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <StorageIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                    {entities.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Available Entities
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 3,
              p: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              minWidth: 150
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '16px' }}>📊</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                    {totalRecords}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 3,
              p: 2,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              minWidth: 150
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '16px' }}>✅</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                    {records.filter(r => r.deleted_at === null).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Records
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {includeDeleted && (
              <Box sx={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 3,
                p: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                minWidth: 150
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ fontSize: '16px' }}>🗑️</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                      {records.filter(r => r.deleted_at !== null).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Deleted Records
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Card sx={{
        borderRadius: 4,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          {/* Entity Selection Tabs */}
          <Box sx={{ 
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            p: 3,
            mb: 0
          }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '14px',
                  minHeight: 48,
                  '&.Mui-selected': {
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    backdropFilter: 'blur(10px)'
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 2
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: 3,
                  borderRadius: 1.5
                }
              }}
            >
              {entities.map((entity, index) => (
                <Tab 
                  key={entity} 
                  label={ENTITY_CONFIGS[entity]?.name || entity}
                  onClick={() => handleEntityChange(entity)}
                />
              ))}
            </Tabs>
          </Box>

          {selectedEntity && (
            <>
              {/* Controls */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">
                    {ENTITY_CONFIGS[selectedEntity]?.name || selectedEntity} ({totalRecords})
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={includeDeleted}
                        onChange={(e) => setIncludeDeleted(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Include Deleted"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchRecords}
                    disabled={loading}
                    sx={{
                      borderRadius: 3,
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      color: '#667eea',
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        borderColor: '#667eea',
                        background: 'rgba(102, 126, 234, 0.1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  {selectedEntity === 'weeks' && (
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchAcademicYears}
                      disabled={academicYearsLoading}
                      sx={{
                        borderRadius: 3,
                        borderColor: 'rgba(156, 39, 176, 0.3)',
                        color: '#9c27b0',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          borderColor: '#9c27b0',
                          background: 'rgba(156, 39, 176, 0.1)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {academicYearsLoading ? 'Loading...' : 'Reload Years'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)'
                      },
                      transition: 'all 0.3s ease',
                      fontWeight: 600
                    }}
                  >
                    Add New
                  </Button>
                </Box>
              </Box>

              {/* Helper Alert for Weeks */}
              {selectedEntity === 'weeks' && academicYears.length === 0 && !academicYearsLoading && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Academic Years Required:</strong> To create weeks, you need to have academic years first. 
                    Please create academic years in the "Academic Years" tab, then return to this section.
                  </Typography>
                </Alert>
              )}

              {/* Debug Info for Weeks */}
              {selectedEntity === 'weeks' && process.env.NODE_ENV === 'development' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Debug Info:</strong> Academic Years Loaded: {academicYears.length}, 
                    Records: {records.length}, Loading: {loading ? 'Yes' : 'No'}
                  </Typography>
                </Alert>
              )}

              {/* Records Table */}
              <TableContainer 
                component={Paper} 
                sx={{ 
                  m: 3,
                  borderRadius: 3,
                  overflow: 'auto', // Enable both horizontal and vertical scrolling
                  maxWidth: '100%', // Ensure container doesn't exceed parent width
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)',
                  // Custom scrollbar styling to match theme
                  '&::-webkit-scrollbar': {
                    height: '8px', // Horizontal scrollbar height
                    width: '8px'   // Vertical scrollbar width
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '10px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'linear-gradient(90deg, #5a6fd8 0%, #6a4190 100%)'
                  },
                  // Firefox support
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#667eea rgba(0,0,0,0.05)'
                }}
              >
                <Table sx={{
                  minWidth: 1200, // Minimum width to ensure proper column spacing
                  '& .MuiTableHead-root': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  },
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    color: 'white',
                    fontWeight: 700,
                    borderBottom: 'none',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap', // Prevent header text wrapping
                    minWidth: 120 // Minimum width for each column
                  },
                  '& .MuiTableBody-root .MuiTableRow-root': {
                    '&:nth-of-type(even)': {
                      backgroundColor: 'rgba(102, 126, 234, 0.02)'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.06)',
                      transform: 'scale(1.001)',
                      transition: 'all 0.2s ease'
                    }
                  },
                  '& .MuiTableCell-root': {
                    whiteSpace: 'nowrap', // Prevent cell content wrapping
                    overflow: 'hidden',
                    textOverflow: 'ellipsis' // Add ellipsis for long content
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      {renderTableHeaders()}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => {
                        const config = ENTITY_CONFIGS[selectedEntity];
                        // Calculate columns: ID + Fields + Actions + (Created At if not academic_years) + (Status if no status field and not schools)
                        const hasStatusField = config?.fields.some(field => field.name === 'status') || false;
                        let columnCount = config ? config.fields.length + 2 : 3; // +2 for ID, Actions
                        if (selectedEntity !== 'academic_years') columnCount += 1; // +1 for Created At
                        if (!hasStatusField && selectedEntity !== 'schools') columnCount += 1; // +1 for Status column
                        
                        return (
                          <TableRow key={index}>
                            {Array.from({ length: columnCount }).map((_, cellIndex) => (
                              <TableCell key={cellIndex}>
                                <Skeleton variant="text" />
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    ) : records.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={(() => {
                            const config = ENTITY_CONFIGS[selectedEntity];
                            // Calculate columns: ID + Fields + Actions + (Created At if not academic_years) + (Status if no status field and not schools)
                            const hasStatusField = config?.fields.some(field => field.name === 'status') || false;
                            let columnCount = config ? config.fields.length + 2 : 3; // +2 for ID, Actions
                            if (selectedEntity !== 'academic_years') columnCount += 1; // +1 for Created At
                            if (!hasStatusField && selectedEntity !== 'schools') columnCount += 1; // +1 for Status column
                            return columnCount;
                          })()} 
                          align="center"
                        >
                          <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" color="text.secondary">
                              📋
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              No {ENTITY_CONFIGS[selectedEntity]?.name.toLowerCase() || 'records'} found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click "Add New" to create your first {ENTITY_CONFIGS[selectedEntity]?.name.slice(0, -1).toLowerCase() || 'record'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map(renderTableRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewMode ? 'View' : editMode ? 'Edit' : 'Create'} {ENTITY_CONFIGS[selectedEntity]?.name?.slice(0, -1) || 'Record'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {/* Instruction notes for different entities */}
            {selectedEntity === 'weeks' && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                borderRadius: 2,
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontSize: '18px' }}>💡</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Smart Date Suggestion
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  <strong>How it works:</strong> Select an Academic Year and enter a Week Number (1-52). 
                  The system will automatically calculate the correct start and end dates following the Monday-Sunday pattern 
                  with proper timing (Monday 00:00 → Sunday 22:00).
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.5 }}>
                  <strong>Tip:</strong> You can still manually adjust the suggested dates if needed.
                </Typography>
              </Box>
            )}
            
            {selectedEntity === 'academic_years' && (
              <Box sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                borderRadius: 2,
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontSize: '18px' }}>🎓</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    Academic Year Guidelines
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  <strong>Auto-fill feature:</strong> Enter the Start Year and the End Year will automatically be set to Start Year + 1. 
                  Academic years must be consecutive (e.g., 2025/2026, not 2025/2028).
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.5 }}>
                  <strong>Valid range:</strong> Years must be between 1900-2100.
                </Typography>
              </Box>
            )}

            {/* General instruction for other entities with special features */}
            {(selectedEntity !== 'weeks' && selectedEntity !== 'academic_years') && (
              ENTITY_CONFIGS[selectedEntity]?.fields?.some(field => field.name === 'status') && (
                <Box sx={{ 
                  mb: 2, 
                  p: 1.5, 
                  backgroundColor: 'rgba(158, 158, 158, 0.06)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(158, 158, 158, 0.15)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '14px' }}>ℹ️</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      <strong>Status:</strong> Select Pending (review needed), Approved (active), or Rejected (inactive)
                    </Typography>
                  </Box>
                </Box>
              )
            )}

            <Box sx={{ mt: 1 }}>
              {renderFormFields()}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            {!viewMode && (
              <Button 
                type="submit" 
                variant="contained"
                disabled={submitting}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                    {editMode ? 'Updating...' : 'Creating...'}
                  </Box>
                ) : (
                  editMode ? 'Update' : 'Create'
                )}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          pb: 1,
          color: confirmDialog.severity === 'error' ? 'error.main' : 
                confirmDialog.severity === 'info' ? 'info.main' : 'warning.main',
          fontSize: '1.25rem',
          fontWeight: 600
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: confirmDialog.severity === 'error' ? 'error.light' : 
                           confirmDialog.severity === 'info' ? 'info.light' : 'warning.light',
            color: confirmDialog.severity === 'error' ? 'error.main' : 
                   confirmDialog.severity === 'info' ? 'info.main' : 'warning.main',
            fontSize: '20px'
          }}>
            {confirmDialog.severity === 'error' && '🗑️'}
            {confirmDialog.severity === 'info' && '♻️'}
            {confirmDialog.severity === 'warning' && '⚠️'}
          </Box>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ 
            whiteSpace: 'pre-line', 
            lineHeight: 1.6,
            color: 'text.secondary'
          }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button 
            onClick={closeConfirmDialog}
            variant="outlined"
            color="inherit"
            size="large"
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {confirmDialog.cancelText}
          </Button>
          <Button 
            onClick={() => {
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm();
              }
              closeConfirmDialog();
            }}
            variant="contained"
            color={confirmDialog.severity === 'error' ? 'error' : 
                   confirmDialog.severity === 'info' ? 'info' : 'warning'}
            size="large"
            autoFocus
            sx={{ 
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MasterForm;
