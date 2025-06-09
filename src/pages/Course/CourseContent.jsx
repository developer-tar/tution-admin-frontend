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
import { button, icon } from "../style";
import { toast } from "react-toastify";
import api from "../../api";

const CourseContent = () => {
  const [academicCourses, setAcademicCourses] = useState([]); // ⬅ Academic Year = Academic Course
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    academicYear: "", // actually academic_course_id
    courseAssignmentId: "",
    subjectId: "",
    topic: "",
    subTopic: "",
    contentType: "",
    file1: null,
    file2: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileKey) => {
    setFormData((prev) => ({
      ...prev,
      [fileKey]: e.target.files[0],
    }));
  };

  // ✅ Step 1: Fetch academic course (year) records on load
  useEffect(() => {
    const fetchAcademicCourses = async () => {
      try {
        const res = await api.get("admin/ca_records");
        setAcademicCourses(res.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch academic course records");
      }
    };

    fetchAcademicCourses();
  }, []);

  // ✅ Step 2: Fetch subjects & assignments when academicYear (courseId) is selected
  useEffect(() => {
    const fetchDetails = async () => {
      if (!formData.academicYear) return;

      try {
        const res = await api.get(`admin/ca_based_weeks_subjects/${formData.academicYear}`);
        setCourseAssignments(res.data.data.assignments || []);
        setSubjects(res.data.data.subjects || []);
      } catch (error) {
        toast.error("Failed to fetch assignments or subjects");
      }
    };

    fetchDetails();
  }, [formData.academicYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadData = new FormData();
    uploadData.append("course_assigment_id", formData.courseAssignmentId);
    uploadData.append("subject_id", formData.subjectId);
    uploadData.append("topic_name", formData.topic);
    uploadData.append("subtopic_name", formData.subTopic);

    if (formData.file1) uploadData.append("content_upload[0]", formData.file1);
    if (formData.file2) uploadData.append("content_upload[1]", formData.file2);

    try {
      await api.post("admin/assign/topic/subtopic", uploadData);
      toast.success("Content uploaded successfully!");
      setFormData({
        academicYear: "",
        courseAssignmentId: "",
        subjectId: "",
        topic: "",
        subTopic: "",
        contentType: "",
        file1: null,
        file2: null,
      });
    } catch (error) {
      toast.error("Failed to upload content");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight={700}>
        Course Content
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Academic Year (from ca_records) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                label="Academic Year"
              >
                {academicCourses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name || `Course ${course.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Assignment */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Assignment</InputLabel>
              <Select
                name="courseAssignmentId"
                value={formData.courseAssignmentId}
                onChange={handleChange}
                label="Assignment"
              >
                {courseAssignments.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name || `Assignment ${a.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Subject */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                label="Subject"
              >
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Topic */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="topic"
              label="Topic"
              value={formData.topic}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* SubTopic */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="subTopic"
              label="Sub Topic"
              value={formData.subTopic}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* File Upload 1 */}
          <Grid item xs={12} sm={6}>
            <Button variant="outlined" component="label" fullWidth>
              Upload File 1
              <input
                type="file"
                hidden
                onChange={(e) => handleFileChange(e, "file1")}
              />
            </Button>
            {formData.file1 && (
              <Typography variant="body2" mt={1}>
                Selected: {formData.file1.name}
              </Typography>
            )}
          </Grid>

          {/* File Upload 2 */}
          <Grid item xs={12} sm={6}>
            <Button variant="outlined" component="label" fullWidth>
              Upload File 2
              <input
                type="file"
                hidden
                onChange={(e) => handleFileChange(e, "file2")}
              />
            </Button>
            {formData.file2 && (
              <Typography variant="body2" mt={1}>
                Selected: {formData.file2.name}
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
