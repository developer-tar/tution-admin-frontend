import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Chip,
  Autocomplete
} from '@mui/material';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { button, h2, icon } from '../style';
import api from "../../api";
import { toast } from 'react-toastify';

const CourseAssignment = () => {
  const [academicCourses, setAcademicCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('admin/ca_records');
        setAcademicCourses(res.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch academic records");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchWeeks = async () => {
      try {
        const res = await api.get(`admin/ca_based_remaining_weeks/${selectedCourseId}`);
        setWeeks(res.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch weeks");
      }
    };
    fetchWeeks();
  }, [selectedCourseId]);

  const handleSave = async () => {
    if (!selectedCourseId || selectedWeeks.length === 0) {
      toast.error("Please select a course and at least one week");
      return;
    }

    const formData = new FormData();
    formData.append("acdemic_course_id", selectedCourseId);
    selectedWeeks.forEach((id, i) => formData.append(`week_ids[${i}]`, id));

    try {
      setLoading(true);
      await api.post('admin/assign/assignment', formData);
      toast.success("Assignment created successfully");
    } catch (err) {
      toast.error("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        mb={3}
        sx={{ fontWeight: 700, color: "#263238", textAlign: 'center' }}
      >
        Course Assignment
      </Typography>

      <Grid container spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Academic Course */}
        <Grid item xs={12}>
          <Autocomplete
            options={academicCourses}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={academicCourses.find((c) => c.id === selectedCourseId) || null}
            onChange={(e, newValue) => {
              setSelectedCourseId(newValue ? newValue.id : '');
              setSelectedWeeks([]);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Choose Academic Course"
                placeholder="Select a course"
                fullWidth
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 1,
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
                  '& .MuiOutlinedInput-root': {
                    padding: '10px',
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Weeks */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={weeks}
            getOptionLabel={(option) => option.name}
            value={weeks.filter((w) => selectedWeeks.includes(w.id))}
            onChange={(e, newValue) => {
              setSelectedWeeks(newValue.map((item) => item.id));
            }}
            disableCloseOnSelect
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 500,
                    m: 0.5,
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Weeks"
                placeholder="Choose available weeks"
                fullWidth
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 1,
                  boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
                  '& .MuiOutlinedInput-root': {
                    padding: '10px',
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            disableElevation
            sx={button}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
            <Box sx={icon}>
              <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
            </Box>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseAssignment;
