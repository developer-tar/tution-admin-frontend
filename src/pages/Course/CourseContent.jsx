
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
  Avatar
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

// ✅ Yup validation schema
const schema = yup.object().shape({
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
    .min(1, "At least one file is required")
    .test("fileTypes", "Some files have unsupported formats", (files) => {
      if (!files || files.length === 0) return false;
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
    .test("fileSizes", "Some files are too large", (files) => {
      if (!files) return true;
      return files.every(file => file.size <= 512000 * 1024); // 500MB each
    }),
});

const CourseContent = () => {
  const [academicCourses, setAcademicCourses] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
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

  const onSubmit = async (formData) => {
    const data = new FormData();
    data.append("course_assigment_id", formData.courseAssignmentId);
    data.append("subject_id", formData.subjectId);
    data.append("topic_name", formData.topic);
    data.append("subtopic_name", formData.subTopic || "");
    
    // Append all files with proper naming
    formData.files.forEach((file, index) => {
      data.append(`content_upload[${index}]`, file);
    });

    try {
      await api.post("admin/assign/topic/subtopic", data);
      toast.success("Content uploaded successfully!");
      reset(); // clear form
    } catch (error) {
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;
        Object.values(backendErrors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to upload content");
      }
    }
  };

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
            Upload Content
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
          Upload videos, PDFs, and images for course topics and subtopics
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
                      Upload Course Content
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Supported formats: MP4, MOV, AVI, WMV, PDF, JPG, JPEG, PNG (Max: 500MB)
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
                    sx={{
                      ...gradientButtonStyle,
                      px: 6,
                      py: 2,
                      fontSize: '16px',
                      minWidth: 200
                    }}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Content
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
