import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Announcements from "../../components/Announcements";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

// Mock Data
const students = [
  {
    id: "1",
    name: "Tarun",
    courses: [
      {
        id: "c1",
        name: "Mathematics",
        subscriptionStatus: "Active",
        nextBillingCycle: "2025-08-01",
        latestReport: { subject: "Mathematics", score: 85, date: "2025-07-10" },
      },
      {
        id: "c2",
        name: "Science",
        subscriptionStatus: "Expired",
        nextBillingCycle: null,
        latestReport: { subject: "Science", score: 78, date: "2025-06-15" },
      },
    ],
  },
  {
    id: "2",
    name: "Priya",
    courses: [
      {
        id: "c1",
        name: "Mathematics",
        subscriptionStatus: "Active",
        nextBillingCycle: "2025-08-15",
        latestReport: { subject: "Mathematics", score: 92, date: "2025-07-05" },
      },
    ],
  },
];

// Recent activities mock
const recentActivities = [
  { id: 1, text: "Tarun completed Quiz 1 in Mathematics", date: "2025-07-12" },
  { id: 2, text: "Priya subscription renewed for Mathematics", date: "2025-07-01" },
  { id: 3, text: "Tarun scored 85% in Mathematics latest test", date: "2025-07-10" },
];

// Prepare data for Bar Chart: students per course
const getCourseStudentCount = (studentsData) => {
  const countMap = {};
  studentsData.forEach((student) => {
    student.courses.forEach((course) => {
      countMap[course.name] = (countMap[course.name] || 0) + 1;
    });
  });
  return Object.entries(countMap).map(([name, count]) => ({ name, count }));
};

// Prepare data for Pie Chart: subscription status count
const getSubscriptionStatusCount = (studentsData) => {
  let active = 0,
    expired = 0;
  studentsData.forEach((student) => {
    student.courses.forEach((course) => {
      if (course.subscriptionStatus === "Active") active++;
      else if (course.subscriptionStatus === "Expired") expired++;
    });
  });
  return [
    { name: "Active", value: active },
    { name: "Expired", value: expired },
  ];
};

// Prepare data for Line Chart: average scores over months (mock)
const averageScoresOverTime = [
  { month: "Jan", score: 78 },
  { month: "Feb", score: 82 },
  { month: "Mar", score: 80 },
  { month: "Apr", score: 85 },
  { month: "May", score: 88 },
  { month: "Jun", score: 90 },
  { month: "Jul", score: 87 },
];

const COLORS = ["#4caf50", "#f44336"]; // Active: Green, Expired: Red

const Dashboard = () => {
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Filter data based on selected student
  const filteredStudents = useMemo(() => {
    if (!selectedStudentId) return students;
    return students.filter((s) => s.id === selectedStudentId);
  }, [selectedStudentId]);

  const courseStudentCount = useMemo(
    () => getCourseStudentCount(filteredStudents),
    [filteredStudents]
  );

  const subscriptionStatusCount = useMemo(
    () => getSubscriptionStatusCount(filteredStudents),
    [filteredStudents]
  );

  // Aggregate totals from filtered students
  const totalStudents = filteredStudents.length;
  const totalActiveSubs = subscriptionStatusCount.find((s) => s.name === "Active")?.value || 0;
  const totalExpiredSubs = subscriptionStatusCount.find((s) => s.name === "Expired")?.value || 0;

  const allScores = filteredStudents.flatMap((s) =>
    s.courses.map((c) => c.latestReport.score)
  );
  const averageScore = allScores.length
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : "-";

  // Filter recent activities to selected student only (or show all)
  const filteredActivities = useMemo(() => {
    if (!selectedStudentId) return recentActivities;
    const studentName = students.find((s) => s.id === selectedStudentId)?.name;
    if (!studentName) return [];
    return recentActivities.filter((activity) =>
      activity.text.startsWith(studentName)
    );
  }, [selectedStudentId]);

  return (
    <Box p={4} sx={{ bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography variant="h4" mb={3} fontWeight={700}>
        Parent Dashboard
      </Typography>

      {/* Announcements Section */}
      <Announcements role="parent" />

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Total Students
            </Typography>
            <Typography variant="h3" color="primary" fontWeight={700}>
              {totalStudents}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Active Subscriptions
            </Typography>
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {totalActiveSubs}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Expired Subscriptions
            </Typography>
            <Typography variant="h3" color="error.main" fontWeight={700}>
              {totalExpiredSubs}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Average Score
            </Typography>
            <Typography variant="h3" color="secondary.main" fontWeight={700}>
              {averageScore}%
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Student Filter */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel id="select-student-label">Filter by Student</InputLabel>
        <Select
          labelId="select-student-label"
          value={selectedStudentId}
          label="Filter by Student"
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <MenuItem value="">All Students</MenuItem>
          {students.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              {student.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={4}>
        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Students per Course
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={courseStudentCount}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3f51b5" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Subscription Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionStatusCount}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {subscriptionStatusCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Average Scores Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={averageScoresOverTime} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Subscription Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Subscription Status Details
            </Typography>
            <List dense>
              {filteredStudents.map((student) =>
                student.courses.map((course) => (
                  <ListItem key={`${student.id}-${course.id}`} divider>
                    <ListItemText
                      primary={`${student.name} - ${course.name}`}
                      secondary={
                        course.subscriptionStatus === "Active"
                          ? `Next Billing Cycle: ${course.nextBillingCycle}`
                          : "Subscription Expired"
                      }
                    />
                    <Chip
                      label={course.subscriptionStatus}
                      color={course.subscriptionStatus === "Active" ? "success" : "error"}
                      size="small"
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Card>
        </Grid>

        {/* Latest Reports */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Latest Reports
            </Typography>
            <List dense>
              {filteredStudents.map((student) =>
                student.courses.map((course) => (
                  <ListItem key={`report-${student.id}-${course.id}`} divider>
                    <ListItemText
                      primary={`${student.name} - ${course.name}`}
                      secondary={`Subject: ${course.latestReport.subject}, Score: ${course.latestReport.score}%, Date: ${course.latestReport.date}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Card>
        </Grid>

        {/* Recent Activity Feed */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <List dense>
              {filteredActivities.length ? (
                filteredActivities.map(({ id, text, date }) => (
                  <ListItem key={id} divider>
                    <ListItemText primary={text} secondary={date} />
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ m: 2 }}>No recent activities.</Typography>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
