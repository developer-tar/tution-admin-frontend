import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Announcement as AnnouncementIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../api";
import { toast } from "react-toastify";

// Validation schema
const announcementSchema = yup.object().shape({
  title: yup.string().required("Title is required").max(200, "Title must be less than 200 characters"),
  message: yup.string().required("Message is required"),
  priority: yup.string().required("Priority is required").oneOf(["general", "important", "urgent", "maintenance"], "Invalid priority"),
  target_audience: yup.array()
    .of(yup.string().oneOf(["admin", "parent", "student", "all"], "Invalid target audience"))
    .min(1, "At least one target audience must be selected")
    .required("Target audience is required"),
  start_date: yup.string().required("Start date is required"),
  start_time: yup.string().required("Start time is required"),
  end_date: yup.string().required("End date is required"),
  end_time: yup.string().required("End time is required"),
  class_ids: yup.array().when("target_audience", {
    is: (val) => Array.isArray(val) && (val.includes("student") || val.includes("parent")),
    then: (schema) => schema.min(1, "At least one class must be selected or select 'All Classes'"),
    otherwise: (schema) => schema,
  }),
}).test("end-after-start", "End date/time must be after start date/time", function(value) {
  if (!value.start_date || !value.end_date || !value.start_time || !value.end_time) {
    return true; // Let required validation handle missing fields
  }
  const startDateTime = new Date(`${value.start_date}T${value.start_time}`);
  const endDateTime = new Date(`${value.end_date}T${value.end_time}`);
  return endDateTime > startDateTime;
});

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [targetAudience, setTargetAudience] = useState(["admin", "parent", "student"]);
  const previousTargetAudienceRef = useRef(["admin", "parent", "student"]);

  const isEditMode = Boolean(selectedAnnouncement);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(announcementSchema),
        defaultValues: {
          title: "",
          message: "",
          priority: "general",
          target_audience: ["admin", "parent", "student"], // Default to all selected
          start_date: "",
          start_time: "",
          end_date: "",
          end_time: "",
          class_ids: [],
        },
  });

  // Watch target_audience to show/hide class selection
  const watchedTargetAudience = watch("target_audience");
  
  // Check if class selection should be shown (if student or parent is in target audience)
  const shouldShowClassSelection = Array.isArray(watchedTargetAudience) && 
    (watchedTargetAudience.includes("student") || watchedTargetAudience.includes("parent"));

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    if (watchedTargetAudience) {
      setTargetAudience(Array.isArray(watchedTargetAudience) ? watchedTargetAudience : [watchedTargetAudience]);
    }
  }, [watchedTargetAudience]);

  // Clear class_ids when target audience doesn't include student or parent
  useEffect(() => {
    if (watchedTargetAudience) {
      const targetAudienceArray = Array.isArray(watchedTargetAudience) ? watchedTargetAudience : [watchedTargetAudience];
      const hasStudentOrParent = targetAudienceArray.includes("student") || targetAudienceArray.includes("parent");
      
      if (!hasStudentOrParent) {
        // Clear class_ids if target audience doesn't include student or parent
        setValue("class_ids", []);
      }
    }
  }, [watchedTargetAudience, setValue]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get("admin/announcements", {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchTerm || undefined,
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        // Handle different response structures
        const announcementsList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.announcements)
          ? data.announcements
          : [];

        setAnnouncements(announcementsList);
        setTotalRecords(data?.total || announcementsList.length);
      } else {
        throw new Error(response.data.message || "Failed to fetch announcements");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load announcements");
      }
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setClassesLoading(true);
    try {
      // Use the backend API route: Route::get('classes', [FrontendController::class, 'getActiveClasses']);
      const response = await api.get("admin/classes");

      // Handle different response structures
      let classesList = [];
      
      if (response.data) {
        // Check if response has success property
        if (response.data.success && response.data.data) {
          classesList = Array.isArray(response.data.data) ? response.data.data : [];
        } 
        // Check if data is directly in response.data
        else if (Array.isArray(response.data)) {
          classesList = response.data;
        }
        // Check if data is nested
        else if (response.data.data) {
          classesList = Array.isArray(response.data.data) ? response.data.data : [];
        }
      }

      if (classesList.length > 0) {
        setClasses(classesList);
        console.log("Classes loaded successfully:", classesList.length);
      } else {
        console.warn("No classes found from backend");
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.message || "Failed to load classes. Please try again later.");
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    
    // Fetch classes if not already loaded (especially if dialog is opened before initial load completes)
    if (classes.length === 0 && !classesLoading) {
      fetchClasses();
    }
    if (announcement) {
      // Parse date and time from datetime strings
      const startDateTime = announcement.start_date_time || announcement.start_datetime;
      const endDateTime = announcement.end_date_time || announcement.end_datetime;
      
      let startDate = "";
      let startTime = "";
      let endDate = "";
      let endTime = "";

      if (startDateTime) {
        const start = new Date(startDateTime);
        startDate = start.toISOString().split("T")[0];
        startTime = start.toTimeString().slice(0, 5);
      }

      if (endDateTime) {
        const end = new Date(endDateTime);
        endDate = end.toISOString().split("T")[0];
        endTime = end.toTimeString().slice(0, 5);
      }

      // Handle target_audience - convert to array if it's a string
      let targetAudienceValue = announcement.target_audience || ["admin", "parent", "student"];
      if (typeof targetAudienceValue === "string") {
        if (targetAudienceValue === "all") {
          targetAudienceValue = ["admin", "parent", "student"];
        } else {
          targetAudienceValue = [targetAudienceValue];
        }
      } else if (!Array.isArray(targetAudienceValue)) {
        targetAudienceValue = ["admin", "parent", "student"];
      }

      reset({
        title: announcement.title || "",
        message: announcement.message || announcement.content || "",
        priority: announcement.priority || "general",
        target_audience: targetAudienceValue,
        start_date: startDate,
        start_time: startTime,
        end_date: endDate,
        end_time: endTime,
        class_ids: (() => {
          let classIds = [];
          if (announcement.class_ids) {
            classIds = Array.isArray(announcement.class_ids) 
              ? announcement.class_ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
              : [typeof announcement.class_ids === 'string' ? parseInt(announcement.class_ids, 10) : announcement.class_ids];
          } else if (announcement.class_id) {
            classIds = [typeof announcement.class_id === 'string' ? parseInt(announcement.class_id, 10) : announcement.class_id];
          }
          return classIds.filter(id => !isNaN(id));
        })(),
      });
      setTargetAudience(targetAudienceValue);
      previousTargetAudienceRef.current = targetAudienceValue;
    } else {
      const defaultTargetAudience = ["admin", "parent", "student"];
      reset({
        title: "",
        message: "",
        priority: "general",
        target_audience: defaultTargetAudience, // Default to all selected
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        class_ids: [],
      });
      setTargetAudience(defaultTargetAudience);
      previousTargetAudienceRef.current = defaultTargetAudience;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
    reset();
  };

  const handleDeleteClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;

    try {
      const response = await api.delete(`admin/announcements/${selectedAnnouncement.id}`);
      if (response.data.success) {
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } else {
        throw new Error(response.data.message || "Failed to delete announcement");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error(error.response?.data?.message || "Failed to delete announcement");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Validate that target_audience is not empty
      if (!data.target_audience || (Array.isArray(data.target_audience) && data.target_audience.length === 0)) {
        toast.error("Please select at least one target audience");
        setSubmitting(false);
        return;
      }

      // Combine date and time into datetime strings
      const startDateTime = `${data.start_date}T${data.start_time}:00`;
      const endDateTime = `${data.end_date}T${data.end_time}:00`;

      const payload = {
        title: data.title,
        message: data.message,
        priority: data.priority,
        target_audience: Array.isArray(data.target_audience) ? data.target_audience : [data.target_audience],
        start_date_time: startDateTime,
        end_date_time: endDateTime,
      };

      // Only include class_ids if target_audience includes student or parent
      const targetAudienceArray = Array.isArray(data.target_audience) ? data.target_audience : [data.target_audience];
      if (targetAudienceArray.includes("student") || targetAudienceArray.includes("parent")) {
        // Convert class_ids to integers and ensure they're valid
        let classIdsArray = [];
        
        if (data.class_ids && Array.isArray(data.class_ids) && data.class_ids.length > 0) {
          // If all classes are selected (length equals total classes), send all class IDs
          if (data.class_ids.length === classes.length) {
            // Send all class IDs as integers
            classIdsArray = classes.map(cls => parseInt(cls.id, 10)).filter(id => !isNaN(id));
          } else {
            // Convert selected class IDs to integers
            classIdsArray = data.class_ids
              .map(id => {
                // Handle both string and number IDs
                const numId = typeof id === 'string' ? parseInt(id, 10) : id;
                return isNaN(numId) ? null : numId;
              })
              .filter(id => id !== null);
          }
        }
        
        // Backend requires class_ids to be an array of integers
        if (classIdsArray.length === 0) {
          toast.error("Please select at least one class");
          setSubmitting(false);
          return;
        }
        
        payload.class_ids = classIdsArray;
      }

      let response;
      if (isEditMode) {
        response = await api.put(`admin/announcements/${selectedAnnouncement.id}`, payload);
      } else {
        response = await api.post("admin/announcements", payload);
      }

      if (response.data.success) {
        toast.success(`Announcement ${isEditMode ? "updated" : "created"} successfully`);
        handleCloseDialog();
        fetchAnnouncements();
      } else {
        throw new Error(response.data.message || `Failed to ${isEditMode ? "update" : "create"} announcement`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} announcement:`, error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key].join(", ")}`);
        });
      } else {
        toast.error(error.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} announcement`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "important":
        return "warning";
      case "general":
        return "info";
      case "urgent":
        return "error";
      case "maintenance":
        return "secondary";
      default:
        return "default";
    }
  };

  const getAudienceColor = (audience) => {
    if (Array.isArray(audience)) {
      if (audience.includes("all") || audience.length === 3) return "default";
      if (audience.includes("admin")) return "error";
      if (audience.includes("parent")) return "primary";
      if (audience.includes("student")) return "success";
      return "default";
    }
    switch (audience?.toLowerCase()) {
      case "admin":
        return "error";
      case "parent":
        return "primary";
      case "student":
        return "success";
      case "all":
        return "default";
      default:
        return "default";
    }
  };

  const formatTargetAudience = (audience) => {
    if (Array.isArray(audience)) {
      if (audience.includes("all") || audience.length === 3) return "All";
      return audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ");
    }
    return audience?.charAt(0).toUpperCase() + audience?.slice(1) || "All";
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        announcement.title?.toLowerCase().includes(searchLower) ||
        announcement.message?.toLowerCase().includes(searchLower) ||
        announcement.content?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Date range filter
    const startDateTime = announcement.start_date_time || announcement.start_datetime;
    const endDateTime = announcement.end_date_time || announcement.end_datetime;

    if (filterStartDate || filterEndDate) {
      const announcementStart = startDateTime ? new Date(startDateTime) : null;
      const announcementEnd = endDateTime ? new Date(endDateTime) : null;

      // If only start date is selected: show announcements from that date onwards (to all future dates)
      if (filterStartDate && !filterEndDate) {
        const filterStart = new Date(filterStartDate);
        filterStart.setHours(0, 0, 0, 0);
        
        // Announcement should be included if:
        // - It has a start date and starts on or after filter start date, OR
        // - It has an end date and ends on or after filter start date, OR
        // - It has no dates (include it)
        
        if (announcementStart) {
          const annStart = new Date(announcementStart);
          annStart.setHours(0, 0, 0, 0);
          if (annStart < filterStart) return false;
        } else if (announcementEnd) {
          // If no start date but has end date, check if end date is on or after filter start
          const annEnd = new Date(announcementEnd);
          annEnd.setHours(0, 0, 0, 0);
          if (annEnd < filterStart) return false;
        }
        // If no dates at all, include it
      }
      
      // If only end date is selected: show announcements from beginning till that end date
      if (!filterStartDate && filterEndDate) {
        const filterEnd = new Date(filterEndDate);
        filterEnd.setHours(23, 59, 59, 999);
        
        // Announcement should be included if:
        // - It has an end date and ends on or before filter end date, OR
        // - It has a start date and starts on or before filter end date, OR
        // - It has no dates (include it)
        
        if (announcementEnd) {
          const annEnd = new Date(announcementEnd);
          if (annEnd > filterEnd) return false;
        } else if (announcementStart) {
          // If no end date but has start date, check if start date is on or before filter end
          const annStart = new Date(announcementStart);
          if (annStart > filterEnd) return false;
        }
        // If no dates at all, include it
      }
      
      // If both dates are selected: show announcements that overlap with the range
      if (filterStartDate && filterEndDate) {
        const filterStart = new Date(filterStartDate);
        filterStart.setHours(0, 0, 0, 0);
        const filterEnd = new Date(filterEndDate);
        filterEnd.setHours(23, 59, 59, 999);
        
        // Announcement overlaps with filter range if:
        // - Announcement starts before or on filter end AND
        // - Announcement ends after or on filter start
        
        if (announcementStart && announcementEnd) {
          // Both dates exist - check for overlap
          const annStart = new Date(announcementStart);
          const annEnd = new Date(announcementEnd);
          if (annEnd < filterStart || annStart > filterEnd) {
            return false; // No overlap
          }
        } else if (announcementStart && !announcementEnd) {
          // Only start date - include if it starts before or on filter end
          const annStart = new Date(announcementStart);
          if (annStart > filterEnd) return false;
        } else if (!announcementStart && announcementEnd) {
          // Only end date - include if it ends after or on filter start
          const annEnd = new Date(announcementEnd);
          if (annEnd < filterStart) return false;
        }
        // If no dates at all, include it
      }
    }

    return true;
  });

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "25px",
            px: 3,
            py: 1,
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
          }}
        >
          <AnnouncementIcon sx={{ color: "white" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "white" }}>
            Announcements Management
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#5a6c7d", ml: 1 }}>
          Create and manage announcements for admin, parent, and student dashboards
        </Typography>
      </Box>

      {/* Action Bar */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Filter From Date"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                placeholder="Start date"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Filter To Date"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                placeholder="End date"
              />
            </Grid>
            <Grid item xs={12} md={2} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  px: 2,
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                  },
                  transition: "all 0.3s ease",
                  width: { xs: "100%", md: "auto" },
                }}
              >
                Create
              </Button>
            </Grid>
            {(filterStartDate || filterEndDate) && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={
                      filterStartDate && filterEndDate
                        ? `Showing announcements from ${new Date(filterStartDate).toLocaleDateString()} to ${new Date(filterEndDate).toLocaleDateString()}`
                        : filterStartDate
                        ? `Showing announcements from ${new Date(filterStartDate).toLocaleDateString()} onwards`
                        : `Showing announcements until ${new Date(filterEndDate).toLocaleDateString()}`
                    }
                    onDelete={() => {
                      setFilterStartDate("");
                      setFilterEndDate("");
                    }}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)" }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Target Audience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date/Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date/Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Classes</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No announcements found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => {
                  const startDateTime = announcement.start_date_time || announcement.start_datetime;
                  const endDateTime = announcement.end_date_time || announcement.end_datetime;
                  const classIds = announcement.class_ids || (announcement.class_id ? [announcement.class_id] : []);
                  // Empty array means all classes
                  const isAllClasses = classIds.length === 0;
                  const selectedClasses = isAllClasses ? [] : classes.filter(c => classIds.includes(c.id));
                  
                  return (
                    <TableRow key={announcement.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {announcement.title || "Untitled"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {announcement.message || announcement.content || "No message"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={announcement.priority || "medium"}
                          size="small"
                          color={getPriorityColor(announcement.priority)}
                        />
                      </TableCell>
                    <TableCell>
                      {(() => {
                        const audience = announcement.target_audience;
                        const audienceArray = Array.isArray(audience) ? audience : [audience || "all"];
                        
                        if (audienceArray.includes("all") || audienceArray.length === 3) {
                          return <Chip label="All" size="small" color="default" />;
                        }
                        
                        return (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {audienceArray.map((aud, idx) => (
                              <Chip
                                key={idx}
                                label={aud.charAt(0).toUpperCase() + aud.slice(1)}
                                size="small"
                                color={getAudienceColor(aud)}
                              />
                            ))}
                          </Box>
                        );
                      })()}
                    </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {startDateTime ? formatDate(startDateTime) : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {endDateTime ? formatDate(endDateTime) : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isAllClasses ? (
                          <Chip label="All Classes" size="small" color="default" />
                        ) : selectedClasses.length > 0 ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {selectedClasses.slice(0, 2).map((cls) => (
                              <Chip
                                key={cls.id}
                                label={cls.name || cls.class_name || `Class ${cls.id}`}
                                size="small"
                                color="primary"
                              />
                            ))}
                            {selectedClasses.length > 2 && (
                              <Chip
                                label={`+${selectedClasses.length - 2}`}
                                size="small"
                                color="default"
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {classIds.length} class{classIds.length !== 1 ? "es" : ""}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(announcement)}
                              sx={{
                                color: "primary.main",
                                "&:hover": { background: "rgba(102, 126, 234, 0.1)" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(announcement)}
                              sx={{
                                color: "error.main",
                                "&:hover": { background: "rgba(244, 67, 54, 0.1)" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
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
        {!loading && filteredAnnouncements.length > 0 && (
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          {isEditMode ? "Edit Announcement" : "Create New Announcement"}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 3 }}>
          <form id="announcement-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                  {/* Title <span style={{ color: "red" }}>*</span> */}
                </Typography>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      required
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      placeholder="Enter announcement title"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                  {/* Message <span style={{ color: "red" }}>*</span> */}
                </Typography>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Message"
                      fullWidth
                      required
                      multiline
                      rows={6}
                      error={!!errors.message}
                      helperText={errors.message?.message}
                      placeholder="Enter announcement message"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.priority}>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        <MenuItem value="general">General</MenuItem>
                        <MenuItem value="important">Important</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                      </Select>
                      {errors.priority && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.priority.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="target_audience"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.target_audience}>
                      <InputLabel>Target Audience</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Target Audience"
                        input={<OutlinedInput label="Target Audience" />}
                        renderValue={(selected) => {
                          if (selected.includes("all") || selected.length === 3) {
                            return "All";
                          }
                          return selected.map(aud => aud.charAt(0).toUpperCase() + aud.slice(1)).join(", ");
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          
                          // Remove "all" from value if present (it's not a real value, handled by onClick)
                          const filteredValue = value.filter(v => v !== "all");
                          
                          // Check if all three individual items are selected
                          const allThreeSelected = filteredValue.length === 3 && 
                            filteredValue.includes("admin") && 
                            filteredValue.includes("parent") && 
                            filteredValue.includes("student");
                          
                          // Update the value
                          previousTargetAudienceRef.current = filteredValue;
                          field.onChange(filteredValue);
                        }}
                      >
                        <MenuItem 
                          value="all"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const currentValue = field.value || [];
                            const isAllSelected = currentValue.length === 3 && 
                              currentValue.includes("admin") && 
                              currentValue.includes("parent") && 
                              currentValue.includes("student");
                            
                            if (isAllSelected) {
                              // "All" is checked - uncheck all
                              previousTargetAudienceRef.current = [];
                              field.onChange([]);
                            } else {
                              // "All" is unchecked - check all
                              const newValue = ["admin", "parent", "student"];
                              previousTargetAudienceRef.current = newValue;
                              field.onChange(newValue);
                            }
                          }}
                        >
                          <Checkbox 
                            checked={field.value && field.value.length === 3 && 
                              field.value.includes("admin") && 
                              field.value.includes("parent") && 
                              field.value.includes("student")} 
                          />
                          <ListItemText primary="All" />
                        </MenuItem>
                        <MenuItem value="admin">
                          <Checkbox checked={field.value && field.value.includes("admin")} />
                          <ListItemText primary="Admin" />
                        </MenuItem>
                        <MenuItem value="parent">
                          <Checkbox checked={field.value && field.value.includes("parent")} />
                          <ListItemText primary="Parent" />
                        </MenuItem>
                        <MenuItem value="student">
                          <Checkbox checked={field.value && field.value.includes("student")} />
                          <ListItemText primary="Student" />
                        </MenuItem>
                      </Select>
                      {errors.target_audience && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.target_audience.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Date and Time Fields */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="start_time"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Time"
                      type="time"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                      error={!!errors.start_time}
                      helperText={errors.start_time?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.end_date}
                      helperText={errors.end_date?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="end_time"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Time"
                      type="time"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                      error={!!errors.end_time || !!errors.root?.message}
                      helperText={errors.end_time?.message || (errors.root?.message && field.name === "end_time" ? errors.root.message : "")}
                    />
                  )}
                />
              </Grid>
              {errors.root?.message && (
                <Grid item xs={12}>
                  <Alert severity="error">{errors.root.message}</Alert>
                </Grid>
              )}

              {/* Class Selection - Only show for student or parent */}
              {shouldShowClassSelection && (
                <Grid item xs={12}>
                  <Controller
                    name="class_ids"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.class_ids}>
                        <InputLabel>Select Classes</InputLabel>
                        <Select
                          {...field}
                          multiple
                          label="Select Classes"
                          input={<OutlinedInput label="Select Classes" />}
                          renderValue={(selected) => {
                            if (selected.length === 0) return "";
                            if (selected.includes("all") || (classes.length > 0 && selected.length === classes.length)) {
                              return "All Classes";
                            }
                            // Convert selected IDs to integers for comparison
                            const selectedInts = selected.map(s => typeof s === 'string' ? parseInt(s, 10) : s);
                            const selectedClasses = classes.filter(c => {
                              const classId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
                              return selectedInts.includes(classId);
                            });
                            if (selectedClasses.length > 3) {
                              return `${selectedClasses.slice(0, 3).map(c => c.name || c.class_name || `Class ${c.id}`).join(", ")} +${selectedClasses.length - 3} more`;
                            }
                            return selectedClasses.map(c => c.name || c.class_name || `Class ${c.id}`).join(", ");
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Remove "all" if present (it's handled by onClick on MenuItem)
                            const filteredValue = value
                              .filter(v => v !== "all")
                              .map(v => {
                                const id = typeof v === 'string' ? parseInt(v, 10) : v;
                                return isNaN(id) ? null : id;
                              })
                              .filter(id => id !== null);
                            field.onChange(filteredValue);
                          }}
                        >
                          <MenuItem 
                            value="all"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              const currentValue = field.value || [];
                              const allClassIds = classes.length > 0 
                                ? classes.map(c => {
                                    const id = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
                                    return isNaN(id) ? null : id;
                                  }).filter(id => id !== null)
                                : [];
                              
                              // Check if all classes are already selected
                              const allSelected = allClassIds.length > 0 && 
                                currentValue.length === allClassIds.length &&
                                allClassIds.every(id => currentValue.includes(id));
                              
                              if (allSelected) {
                                // Deselect all
                                field.onChange([]);
                              } else {
                                // Select all
                                field.onChange(allClassIds);
                              }
                            }}
                          >
                            <Checkbox 
                              checked={(() => {
                                if (!field.value || !classes.length) return false;
                                const allClassIds = classes.map(c => {
                                  const id = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
                                  return isNaN(id) ? null : id;
                                }).filter(id => id !== null);
                                
                                return field.value.length === allClassIds.length &&
                                  allClassIds.every(id => field.value.includes(id));
                              })()} 
                            />
                            <ListItemText primary="All Classes" />
                          </MenuItem>
                          {classes.map((cls) => {
                            const classId = typeof cls.id === 'string' ? parseInt(cls.id, 10) : cls.id;
                            const isChecked = field.value && field.value.some(val => {
                              const valId = typeof val === 'string' ? parseInt(val, 10) : val;
                              return valId === classId;
                            });
                            return (
                              <MenuItem key={cls.id} value={classId}>
                                <Checkbox checked={isChecked} />
                                <ListItemText primary={cls.name || cls.class_name || `Class ${cls.id}`} />
                              </MenuItem>
                            );
                          })}
                        </Select>
                        {errors.class_ids && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.class_ids.message}
                          </Typography>
                        )}
                        {classesLoading && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                            Loading classes...
                          </Typography>
                        )}
                        {!classesLoading && classes.length === 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                            No classes available. Please add classes first.
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="announcement-form"
            variant="contained"
            disabled={submitting}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            {submitting ? <CircularProgress size={20} /> : isEditMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </Alert>
          {selectedAnnouncement && (
            <Typography variant="body2" color="text.secondary">
              <strong>Title:</strong> {selectedAnnouncement.title || "Untitled"}
            </Typography>
          )}
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

export default Announcements;

