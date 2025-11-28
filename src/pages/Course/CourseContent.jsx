
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  Select,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Link
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { button, icon } from "../style";

const gradientButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 600,
  px: 3,
  py: 1.5,
  borderRadius: 3,
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8, #6a42a0)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
  },
  transition: 'all 0.3s ease'
};

// ✅ Yup validation schema - files optional for edit mode
const createSchema = (isEditMode) => yup.object().shape({
  academicYear: yup.string().required("Academic year is required"),
  courseAssignmentId: yup
    .string()
    .required("Assignment is required")
    .matches(/^\d+$/, "Invalid assignment"),
  subjectId: yup
    .string()
    .required("Subject is required")
    .matches(/^\d+$/, "Invalid subject"),
  topic: yup.string().required("Topic is required"),
  subTopic: yup.string().nullable(),
  files: yup
    .array()
    .when([], {
      is: () => !isEditMode,
      then: (schema) => schema.min(1, "At least one file is required"),
      otherwise: (schema) => schema
    })
    .test("fileTypes", "Some files have unsupported formats", (files) => {
      if (!files || files.length === 0) return true; // Allow empty for edit mode
      const supportedFormats = [
        "video/mp4",
        "video/mov", 
        "video/avi",
        "video/wmv",
        "application/pdf",
        "image/jpg",
        "image/jpeg",
        "image/png",
      ];
      return files.every(file => supportedFormats.includes(file.type));
    })
    .test("fileSizes", "Some files are too large (max 50MB each)", (files) => {
      if (!files) return true;
      return files.every(file => file.size <= 50 * 1024 * 1024); // 50MB each
    })
    .test("maxFiles", "Maximum 10 files allowed", (files) => {
      if (!files) return true;
      return files.length <= 10;
    }),
});

