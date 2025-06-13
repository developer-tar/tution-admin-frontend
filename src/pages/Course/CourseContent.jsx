
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
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../../api";
import { button, icon } from "../style";

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
  file: yup
    .mixed()
    .required("File is required")
    .test("fileType", "Unsupported file format", (value) => {
      if (!value) return false;
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
      return supportedFormats.includes(value.type);
    })
    .test("fileSize", "File is too large", (value) => {
      return value && value.size <= 512000 * 1024; // 500MB
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
      file: null,
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

  const onSubmit = async (formData) => {
    const data = new FormData();
    data.append("course_assigment_id", formData.courseAssignmentId);
    data.append("subject_id", formData.subjectId);
    data.append("topic_name", formData.topic);
    data.append("subtopic_name", formData.subTopic || "");
    data.append("content_upload[0]", formData.file);

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight={700}>
        Course Content
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Academic Year */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="academicYear"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.academicYear}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select {...field} label="Academic Year">
                    {academicCourses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name || `Course ${course.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="error">
                    {errors.academicYear?.message}
                  </Typography>
                </FormControl>
              )}
            />
          </Grid>

          {/* Assignment */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="courseAssignmentId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.courseAssignmentId}>
                  <InputLabel>Assignment</InputLabel>
                  <Select {...field} label="Assignment">
                    {courseAssignments.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.name || `Assignment ${a.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="error">
                    {errors.courseAssignmentId?.message}
                  </Typography>
                </FormControl>
              )}
            />
          </Grid>

          {/* Subject */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="subjectId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.subjectId}>
                  <InputLabel>Subject</InputLabel>
                  <Select {...field} label="Subject">
                    {subjects.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="error">
                    {errors.subjectId?.message}
                  </Typography>
                </FormControl>
              )}
            />
          </Grid>

          {/* Topic */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="topic"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Topic"
                  fullWidth
                  error={!!errors.topic}
                  helperText={errors.topic?.message}
                />
              )}
            />
          </Grid>

          {/* Sub Topic */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="subTopic"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sub Topic"
                  fullWidth
                  error={!!errors.subTopic}
                  helperText={errors.subTopic?.message}
                />
              )}
            />
          </Grid>

          {/* File Upload */}
          <Grid item xs={12} sm={6}>
            <Button variant="outlined" component="label" fullWidth>
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setValue("file", e.target.files[0])}
              />
            </Button>
            {errors.file && (
              <Typography variant="caption" color="error">
                {errors.file?.message}
              </Typography>
            )}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" disableElevation sx={button}>
              Save
              <Box sx={icon}>
                <ArrowForwardIcon sx={{ fontSize: 20, color: "#EF2A1E" }} />
              </Box>
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CourseContent;
