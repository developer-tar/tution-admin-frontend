import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
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
  TablePagination,
  IconButton,
  Chip,
  Skeleton,
  Paper,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../api';
import { toast } from 'react-toastify';

const certificateSchema = yup.object().shape({
  award_id: yup.number().required('Award is required'),
  academic_year_id: yup.number().nullable(),
  course_id: yup.number().nullable(),
  mode_id: yup.number().nullable(),
  student_id: yup.number().required('Student is required'),
  issued_date: yup.string().nullable(),
  achievement_details: yup.string().nullable(),
});

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [awardFilter, setAwardFilter] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [awards, setAwards] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modes, setModes] = useState([]);
  
  // Ensure students is always an array (safety check)
  const safeStudents = Array.isArray(students) ? students : [];
  const [loadingAwards, setLoadingAwards] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingModes, setLoadingModes] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(certificateSchema),
    defaultValues: {
      award_id: null,
      academic_year_id: null,
      course_id: null,
      mode_id: null,
      student_id: null,
      issued_date: new Date().toISOString().split('T')[0],
      achievement_details: '',
    },
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch certificates when filters change
  useEffect(() => {
    fetchCertificates();
  }, [page, rowsPerPage, debouncedSearchTerm, statusFilter, awardFilter]);

  // Fetch awards, academic years, and modes for dropdowns
  useEffect(() => {
    fetchAwards();
    fetchAcademicYears();
    fetchModes();
  }, []);

  // Watch for changes in filters and fetch students accordingly
  const academicYearId = watch('academic_year_id');
  const courseId = watch('course_id');
  const modeId = watch('mode_id');

  useEffect(() => {
    // Only fetch students if at least one filter is selected
    if (academicYearId || courseId || modeId) {
      fetchStudents(academicYearId, courseId, modeId);
    } else {
      // If no filters, clear students list
      setStudents([]);
    }
  }, [academicYearId, courseId, modeId]);

  const fetchAwards = async () => {
    setLoadingAwards(true);
    try {
      const response = await api.get('admin/awards', { params: { per_page: 1000, status: 1 } });
      if (response.data && response.data.success) {
        const data = response.data.data;
        setAwards(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoadingAwards(false);
    }
  };

  const fetchAcademicYears = async () => {
    setLoadingAcademicYears(true);
    try {
      const response = await api.get('admin/certificates/academic-years');
      console.log('Academic Years API Response:', response.data);
      if (response.data && response.data.success) {
        const data = response.data.data || [];
        console.log('Academic Years Data:', data);
        setAcademicYears(Array.isArray(data) ? data : []);
      } else {
        console.warn('Academic Years API response format unexpected:', response.data);
        setAcademicYears([]);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load academic years. Please try again.');
      setAcademicYears([]);
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const fetchCourses = async (academicYearId) => {
    if (!academicYearId) {
      setCourses([]);
      return;
    }
    
    setLoadingCourses(true);
    try {
      const response = await api.get('admin/certificates/courses-by-year', {
        params: { academic_year_id: academicYearId }
      });
      if (response.data && response.data.success) {
        setCourses(response.data.data || []);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchModes = async () => {
    setLoadingModes(true);
    try {
      const response = await api.get('admin/certificates/modes');
      if (response.data && response.data.success) {
        setModes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching modes:', error);
      setModes([]);
    } finally {
      setLoadingModes(false);
    }
  };

  const fetchStudents = async (academicYearId, courseId, modeId) => {
    setLoadingStudents(true);
    try {
      const params = {};
      if (academicYearId) params.academic_year_id = academicYearId;
      if (courseId) params.course_id = courseId;
      if (modeId) params.mode_id = modeId;

      // If any filter is provided, use filtered endpoint, otherwise use list endpoint
      const endpoint = Object.keys(params).length > 0 
        ? 'admin/certificates/students/filtered'
        : 'admin/certificates/students/list';
      
      const response = await api.get(endpoint, { params });
      if (response.data && response.data.success) {
        const data = response.data.data;
        // Ensure students is always an array
        setStudents(Array.isArray(data) ? data : []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      if (awardFilter) {
        params.award_id = awardFilter;
      }
      
      const response = await api.get('admin/certificates', { params });
      
      if (response.data && response.data.success) {
        const paginatedData = response.data.data;
        
        if (paginatedData && paginatedData.data) {
          setCertificates(paginatedData.data || []);
          setTotalRecords(paginatedData.total || 0);
        } else if (Array.isArray(paginatedData)) {
          setCertificates(paginatedData);
          setTotalRecords(paginatedData.length);
        } else {
          setCertificates([]);
          setTotalRecords(0);
        }
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error(error.response?.data?.message || 'Failed to load certificates');
      setCertificates([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (certificate = null) => {
    if (certificate) {
      setSelectedCertificate(certificate);
      setIsEditing(true);
      reset({
        award_id: certificate.award_id,
        academic_year_id: null,
        course_id: null,
        mode_id: null,
        student_id: certificate.student_id,
        issued_date: certificate.issued_date ? certificate.issued_date.split('T')[0] : new Date().toISOString().split('T')[0],
        achievement_details: certificate.achievement_details || '',
      });
    } else {
      setSelectedCertificate(null);
      setIsEditing(false);
      reset({
        award_id: null,
        academic_year_id: null,
        course_id: null,
        mode_id: null,
        student_id: null,
        issued_date: new Date().toISOString().split('T')[0],
        achievement_details: '',
      });
      setCourses([]);
      setStudents([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCertificate(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        toast.error('Certificate editing is not allowed. Please create a new certificate.');
        return;
      } else {
        const response = await api.post('admin/certificates', data);
        if (response.data.success) {
          toast.success('Certificate generated successfully');
          fetchCertificates();
          handleCloseDialog();
        }
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((field) => {
          toast.error(error.response.data.errors[field][0]);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate certificate');
      }
    }
  };

  const handleDeleteClick = (certificate) => {
    setSelectedCertificate(certificate);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`admin/certificates/${selectedCertificate.id}`);
      if (response.data.success) {
        toast.success('Certificate deleted successfully');
        fetchCertificates();
        setDeleteDialogOpen(false);
        setSelectedCertificate(null);
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to delete certificate');
    }
  };

  const handleDownload = async (certificate) => {
    try {
      const response = await api.get(`admin/certificates/${certificate.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificate_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to download certificate');
    }
  };

  const handleRevoke = async (certificate) => {
    try {
      const response = await api.patch(`admin/certificates/${certificate.id}/revoke`);
      if (response.data.success) {
        toast.success('Certificate revoked successfully');
        fetchCertificates();
      }
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to revoke certificate');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    return status === 1 ? 'success' : 'default';
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Active' : 'Revoked';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
          <PdfIcon sx={{ fontSize: '24px', color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
            Certificates Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
          <Typography variant="body1" sx={{ color: '#5a6c7d' }}>
            Generate and manage student certificates
          </Typography>
          {!loading && (
            <Chip 
              label={`Total: ${totalRecords}`} 
              size="small" 
              sx={{ bgcolor: '#667eea', color: 'white' }}
            />
          )}
        </Box>
      </Box>

      {/* Filters and Add Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Revoked</MenuItem>
              <MenuItem value="1">Active</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Award</InputLabel>
            <Select
              value={awardFilter}
              onChange={(e) => {
                setAwardFilter(e.target.value);
                setPage(0);
              }}
              label="Award"
            >
              <MenuItem value="">All Awards</MenuItem>
              {awards.map((award) => (
                <MenuItem key={award.id} value={award.id}>
                  {award.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Generate Certificate
        </Button>
      </Box>

      {/* Certificates Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Certificate Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Award</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Issued Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width="100%" height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  </TableRow>
                ))
              ) : certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <PdfIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No certificates found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Generate Certificate" to create a new certificate
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((certificate) => (
                  <TableRow key={certificate.id} hover>
                    <TableCell>{certificate.certificate_number}</TableCell>
                    <TableCell>
                      {certificate.student?.first_name} {certificate.student?.last_name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {certificate.student?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{certificate.award?.name}</TableCell>
                    <TableCell>
                      {new Date(certificate.issued_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(certificate.status)} 
                        color={getStatusColor(certificate.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownload(certificate)}
                        title="Download PDF"
                      >
                        <DownloadIcon />
                      </IconButton>
                      {certificate.status === 1 && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleRevoke(certificate)}
                          title="Revoke Certificate"
                        >
                          <BlockIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(certificate)}
                        title="Delete Certificate"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && certificates.length > 0 && (
          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Card>

      {/* Generate Certificate Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PdfIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Generate Certificate
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Create a new certificate for a student
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="award_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.award_id}>
                    <InputLabel>Award *</InputLabel>
                    <Select {...field} label="Award *" value={field.value ?? ''}>
                      <MenuItem value="">Select Award</MenuItem>
                      {awards.map((award) => (
                        <MenuItem key={award.id} value={award.id}>
                          {award.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.award_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.award_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="academic_year_id"
                control={control}
                render={({ field }) => {
                  return (
                    <FormControl fullWidth error={!!errors.academic_year_id} disabled={loadingAcademicYears}>
                      <InputLabel>Academic Year</InputLabel>
                      <Select 
                        {...field} 
                        label="Academic Year"
                        disabled={loadingAcademicYears}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset dependent fields
                          setValue('course_id', null);
                          setValue('mode_id', null);
                          setValue('student_id', null);
                          setCourses([]);
                          setStudents([]);
                          // Fetch courses for selected year
                          if (e.target.value) {
                            fetchCourses(e.target.value);
                          }
                        }}
                      >
                        <MenuItem value="">Select Year</MenuItem>
                        {loadingAcademicYears ? (
                          <MenuItem value="" disabled>Loading years...</MenuItem>
                        ) : academicYears.length > 0 ? (
                          academicYears.map((year) => (
                            <MenuItem key={year.id} value={year.id}>
                              {year.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>No academic years available</MenuItem>
                        )}
                      </Select>
                      {errors.academic_year_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.academic_year_id.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="course_id"
                control={control}
                render={({ field }) => {
                  const academicYearId = watch('academic_year_id');
                  return (
                    <FormControl fullWidth error={!!errors.course_id} disabled={loadingCourses || !academicYearId}>
                      <InputLabel>Course</InputLabel>
                      <Select 
                        {...field} 
                        label="Course"
                        disabled={loadingCourses || !academicYearId}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset dependent fields
                          setValue('mode_id', null);
                          setValue('student_id', null);
                          setStudents([]);
                          // Fetch students when course is selected
                          const yearId = watch('academic_year_id');
                          const modeId = watch('mode_id');
                          if (e.target.value) {
                            fetchStudents(yearId, e.target.value, modeId);
                          }
                        }}
                      >
                        <MenuItem value="">Select Course</MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.course_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.course_id.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="mode_id"
                control={control}
                render={({ field }) => {
                  const courseId = watch('course_id');
                  return (
                    <FormControl fullWidth error={!!errors.mode_id} disabled={loadingModes || !courseId}>
                      <InputLabel>Mode</InputLabel>
                      <Select 
                        {...field} 
                        label="Mode"
                        disabled={loadingModes || !courseId}
                        onChange={(e) => {
                          field.onChange(e);
                          // Reset student selection
                          setValue('student_id', null);
                          // Fetch students with new mode filter
                          const yearId = watch('academic_year_id');
                          const selectedCourseId = watch('course_id');
                          if (selectedCourseId) {
                            fetchStudents(yearId, selectedCourseId, e.target.value);
                          }
                        }}
                      >
                        <MenuItem value="">Select Mode</MenuItem>
                        {modes.map((mode) => (
                          <MenuItem key={mode.id} value={mode.id}>
                            {mode.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.mode_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.mode_id.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="student_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.student_id}>
                    <InputLabel>Student *</InputLabel>
                    <Select {...field} label="Student *" value={field.value ?? ''}>
                      <MenuItem value="">Select Student</MenuItem>
                      {safeStudents.length > 0 ? (
                        safeStudents.map((student) => (
                          <MenuItem key={student.id} value={student.id}>
                            {student.first_name} {student.last_name} ({student.email})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          {loadingStudents ? 'Loading students...' : 'No students available. Please select year, course, and mode first.'}
                        </MenuItem>
                      )}
                    </Select>
                    {errors.student_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.student_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="issued_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Issued Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.issued_date}
                    helperText={errors.issued_date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="achievement_details"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Achievement Details"
                    multiline
                    rows={3}
                    placeholder="Additional details about the achievement..."
                    error={!!errors.achievement_details}
                    helperText={errors.achievement_details?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'flex-end' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            variant="contained"
            color="primary"
            size="small"
          >
            Generate Certificate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Certificate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete certificate "{selectedCertificate?.certificate_number}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Certificates;