const CourseContent = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const isSubtopic = type === 'subtopic';
  const [academicCourses, setAcademicCourses] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createSchema(isEditMode)),
    defaultValues: {
      academicYear: "",
      courseAssignmentId: "",
      subjectId: "",
      topic: "",
      subTopic: "",
      files: [],
    },
  });

  const academicYear = watch("academicYear");

  // ✅ Fetch academic course (year)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("admin/ca_records");
        setAcademicCourses(res.data.data || []);
      } catch {
        toast.error("Failed to fetch academic course records");
      }
    };
    fetchCourses();
  }, []);

  // ✅ Fetch subjects & assignments
  useEffect(() => {
    if (!academicYear) return;

    const fetchDetails = async () => {
      try {
        const res = await api.get(`admin/ca_based_weeks_subjects/${academicYear}`);
        setCourseAssignments(res.data.data.assignments || []);
        setSubjects(res.data.data.subjects || []);
      } catch {
        toast.error("Failed to fetch assignments or subjects");
      }
    };
    fetchDetails();
  }, [academicYear]);

  // Handle multiple file upload
  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    const currentFiles = watch("files") || [];
    const updatedFiles = [...currentFiles, ...newFiles];
    setValue("files", updatedFiles);
  };

  // Handle file deletion
  const handleFileDelete = (indexToDelete) => {
    const currentFiles = watch("files") || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToDelete);
    setValue("files", updatedFiles);
  };

  // Fetch topic/subtopic data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchContentData = async () => {
        setFetchingContent(true);
        try {
          const endpoint = isSubtopic
            ? `admin/assign/topic/subtopic/subtopic/${id}`
            : `admin/assign/topic/subtopic/${id}`;
          
          const response = await api.get(endpoint);
          if (response.data.success) {
            const contentData = response.data.data;
            
            // Set form values
            setValue("courseAssignmentId", contentData.course_assigment_id || "");
            setValue("subjectId", contentData.subject_id || "");
            setValue("topic", contentData.topic_name || "");
            if (isSubtopic && contentData.subtopic_name) {
              setValue("subTopic", contentData.subtopic_name);
            }
            
            // Set academic year from course assignment
            if (contentData.course_assigment_id) {
              // Fetch assignment to get academic year
              try {
                const assignmentRes = await api.get(`admin/assign/assignment/${contentData.course_assigment_id}`);
                if (assignmentRes.data.success) {
                  const assignment = assignmentRes.data.data;
                  // Get academic year from course
                  if (assignment.acdemic_course_id) {
                    const courseRes = await api.get(`admin/ca_records`);
                    const course = courseRes.data.data?.find(c => c.id === assignment.acdemic_course_id);
                    if (course) {
                      setValue("academicYear", course.id);
                    }
                  }
                }
              } catch (err) {
                console.error("Error fetching assignment:", err);
              }
            }
            
            // Set existing files
            if (contentData.content_upload && Array.isArray(contentData.content_upload)) {
              setExistingFiles(contentData.content_upload);
            }
          }
        } catch (err) {
          console.error('Error fetching content:', err);
          if (err.response?.status === 404) {
            toast.error(isSubtopic ? 'Subtopic not found' : 'Topic not found');
            navigate('/admin/topic/subtopic-list');
          } else {
            toast.error('Failed to load content data');
          }
        } finally {
          setFetchingContent(false);
        }
      };
      fetchContentData();
    }
  }, [id, isEditMode, isSubtopic, setValue, navigate]);

  const onSubmit = async (formData) => {
    setLoading(true);
    const data = new FormData();
    data.append("course_assigment_id", formData.courseAssignmentId);
    data.append("subject_id", formData.subjectId);
    data.append("topic_name", formData.topic);
    data.append("subtopic_name", formData.subTopic || "");
    
    // Append all files with proper naming (if new files provided, ALL old files will be deleted)
    // Use content_upload[] format as per API documentation
    if (formData.files && formData.files.length > 0) {
      formData.files.forEach((file) => {
        data.append('content_upload[]', file);
      });
    }

    try {
      let endpoint;
      if (isEditMode) {
        if (isSubtopic) {
          endpoint = `admin/assign/topic/subtopic/subtopic/${id}`;
        } else {
          endpoint = `admin/assign/topic/subtopic/${id}`;
        }
        await api.put(endpoint, data);
        toast.success("Content updated successfully!");
      } else {
        endpoint = "admin/assign/topic/subtopic";
        await api.post(endpoint, data);
        toast.success("Content uploaded successfully!");
        reset();
      }
      
      // Redirect to topic/subtopic list page
      navigate("/admin/topic/subtopic-list");
    } catch (error) {
      console.error('Content save error:', error.response || error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error(error.response.data?.message || 'Validation error occurred');
        }
      } else if (error.response?.status === 404) {
        toast.error(isSubtopic ? 'Subtopic not found' : 'Topic not found');
        if (isEditMode) {
          navigate('/admin/topic/subtopic-list');
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(isEditMode ? "Failed to update content" : "Failed to upload content");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingContent) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading content data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
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
          <CloudUploadIcon sx={{ fontSize: 20, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {isEditMode ? (isSubtopic ? 'Edit Subtopic Content' : 'Edit Topic Content') : 'Upload Content'}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
          {isEditMode 
            ? (isSubtopic 
                ? 'Update videos, PDFs, and images for this subtopic'
                : 'Update videos, PDFs, and images for this topic')
            : 'Upload videos, PDFs, and images for course topics and subtopics'
          }
        </Typography>
      </Box>

      {/* Main Form Card */}
      <Card sx={{ 
        // maxWidth: 900, 
        // mx: 'auto', 
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <CardContent sx={{ p: 4 }} >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Academic Year Section */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    }}>
                      📅
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                      Academic Year
                    </Typography>
                  </Box>
                  <Controller
                    name="academicYear"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.academicYear}>
                        <Select 
                          {...field} 
                          displayEmpty
                          sx={{
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <MenuItem value="" disabled>Select Academic Year</MenuItem>
                          {academicCourses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                              {course.name || `Course ${course.id}`}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.academicYear && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.academicYear?.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Paper>
              </Grid>

              {/* Assignment Section */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fff8f0 0%, #fef3e8 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' 
                    }}>
                      📋
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                      Assignment
                    </Typography>
                  </Box>
                  <Controller
                    name="courseAssignmentId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.courseAssignmentId}>
                        <Select 
                          {...field} 
                          displayEmpty
                          sx={{
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <MenuItem value="" disabled>Select Assignment</MenuItem>
                          {courseAssignments.map((a) => (
                            <MenuItem key={a.id} value={a.id}>
                              {a.name || `Assignment ${a.id}`}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.courseAssignmentId && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.courseAssignmentId?.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Paper>
              </Grid>

              {/* Subject Section */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f0fff4 0%, #e8f5e8 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' 
                    }}>
                      📚
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                      Subject
                    </Typography>
                  </Box>
                  <Controller
                    name="subjectId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.subjectId}>
                        <Select 
                          {...field} 
                          displayEmpty
                          sx={{
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <MenuItem value="" disabled>Select Subject</MenuItem>
                          {subjects.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.subjectId && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.subjectId?.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Paper>
              </Grid>

              {/* Topic Section */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fef7ff 0%, #f3e5f5 100%)',
                  border: '1px solid rgba(156, 39, 176, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' 
                    }}>
                      📖
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                      Topic
                    </Typography>
                  </Box>
                  <Controller
                    name="topic"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Enter topic name"
                        fullWidth
                        error={!!errors.topic}
                        helperText={errors.topic?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '& fieldset': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      />
                    )}
                  />
                </Paper>
              </Grid>

              {/* Sub Topic Section */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)',
                  border: '1px solid rgba(139, 195, 74, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)' 
                    }}>
                      📝
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#263238' }}>
                      Sub Topic (Optional)
                    </Typography>
                  </Box>
                  <Controller
                    name="subTopic"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Enter subtopic name"
                        fullWidth
                        error={!!errors.subTopic}
                        helperText={errors.subTopic?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '& fieldset': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      />
                    )}
                  />
                </Paper>
              </Grid>

              {/* Existing Files Section (Edit Mode) */}
              {isEditMode && existingFiles.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.2)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#263238' }}>
                      Current Files ({existingFiles.length})
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#666' }}>
                      Note: Uploading new files will replace all existing files
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 2,
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {existingFiles.map((fileUrl, index) => {
                        const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                        const isVideo = fileUrl.match(/\.(mp4|mov|avi|wmv)$/i);
                        const isPdf = fileUrl.match(/\.pdf$/i);
                        const isImage = fileUrl.match(/\.(jpg|jpeg|png)$/i);
                        
                        return (
                          <Card key={index} sx={{ 
                            p: 2, 
                            minWidth: 200,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              {isVideo && <VideoLibraryIcon color="primary" />}
                              {isPdf && <PictureAsPdfIcon color="error" />}
                              {isImage && <ImageIcon color="success" />}
                              {!isVideo && !isPdf && !isImage && <AttachFileIcon />}
                              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {fileName}
                              </Typography>
                            </Box>
                            <Link 
                              href={fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ fontSize: '0.75rem', textDecoration: 'none' }}
                            >
                              View/Download
                            </Link>
                          </Card>
                        );
                      })}
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* File Upload Section */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                  border: '2px dashed rgba(255, 152, 0, 0.3)',
                  textAlign: 'center'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 64, 
                      height: 64, 
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' 
                    }}>
                      <CloudUploadIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#263238' }}>
                      {isEditMode ? 'Upload New Files (Replaces Existing)' : 'Upload Course Content'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Supported formats: MP4, MOV, AVI, WMV, PDF, JPG, JPEG, PNG (Max: 50MB per file, 10 files max)
                      {isEditMode && existingFiles.length > 0 && (
                        <Box component="span" sx={{ display: 'block', mt: 1, color: 'warning.main', fontWeight: 600 }}>
                          ⚠️ Uploading new files will delete all existing files
                        </Box>
                      )}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      component="label" 
                      sx={gradientButtonStyle}
                      startIcon={<AttachFileIcon />}
                    >
                      Choose Files
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="video/*,application/pdf,image/*"
                        onChange={handleFileUpload}
                      />
                    </Button>
                    
                    {/* Multiple Files Preview */}
                    <Controller
                      name="files"
                      control={control}
                      render={({ field }) => (
                        field.value && field.value.length > 0 && (
                          <Box sx={{ mt: 3, width: '100%' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                              Selected Files ({field.value.length})
                            </Typography>
                            <Box sx={{ 
                              maxHeight: '400px',
                              overflowY: 'auto',
                              pr: 1,
                              // Custom scrollbar styling
                              "&::-webkit-scrollbar": {
                                width: "8px",
                              },
                              "&::-webkit-scrollbar-track": {
                                background: "rgba(0,0,0,0.05)",
                                borderRadius: "10px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "10px",
                                border: "1px solid rgba(255,255,255,0.2)",
                              },
                              "&::-webkit-scrollbar-thumb:hover": {
                                background: "linear-gradient(180deg, #3B2A9F 0%, #D62926 100%)",
                              },
                              // Firefox support
                              scrollbarWidth: "thin",
                              scrollbarColor: "#667eea rgba(0,0,0,0.05)",
                            }}>
                              <Grid container spacing={2}>
                                {field.value.map((file, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                  <Card sx={{ 
                                    p: 2,
                                    backgroundColor: 'white', 
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    '&:hover .delete-btn': {
                                      opacity: 1
                                    }
                                  }}>
                                    {/* Delete Button */}
                                    <Box 
                                      className="delete-btn"
                                      sx={{ 
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease',
                                        zIndex: 2
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        onClick={() => handleFileDelete(index)}
                                        sx={{
                                          minWidth: 'auto',
                                          width: 32,
                                          height: 32,
                                          borderRadius: '50%',
                                          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                          color: 'white',
                                          '&:hover': {
                                            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                                            transform: 'scale(1.1)'
                                          }
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                      </Button>
                                    </Box>

                                    {/* File Content */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                                      {/* File Type Icon */}
                                      <Avatar sx={{ 
                                        width: 40, 
                                        height: 40,
                                        background: file.type?.startsWith('video/') ? 
                                          'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)' :
                                          file.type === 'application/pdf' ?
                                          'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' :
                                          'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                                      }}>
                                        {file.type?.startsWith('video/') && <VideoLibraryIcon sx={{ fontSize: 20 }} />}
                                        {file.type === 'application/pdf' && <PictureAsPdfIcon sx={{ fontSize: 20 }} />}
                                        {file.type?.startsWith('image/') && <ImageIcon sx={{ fontSize: 20 }} />}
                                      </Avatar>

                                      {/* File Info */}
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography 
                                          variant="body2" 
                                          fontWeight={600}
                                          sx={{ 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </Typography>
                                        <Chip 
                                          label={file.type?.split('/')[1]?.toUpperCase() || 'FILE'} 
                                          size="small"
                                          sx={{ 
                                            mt: 0.5,
                                            height: 20,
                                            fontSize: '10px',
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            color: '#667eea'
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Card>
                                </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Box>
                        )
                      )}
                    />
                    
                    {errors.files && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {errors.files?.message}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  <Button 
                    type="submit" 
                    size="large"
                    disabled={loading || fetchingContent}
                    sx={{
                      ...gradientButtonStyle,
                      px: 6,
                      py: 2,
                      fontSize: '16px',
                      minWidth: 200,
                      '&:disabled': {
                        opacity: 0.6,
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CloudUploadIcon />}
                    endIcon={!loading && <ArrowForwardIcon />}
                  >
                    {loading 
                      ? (isEditMode ? 'Updating...' : 'Uploading...')
                      : (isEditMode ? 'Update Content' : 'Upload Content')
                    }
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseContent;
