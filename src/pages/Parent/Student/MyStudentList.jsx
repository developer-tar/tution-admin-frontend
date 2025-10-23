import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";
import api from "../../../api";

// Gradient button style (matching admin course list)
const gradientButtonStyle = {
  background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
  color: '#fff',
  fontWeight: 600,
  paddingX: 2,
  paddingY: 0.5,
  borderRadius: 2,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
    opacity: 0.9,
  }
};

const MyStudentList = () => {
  const { control, setValue } = useForm();
  const navigate = useNavigate();

  // API State Management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  // UI State Management
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, student: null });

  // Course Assignment State Management
  const [courseAssignmentData, setCourseAssignmentData] = useState({
    students: [],
    available_courses: []
  });
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [courseDataLoading, setCourseDataLoading] = useState(false);
  // Debounced search implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch students from API
  const fetchStudents = async (search = "", currentPage = 1) => {
    setLoading(true);
    setError("");
    
    try {
      // Check internet connection
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.');
      }

      const params = {
        page: currentPage,
        per_page: rowsPerPage,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("parent/students", { params });
      
      if (response.data.success) {
        const { data: responseData } = response.data;
        setStudents(responseData.data || []);
        setPagination({
          current_page: responseData.current_page,
          last_page: responseData.last_page,
          per_page: responseData.per_page,
          total: responseData.total,
          from: responseData.from,
          to: responseData.to,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch students");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        window.location.href = '/login';
        return;
      }
      
      if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
        toast.error('Server error. Please try again later.');
        return;
      }
      
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        setError(validationErrors.join(', '));
        toast.error(validationErrors.join(', '));
        return;
      }
      
      const errorMessage = err.message || err.response?.data?.message || "Failed to fetch students";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course assignment data
  const fetchCourseAssignmentData = async () => {
    try {
      setCourseDataLoading(true);
      setError("");
      
      const response = await api.get('parent/students-with-courses');
      
      if (response.data.success) {
        setCourseAssignmentData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch course assignment data");
      }
    } catch (err) {
      console.error("Error fetching course assignment data:", err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        window.location.href = '/login';
        return;
      }
      
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors?.parent) {
          toast.error(errors.parent[0]);
        } else if (errors?.subscriptions) {
          toast.error(errors.subscriptions[0]);
        } else if (errors?.courses) {
          toast.error(errors.courses[0]);
        } else {
          toast.error(err.response?.data?.message || "Validation error");
        }
        return;
      }
      
      if (err.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
        return;
      }
      
      const errorMessage = err.message || err.response?.data?.message || "Failed to fetch course assignment data";
      toast.error(errorMessage);
    } finally {
      setCourseDataLoading(false);
    }
  };

  // Handle course assignment
  const handleCourseAssignment = async () => {
    if (!selectedCourse || selectedStudents.length === 0) {
      toast.error("Please select a course and at least one student");
      return;
    }

    try {
      setAssignmentLoading(true);
      
      const payload = {
        student_ids: selectedStudents,
        course_id: selectedCourse
      };

      const response = await api.post('parent/assign-course-to-student', payload);
      
      if (response.data.success) {
        toast.success(response.data.message || "Course assigned successfully!");
        setSelectedCourse("");
        setSelectedStudents([]);
        
        // Refresh data
        fetchCourseAssignmentData();
        fetchStudents(debouncedSearch, page + 1);
      } else {
        throw new Error(response.data.message || "Failed to assign course");
      }
      
    } catch (err) {
      console.error("Error assigning course:", err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        window.location.href = '/login';
        return;
      }
      
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors) {
          // Handle validation errors
          const errorMessages = [];
          
          if (errors.student_ids) {
            errorMessages.push(...errors.student_ids);
          }
          if (errors.course_id) {
            errorMessages.push(...errors.course_id);
          }
          if (errors.student_id) {
            errorMessages.push(...errors.student_id);
          }
          
          // Handle array validation errors
          Object.keys(errors).forEach(key => {
            if (key.startsWith('student_ids.')) {
              errorMessages.push(...errors[key]);
            }
          });
          
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(', '));
          } else {
            toast.error(err.response?.data?.message || "Validation error");
          }
        } else {
          toast.error(err.response?.data?.message || "Validation error");
        }
        return;
      }
      
      if (err.response?.status === 404) {
        toast.error(err.response?.data?.message || "Academic course not found");
        return;
      }
      
      if (err.response?.status >= 500) {
        toast.error(err.response?.data?.message || "Server error occurred during assignment");
        return;
      }
      
      const errorMessage = err.message || err.response?.data?.message || "Failed to assign course";
      toast.error(errorMessage);
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStudents("", 1);
    fetchCourseAssignmentData();
  }, []);

  // Search effect
  useEffect(() => {
    setPage(0);
    fetchStudents(debouncedSearch, 1);
  }, [debouncedSearch]);

  // Transform API data for display
  const transformedStudents = useMemo(() => {
    return students.map(student => ({
      id: student.id,
      first_name: student.student?.first_name || 'N/A',
      last_name: student.student?.last_name || 'N/A',
      email: student.student?.email || 'N/A',
      display_name: student.display_name || 'N/A',
      year: student.year?.name || 'N/A',
      month: student.month?.name || 'N/A',
      day: student.day?.name || 'N/A',
      region: student.region?.name || 'N/A',
      gender: student.gender?.name || 'N/A',
      target_school: student.target_school?.name || 'N/A',
      bio: student.bio || 'N/A',
      created_at: student.created_at,
      updated_at: student.updated_at,
      // Include assigned courses data
      assigned_courses_count: student.assigned_courses_count || 0,
      assigned_courses: student.assigned_courses || [],
      // Include all the original data for the modal
      show_answer_after_n_attempts: student.show_answer_after_n_attempts,
      allow_view_examiner_report_for_mocks: student.allow_view_examiner_report_for_mocks,
      can_change_password: student.can_change_password,
      // Keep original nested objects for modal display
      student: student.student,
      year_obj: student.year,
      month_obj: student.month,
      day_obj: student.day,
      region_obj: student.region,
      gender_obj: student.gender,
      target_school_obj: student.target_school,
    }));
  }, [students]);

  // No filtering needed since status filter is removed
  const filteredStudents = transformedStudents;

  // Removed handleFilterChange since status filter is removed

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchStudents(debouncedSearch, newPage + 1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewStudent = (student) => {
    // Use the transformed student data directly as it contains all necessary information
    setSelectedStudent(student);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  const handleEditStudent = (student) => {
    // Navigate to edit page with student ID
    navigate(`/parent/edit-student/${student.id}`);
  };

  const handleDeleteStudent = (student) => {
    // Open confirmation dialog
    setDeleteConfirmDialog({ open: true, student });
  };

  const handleConfirmDelete = async () => {
    const student = deleteConfirmDialog.student;
    if (!student) return;

    try {
      setDeletingStudentId(student.id);
      setDeleteConfirmDialog({ open: false, student: null });
      
      // Call DELETE API
      const response = await api.delete(`parent/student/${student.id}`);
      
      // Handle success response
      if (response.data.success !== false) {
        toast.success("Student deleted successfully!");
        
        // Refresh the student list
        await fetchStudents(debouncedSearch, page + 1);
      } else {
        throw new Error(response.data.message || "Failed to delete student");
      }
      
    } catch (err) {
      console.error("Error deleting student:", err);
      
      // Handle different error responses
      if (!err.response) {
        toast.error('Network error. Please check your internet connection.');
        return;
      }

      const { status, data } = err.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          toast.error('You do not have permission to delete this student.');
          break;

        case 404:
          // Not Found
          toast.error(data.message || 'Student not found or you do not have permission to delete this student.');
          // Refresh the list to remove the student from UI
          await fetchStudents(debouncedSearch, page + 1);
          break;

        case 422:
          // Validation Error
          const errorMessage = data.errors?.student?.[0] || data.message || 'Validation error occurred.';
          toast.error(errorMessage);
          break;

        case 500:
          // Server Error
          toast.error(data.message || 'Server error occurred. Please try again later.');
          break;

        default:
          toast.error(data.message || 'An error occurred while deleting the student.');
      }
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmDialog({ open: false, student: null });
  };

  // Removed status filter fields

  const columns = useMemo(() => [
    { key: "id", label: "ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "display_name", label: "Display Name" },
    { key: "target_school", label: "Target School" },
    { key: "region", label: "Region" },
    {
      key: "assigned_courses_count",
      label: "Courses Count",
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={row.assigned_courses_count || 0}
            size="small"
            color={row.assigned_courses_count > 0 ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      ),
    },
    {
      key: "assigned_courses",
      label: "Assigned Courses",
      render: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
          {row.assigned_courses && row.assigned_courses.length > 0 ? (
            row.assigned_courses.slice(0, 2).map((course, index) => (
              <Chip
                key={course.id}
                label={course.course.name}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '11px' }}
              />
            ))
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              No courses assigned
            </Typography>
          )}
          {row.assigned_courses && row.assigned_courses.length > 2 && (
            <Chip
              label={`+${row.assigned_courses.length - 2} more`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '10px' }}
            />
          )}
        </Box>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewStudent(row)}
          >
            View
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={() => handleEditStudent(row)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleDeleteStudent(row)}
            disabled={deletingStudentId === row.id}
          >
            {deletingStudentId === row.id ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      ),
    }
  ], [deletingStudentId]);

  return (
    <Box sx={{ py: 4 }}>
      {/* Course Assignment Section */}
      <Card 
        sx={{ 
          mb: 4,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '24px' }} role="img" aria-label="course">📚</span>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Assign Course to Students
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '14px' }}>
                Select a course and assign it to multiple students
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Course Selection */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={courseDataLoading}>
                <InputLabel 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    '&.Mui-focused': { color: 'white' }
                  }}
                >
                  Select Course
                </InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  input={<OutlinedInput />}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  {(courseAssignmentData.available_courses || []).map((course) => (
                    <MenuItem key={course.course_id} value={course.course_id}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {course.course_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          ₹{(course.amount / 100).toFixed(2)} {course.currency.toUpperCase()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Student Selection */}
            <Grid item xs={12} md={5}>
              <FormControl fullWidth disabled={courseDataLoading}>
                <InputLabel 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    '&.Mui-focused': { color: 'white' }
                  }}
                >
                  Select Students
                </InputLabel>
                <Select
                  multiple
                  value={selectedStudents}
                  onChange={(e) => setSelectedStudents(e.target.value)}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((studentId) => {
                        const student = (courseAssignmentData.students || []).find(s => s.student_id === studentId);
                        return (
                          <Chip
                            key={studentId}
                            label={student?.display_name || student?.student_name}
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  {(courseAssignmentData.students || []).map((student) => (
                    <MenuItem key={student.student_id} value={student.student_id}>
                      <Checkbox 
                        checked={selectedStudents.indexOf(student.student_id) > -1}
                        sx={{ color: 'primary.main' }}
                      />
                      <ListItemText 
                        primary={student.display_name || student.student_name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {student.student_email}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'success.main' }}>
                              Assigned: {student.assigned_courses_count} | Available: {student.available_courses_count}
                            </Typography>
                          </Box>
                        }
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Assign Button */}
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCourseAssignment}
                disabled={assignmentLoading || courseDataLoading || !selectedCourse || selectedStudents.length === 0}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                  }
                }}
              >
                {assignmentLoading ? 'Assigning...' : 'Assign Course'}
              </Button>
            </Grid>
          </Grid>

          {/* Course Assignment Info */}
          {courseDataLoading ? (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Loading course assignment data...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Available Courses: {(courseAssignmentData.available_courses || []).length} | 
                Students: {(courseAssignmentData.students || []).length}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Fancy Header Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '24px' }} role="img" aria-label="students">👨‍🎓</span>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                My Student List
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '14px' }}>
                Manage and monitor your students' progress
              </Typography>
            </Box>
          </Box>
          <Button
            sx={{
              ...gradientButtonStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              '&:hover': {
                ...gradientButtonStyle['&:hover'],
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/parent/add-student')}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        {/* Search Field */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Students"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, email, or display name..."
            />
          </Grid>
        </Grid>

        {/* Loading State */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading students...</Typography>
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredStudents.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No students found matching your search.' : 'No students found.'}
            </Typography>
          </Box>
        )}

        {/* Data Table */}
        {!loading && filteredStudents.length > 0 && (
          <DataTable
            loading={loading}
            data={filteredStudents}
            page={page}
            setPage={handlePageChange}
            rowsPerPage={rowsPerPage}
            isFilterSelected={true}
            columns={columns}
            totalCount={pagination.total}
            pagination={{
              current_page: pagination.current_page,
              last_page: pagination.last_page,
              total: pagination.total,
              from: pagination.from,
              to: pagination.to,
            }}
          />
        )}

        {/* Pagination Info */}
        {!loading && filteredStudents.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {pagination.from} to {pagination.to} of {pagination.total} students
            </Typography>
          </Box>
        )}
      </Box>

      {/* Student Details Modal */}
      <Dialog
        open={!!selectedStudent}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="student">👨‍🎓</span> Student Details
          </Box>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedStudent && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Basic Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><strong>First Name:</strong> {selectedStudent.student?.first_name || selectedStudent.first_name || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><strong>Last Name:</strong> {selectedStudent.student?.last_name || selectedStudent.last_name || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><strong>Email:</strong> {selectedStudent.student?.email || selectedStudent.email || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><strong>Display Name:</strong> {selectedStudent.display_name || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><strong>Gender:</strong> {selectedStudent.gender_obj?.name || (typeof selectedStudent.gender === 'string' ? selectedStudent.gender : 'N/A')}</Typography>
                  <Typography variant="subtitle1"><strong>Region:</strong> {selectedStudent.region_obj?.name || (typeof selectedStudent.region === 'string' ? selectedStudent.region : 'N/A')}</Typography>
                  <Typography variant="subtitle1"><strong>Target School:</strong> {selectedStudent.target_school_obj?.name || (typeof selectedStudent.target_school === 'string' ? selectedStudent.target_school : 'N/A')}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                {/* Birth Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Birth Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1"><strong>Birth Year:</strong> {selectedStudent.year_obj?.name || (typeof selectedStudent.year === 'string' ? selectedStudent.year : 'N/A')}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1"><strong>Birth Month:</strong> {selectedStudent.month_obj?.name || (typeof selectedStudent.month === 'string' ? selectedStudent.month : 'N/A')}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1"><strong>Birth Day:</strong> {selectedStudent.day_obj?.name || (typeof selectedStudent.day === 'string' ? selectedStudent.day : 'N/A')}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                {/* Settings & Preferences */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Settings & Preferences
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Show Answer After Attempts:</strong> {selectedStudent.show_answer_after_n_attempts ?? 'Not Set'}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>View Examiner Report:</strong> 
                    <Chip 
                      label={selectedStudent.allow_view_examiner_report_for_mocks === true ? 'Allowed' : 'Not Allowed'} 
                      color={selectedStudent.allow_view_examiner_report_for_mocks === true ? 'success' : 'default'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Can Change Password:</strong> 
                    <Chip 
                      label={selectedStudent.can_change_password === true ? 'Yes' : 'No'} 
                      color={selectedStudent.can_change_password === true ? 'success' : 'default'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Biography
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
                    {selectedStudent.bio || 'No biography provided.'}
                  </Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                {/* Assigned Courses */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Assigned Courses ({selectedStudent.assigned_courses_count || 0})
                  </Typography>
                  {selectedStudent.assigned_courses && selectedStudent.assigned_courses.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedStudent.assigned_courses.map((courseAssignment) => (
                        <Card 
                          key={courseAssignment.id} 
                          sx={{ 
                            minWidth: 200, 
                            backgroundColor: 'primary.50',
                            border: '1px solid',
                            borderColor: 'primary.200'
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                              {courseAssignment.course.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Course ID: {courseAssignment.course.id}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Assigned: {new Date(courseAssignment.created_at).toLocaleDateString()}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={courseAssignment.is_completed ? 'Completed' : 'In Progress'}
                                  size="small"
                                  color={courseAssignment.is_completed ? 'success' : 'warning'}
                                  sx={{ fontSize: '10px' }}
                                />
                                {courseAssignment.status && (
                                  <Chip
                                    label={courseAssignment.status}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '10px' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary', 
                      fontStyle: 'italic',
                      backgroundColor: 'grey.50', 
                      p: 2, 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      No courses assigned to this student yet.
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                {/* Timestamps */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Record Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Created:</strong> {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    <strong>Last Updated:</strong> {selectedStudent.updated_at ? new Date(selectedStudent.updated_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <span role="img" aria-label="warning">⚠️</span>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this student? This action cannot be undone.
          </Typography>
          {deleteConfirmDialog.student && (
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                <strong>Student:</strong> {deleteConfirmDialog.student.first_name} {deleteConfirmDialog.student.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {deleteConfirmDialog.student.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Display Name:</strong> {deleteConfirmDialog.student.display_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deletingStudentId === deleteConfirmDialog.student?.id}
          >
            {deletingStudentId === deleteConfirmDialog.student?.id ? 'Deleting...' : 'Delete Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyStudentList;
