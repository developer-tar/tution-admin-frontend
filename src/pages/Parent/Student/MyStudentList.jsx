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
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";
import api from "../../../api";

// Dummy student list - commented out for API implementation
// const dummyStudents = [
//   {
//     id: 1,
//     first_name: "Tarun",
//     last_name: "Singh",
//     email: "tarun@example.com",
//     status: "Active",
//   },
//   {
//     id: 2,
//     first_name: "Anjali",
//     last_name: "Verma",
//     email: "anjali@example.com",
//     status: "Inactive",
//   },
//   {
//     id: 3,
//     first_name: "Rohan",
//     last_name: "Sharma",
//     email: "rohan@example.com",
//     status: "Active",
//   },
// ];

const MyCurrentCourseAssignment = () => {
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

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  // Initial load
  useEffect(() => {
    fetchStudents("", 1);
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
    // Find the full student data from the original API response
    const fullStudentData = students.find(s => s.id === student.id);
    setSelectedStudent(fullStudentData || student);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  const handleEditStudent = (student) => {
    // Navigate to edit page with student ID
    navigate(`/parent/edit-student/${student.id}`);
  };

  const handleDeleteStudent = (student) => {
    // Add delete confirmation logic here
    if (window.confirm(`Are you sure you want to delete student "${student.first_name} ${student.last_name}"?`)) {
      // TODO: Implement delete API call
      console.log("Delete student:", student.id);
      toast.info("Delete functionality will be implemented soon!");
    }
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
          >
            Delete
          </Button>
        </Box>
      ),
    }
  ], []);

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" mb={2}>
        My Student List
      </Typography>

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
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="student">👨‍🎓</span> Student Details
          </Typography>
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
                  <Typography variant="subtitle1"><strong>Gender:</strong> {selectedStudent.gender?.name || selectedStudent.gender || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><strong>Region:</strong> {selectedStudent.region?.name || selectedStudent.region || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><strong>Target School:</strong> {selectedStudent.target_school?.name || selectedStudent.target_school || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                {/* Birth Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                    Birth Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1"><strong>Birth Year:</strong> {selectedStudent.year?.name || selectedStudent.year || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1"><strong>Birth Month:</strong> {selectedStudent.month?.name || selectedStudent.month || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1"><strong>Birth Day:</strong> {selectedStudent.day?.name || selectedStudent.day || 'N/A'}</Typography>
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
    </Box>
  );
};

export default MyCurrentCourseAssignment;
