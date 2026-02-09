import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import api from "../../api";

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%", background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, color: "#fff" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography color="inherit" variant="body2" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ opacity: 0.9 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const TutorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("tutor/dashboard");
        if (res.data?.success) setData(res.data.data);
        else setError("Failed to load dashboard");
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  const d = data || {};
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Courses"
            value={d.courses_count ?? 0}
            icon={<SchoolIcon sx={{ fontSize: 48 }} />}
            color="#3B2A9F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Students"
            value={d.students_count ?? 0}
            icon={<PeopleIcon sx={{ fontSize: 48 }} />}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Assignments"
            value={d.assignments_count ?? 0}
            icon={<AssignmentIcon sx={{ fontSize: 48 }} />}
            color="#764ba2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Timeslots"
            value={d.timeslots_count ?? 0}
            icon={<AccessTimeIcon sx={{ fontSize: 48 }} />}
            color="#D62926"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tests"
            value={d.tests_count ?? 0}
            icon={<QuizIcon sx={{ fontSize: 48 }} />}
            color="#3B2A9F"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TutorDashboard;
