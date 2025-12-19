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
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Announcement as AnnouncementIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as FileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../api";
import { toast } from "react-toastify";

const Announcements = () => {
  // Validation schema - defined inside component to avoid webpack HMR initialization issues
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
    // class_ids removed - using course_time_slots instead
  }).test("end-after-start", "End date/time must be after start date/time", function(value) {
    if (!value.start_date || !value.end_date || !value.start_time || !value.end_time) {
      return true; // Let required validation handle missing fields
    }
    const startDateTime = new Date(`${value.start_date}T${value.start_time}`);
    const endDateTime = new Date(`${value.end_date}T${value.end_time}`);
    return endDateTime > startDateTime;
  });
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
  const [filterTargetAudience, setFilterTargetAudience] = useState("all"); // Filter state for table
  const [targetAudience, setTargetAudience] = useState(["admin", "parent", "student"]);
  const previousTargetAudienceRef = useRef(["admin", "parent", "student"]);
  const [courseTimeSlots, setCourseTimeSlots] = useState([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [selectedTimetables, setSelectedTimetables] = useState([]);

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
          course_time_slot_ids: [],
          is_pinned: false,
        },
  });

  // Fetch announcements when pagination/search changes
  useEffect(() => {
    fetchAnnouncements();
  }, [page, rowsPerPage, searchTerm]);

  // Fetch course time slots once on component mount
  useEffect(() => {
    fetchCourseTimeSlots();
  }, []);

  // class_ids removed - using course_time_slots instead

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
      
      console.log("Announcements API Response:", {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data),
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        fullResponse: response.data
      });
      
      if (response.data && response.data.success !== false) {
        const responseData = response.data.data;
        
        // Handle Laravel paginated response structure
        // sendResponse wraps paginated data, so structure is: { success: true, data: { data: [...], total: X, ... } }
        let announcementsList = [];
        let total = 0;
        
        if (Array.isArray(responseData)) {
          // Direct array response (shouldn't happen with pagination, but handle it)
          announcementsList = responseData;
          total = responseData.length;
          console.log("Received direct array response");
        } else if (responseData && typeof responseData === 'object') {
          // Paginated response from Laravel
          if (Array.isArray(responseData.data)) {
            announcementsList = responseData.data;
            total = responseData.total || responseData.data.length;
            console.log("Received paginated response with data array");
          } else if (Array.isArray(responseData.announcements)) {
            announcementsList = responseData.announcements;
            total = responseData.total || responseData.announcements.length;
            console.log("Received paginated response with announcements array");
          } else {
            // Fallback: check all properties for arrays
            console.warn("Unexpected response structure, checking all properties:", responseData);
            for (const key in responseData) {
              if (Array.isArray(responseData[key])) {
                announcementsList = responseData[key];
                total = responseData.total || responseData[key].length;
                console.log(`Found array in property: ${key}`);
                break;
              }
            }
            if (announcementsList.length === 0) {
              console.error("No array found in response data:", responseData);
            }
          }
        } else {
          console.warn("Response data is not an array or object:", typeof responseData, responseData);
          announcementsList = [];
          total = 0;
        }
        
        setAnnouncements(announcementsList);
        setTotalRecords(total);
        
        console.log("Announcements loaded:", {
          count: announcementsList.length,
          total: total,
          currentPage: responseData?.current_page || page + 1,
          perPage: responseData?.per_page || rowsPerPage,
          hasFirstItem: !!announcementsList[0],
          firstItemTitle: announcementsList[0]?.title
        });
      } else {
        // If success is false, set empty arrays
        console.warn("API returned success=false or no data", response.data);
        setAnnouncements([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAnnouncements([]);
      setTotalRecords(0);
      toast.error(error.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseTimeSlots = async () => {
    setTimeSlotsLoading(true);
    try {
      console.log("[Course Time Slots] Fetching from API...");
      const response = await api.get("admin/announcements/course-time-slots/list");
      
      console.log("[Course Time Slots] Full API response:", JSON.stringify(response.data, null, 2));
      console.log("[Course Time Slots] API response structure:", {
        hasResponse: !!response,
        hasData: !!response?.data,
        success: response?.data?.success,
        hasDataField: !!response?.data?.data,
        dataType: typeof response?.data?.data,
        dataIsArray: Array.isArray(response?.data?.data),
        dataLength: Array.isArray(response?.data?.data) ? response.data.data.length : 'N/A',
        message: response?.data?.message
      });
      
      // Handle response - check for success flag or just check if data exists
      let data = null;
      
      if (response?.data) {
        // Check if response has success field
        if (response.data.success === true || response.data.success === undefined) {
          // Get data from response.data.data (standard sendResponse structure)
          // sendResponse wraps data as: {success: true, data: [...], message: "..."}
          data = response.data.data;
          
          // Fallback: if data.data is not an array, try response.data directly
          if (!Array.isArray(data) && Array.isArray(response.data)) {
            data = response.data;
          }
        } else if (response.data.success === false) {
          console.warn("[Course Time Slots] API returned success=false");
          setCourseTimeSlots([]);
          toast.error(response.data.message || "Failed to load course time slots");
          return;
        } else {
          // If no success field, try to get data directly
          data = response.data.data || response.data;
        }
      } else {
        console.warn("[Course Time Slots] No response data");
        setCourseTimeSlots([]);
        return;
      }
      
      console.log("[Course Time Slots] Extracted data:", {
        data,
        isArray: Array.isArray(data),
        type: typeof data,
        length: Array.isArray(data) ? data.length : 'N/A',
        keys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : 'N/A',
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
      
      // Helper function to convert object with numeric keys to array
      const convertToArray = (obj) => {
        if (Array.isArray(obj)) return obj;
        if (obj && typeof obj === 'object') {
          const keys = Object.keys(obj);
          // Check if all keys are numeric (array-like object)
          if (keys.length > 0 && keys.every(key => !isNaN(parseInt(key)))) {
            return Object.values(obj);
          }
        }
        return null;
      };
      
      // Handle different response structures
      let finalData = null;
      
      if (Array.isArray(data)) {
        // Direct array response - this is what we expect from sendResponse
        finalData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        // Nested data structure (double nested)
        finalData = data.data;
      } else if (data && typeof data === 'object') {
        // Try to convert object with numeric keys to array
        const converted = convertToArray(data);
        if (converted) {
          finalData = converted;
        } else {
          // Check if it's an object with a data property
          if (data.data && Array.isArray(data.data)) {
            finalData = data.data;
          }
        }
      }
      
      // Set the course time slots if we found valid data
      if (finalData && Array.isArray(finalData)) {
        if (finalData.length > 0) {
          setCourseTimeSlots(finalData);
          console.log("[Course Time Slots] ✅ Loaded successfully:", finalData.length, "slots");
          console.log("[Course Time Slots] Sample slot:", finalData[0]);
        } else {
          console.warn("[Course Time Slots] ⚠️ Array is empty - no time slots found in database");
          setCourseTimeSlots([]);
        }
      } else if (data === null || data === undefined) {
        console.warn("[Course Time Slots] ⚠️ Data is null or undefined");
        setCourseTimeSlots([]);
      } else {
        console.error("[Course Time Slots] ❌ Unexpected response structure:", data);
        console.error("[Course Time Slots] Data type:", typeof data);
        console.error("[Course Time Slots] Data keys:", data && typeof data === 'object' ? Object.keys(data) : 'N/A');
        console.error("[Course Time Slots] Full response.data:", response?.data);
        setCourseTimeSlots([]);
      }
    } catch (error) {
      console.error("[Course Time Slots] ❌ Error fetching:", error);
      console.error("[Course Time Slots] Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Show error toast for all errors except 404
      if (error.response?.status !== 404) {
        let errorMessage = "Failed to load course time slots.";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.response?.status === 403) {
          errorMessage = "You don't have permission to access this resource.";
        } else if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later or contact support.";
        } else if (error.message === 'Network Error' || !error.response) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        
        console.error("[Course Time Slots] Error message to show:", errorMessage);
        toast.error(errorMessage);
      } else {
        console.log("[Course Time Slots] 404 - No time slots found (this is valid)");
      }
      setCourseTimeSlots([]);
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    
    // Ensure course time slots are loaded when opening dialog
    // Always fetch to ensure we have the latest data from course_time_slots table
    if (!timeSlotsLoading) {
      fetchCourseTimeSlots();
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
        course_time_slot_ids: announcement.course_time_slot_ids || [],
        is_pinned: announcement.is_pinned || false,
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
        course_time_slot_ids: [],
        is_pinned: false,
      });
      setTargetAudience(defaultTargetAudience);
      previousTargetAudienceRef.current = defaultTargetAudience;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
    setSelectedImages([]);
    setSelectedPdfs([]);
    setSelectedTimetables([]);
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

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', data.title || '');
      formData.append('message', data.message || '');
      formData.append('priority', data.priority);
      
      // Append target_audience as array
      const targetAudienceArray = Array.isArray(data.target_audience) ? data.target_audience : [data.target_audience];
      targetAudienceArray.forEach((audience, index) => {
        formData.append(`target_audience[${index}]`, audience);
      });
      
      formData.append('start_date_time', startDateTime);
      formData.append('end_date_time', endDateTime);

      // Append course_time_slot_ids
      const courseTimeSlotIds = data.course_time_slot_ids || [];
      console.log("[Announcement Submit] Course time slot IDs:", courseTimeSlotIds);
      courseTimeSlotIds.forEach((id, index) => {
        formData.append(`course_time_slot_ids[${index}]`, id);
      });

      // Append is_pinned
      formData.append('is_pinned', data.is_pinned ? '1' : '0');

      // class_ids removed - using course_time_slots instead

      // Append files
      selectedImages.forEach((file) => {
        formData.append('announcement_images[]', file);
      });
      selectedPdfs.forEach((file) => {
        formData.append('announcement_pdfs[]', file);
      });
      selectedTimetables.forEach((file) => {
        formData.append('announcement_timetables[]', file);
      });

      console.log("[Announcement Submit] FormData prepared:", {
        title: data.title,
        message: data.message?.substring(0, 50),
        course_time_slot_ids: courseTimeSlotIds,
        course_time_slot_ids_count: courseTimeSlotIds.length,
        is_edit_mode: isEditMode
      });

      let response;
      if (isEditMode) {
        response = await api.post(`admin/announcements/${selectedAnnouncement.id}?_method=PUT`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post("admin/announcements", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
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
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.keys(errors).forEach((key) => {
            toast.error(`${key}: ${errors[key].join(", ")}`);
          });
        }
      } else {
        const errorMessage = error.response?.data?.message || error.message || `Failed to ${isEditMode ? "update" : "create"} announcement`;
        toast.error(errorMessage);
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

    // Target audience filter
    if (filterTargetAudience && filterTargetAudience !== "all") {
      const announcementAudience = announcement.target_audience || announcement.target_roles || [];
      const audienceArray = Array.isArray(announcementAudience) 
        ? announcementAudience.map(a => typeof a === 'string' ? a.toLowerCase() : String(a).toLowerCase())
        : [String(announcementAudience).toLowerCase() || ""];
      
      // Check if the filter audience is in the announcement's audience
      const matchesAudience = audienceArray.includes(filterTargetAudience.toLowerCase()) ||
        audienceArray.includes("all") ||
        (audienceArray.length === 3 && audienceArray.includes("admin") && audienceArray.includes("parent") && audienceArray.includes("student"));
      
      if (!matchesAudience) return false;
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Filter by Audience</InputLabel>
                <Select
                  value={filterTargetAudience}
                  onChange={(e) => setFilterTargetAudience(e.target.value)}
                  label="Filter by Audience"
                  input={<OutlinedInput label="Filter by Audience" />}
                >
                  <MenuItem value="all">All Audiences</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1} sx={{ textAlign: { xs: "left", md: "right" } }}>
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
                <TableCell sx={{ fontWeight: 600 }}>Course Time Slots</TableCell>
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
                  // class_ids removed - using course_time_slots instead
                  
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
                        const audience = announcement.target_audience || announcement.target_roles;
                        let audienceArray = [];
                        
                        if (Array.isArray(audience)) {
                          audienceArray = audience.map(a => typeof a === 'string' ? a.toLowerCase() : String(a).toLowerCase());
                        } else if (audience) {
                          audienceArray = [String(audience).toLowerCase()];
                        } else {
                          audienceArray = ["all"];
                        }
                        
                        // Check if all audiences are included
                        const hasAll = audienceArray.includes("all") || 
                          (audienceArray.includes("admin") && audienceArray.includes("parent") && audienceArray.includes("student"));
                        
                        if (hasAll || audienceArray.length === 0) {
                          return <Chip label="All" size="small" color="default" />;
                        }
                        
                        return (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {audienceArray.filter(a => a && a !== "all").map((aud, idx) => (
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
                        {announcement.course_time_slot_ids && announcement.course_time_slot_ids.length > 0 ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {announcement.course_time_slot_ids.slice(0, 2).map((slotId) => {
                              const slot = courseTimeSlots.find(s => s.id === slotId);
                              return slot ? (
                                <Chip
                                  key={slotId}
                                  label={slot.display_name || slot.class_name || `Slot ${slotId}`}
                                  size="small"
                                  color="primary"
                                  title={slot.display_name || slot.class_name || `Slot ${slotId}`}
                                />
                              ) : (
                                <Chip
                                  key={slotId}
                                  label={`Slot ${slotId}`}
                                  size="small"
                                  color="default"
                                />
                              );
                            })}
                            {announcement.course_time_slot_ids.length > 2 && (
                              <Chip
                                label={`+${announcement.course_time_slot_ids.length - 2} more`}
                                size="small"
                                color="default"
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            All Time Slots
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

              {/* Pinned Status */}
              <Grid item xs={12}>
                <Controller
                  name="is_pinned"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Pin this announcement
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (Pinned announcements appear at the top)
                          </Typography>
                        </Box>
                      }
                    />
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

              {/* Course Time Slot Selection */}
              <Grid item xs={12}>
                <Controller
                  name="course_time_slot_ids"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Select Course Time Slots (Optional)</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Select Course Time Slots (Optional)"
                        input={<OutlinedInput label="Select Course Time Slots (Optional)" />}
                        renderValue={(selected) => {
                          if (selected.length === 0) return "";
                          if (selected.length > 3) {
                            return `${selected.length} time slots selected`;
                          }
                          const selectedSlots = courseTimeSlots.filter(slot => selected.includes(slot.id));
                          return selectedSlots.map(slot => slot.display_name || slot.class_name || `Slot ${slot.id}`).join(", ");
                        }}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      >
                        {courseTimeSlots.map((slot) => {
                          const isChecked = field.value && field.value.includes(slot.id);
                          return (
                            <MenuItem key={slot.id} value={slot.id}>
                              <Checkbox checked={isChecked} />
                              <ListItemText 
                                primary={slot.display_name}
                                secondary={`${slot.course_name} - ${slot.academic_year}`}
                              />
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {timeSlotsLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 1.75 }}>
                          <CircularProgress size={14} />
                          <Typography variant="caption" color="text.secondary">
                            Loading course time slots...
                          </Typography>
                        </Box>
                      ) : courseTimeSlots.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                          No course time slots available. Please add course time slots first.
                        </Typography>
                      ) : null}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* File Uploads Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
                  Attachments (Optional)
                </Typography>
              </Grid>

              {/* Images Upload */}
              <Grid item xs={12} md={4}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    multiple
                    type="file"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setSelectedImages([...selectedImages, ...files]);
                    }}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Upload Images
                    </Button>
                  </label>
                  {selectedImages.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {selectedImages.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setSelectedImages(selectedImages.filter((_, i) => i !== index));
                          }}
                          deleteIcon={<CloseIcon />}
                          sx={{ mr: 0.5, mb: 0.5 }}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* PDFs Upload */}
              <Grid item xs={12} md={4}>
                <Box>
                  <input
                    accept=".pdf"
                    style={{ display: 'none' }}
                    id="pdf-upload"
                    multiple
                    type="file"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setSelectedPdfs([...selectedPdfs, ...files]);
                    }}
                  />
                  <label htmlFor="pdf-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PdfIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Upload PDFs
                    </Button>
                  </label>
                  {selectedPdfs.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {selectedPdfs.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setSelectedPdfs(selectedPdfs.filter((_, i) => i !== index));
                          }}
                          deleteIcon={<CloseIcon />}
                          sx={{ mr: 0.5, mb: 0.5 }}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Timetables Upload */}
              <Grid item xs={12} md={4}>
                <Box>
                  <input
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="timetable-upload"
                    multiple
                    type="file"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setSelectedTimetables([...selectedTimetables, ...files]);
                    }}
                  />
                  <label htmlFor="timetable-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<FileIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Upload Timetables
                    </Button>
                  </label>
                  {selectedTimetables.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {selectedTimetables.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setSelectedTimetables(selectedTimetables.filter((_, i) => i !== index));
                          }}
                          deleteIcon={<CloseIcon />}
                          sx={{ mr: 0.5, mb: 0.5 }}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
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

