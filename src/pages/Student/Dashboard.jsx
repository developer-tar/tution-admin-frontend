import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import PieChartIcon from "@mui/icons-material/PieChartOutline";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, subtitle }) => (
  <Box
    sx={{
      padding: 2,
      borderRadius: 2,
      border: "1px solid #E0E0E0",
      backgroundColor: "#fff",
      minHeight: "100px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 1,
    }}
  >
    <Typography variant="body2" sx={{ color: "#777", fontSize: "14px" }}>
      {title}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#000" }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ color: "#888", fontSize: "12px" }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

const PerformanceChart = ({ title, subject, data }) => {
  const [viewType, setViewType] = useState("bar");
  const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

  const getGradient = (context) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "#EF2A1E");
    gradient.addColorStop(1, "#4450A5");
    return gradient;
  };

  const pieColors = ["#EF2A1E", "#4450A5", "#F39C12", "#2ECC71", "#9B59B6"];

  const chartData = {
    labels,
    datasets: [
      {
        label: subject,
        data,
        backgroundColor: viewType === "pie" ? pieColors : getGradient,
        borderColor: "#4450A5",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: viewType === "pie" } },
    scales:
      viewType === "pie"
        ? {}
        : {
            y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
            x: { grid: { display: false } },
          },
  };

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: "1px solid #E0E0E0",
        backgroundColor: "#fff",
        minHeight: "300px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <BarChartIcon sx={{ mr: 1, color: "#4450A5" }} />
        <Typography sx={{ fontWeight: 600, fontSize: "16px", flexGrow: 1 }}>
          {title}
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(e, val) => val && setViewType(val)}
          size="small"
        >
          <ToggleButton value="bar"><BarChartIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="line"><ShowChartIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="progress"><LinearScaleIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="pie"><PieChartIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Typography sx={{ fontSize: "14px", color: "#777", mb: 2 }}>
        {subject}
      </Typography>

      {viewType === "bar" && <Box sx={{ height: 200 }}><Bar data={chartData} options={chartOptions} /></Box>}
      {viewType === "line" && <Box sx={{ height: 200 }}><Line data={chartData} options={chartOptions} /></Box>}
      {viewType === "pie" && <Box sx={{ height: 250 }}><Pie data={chartData} options={chartOptions} /></Box>}
      {viewType === "progress" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.map((value, index) => (
            <Box key={index}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {labels[index]} - {value}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#eee",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#4450A5",
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const subjectMap = {
    Mathematics: [85, 70, 90, 75, 80],
    English: [78, 65, 85, 70, 75],
    Science: [60, 70, 65, 80, 85],
  };

  const announcements = [
    "Mathematics Test on Monday",
    "English Assignment due Friday",
    "Science Fair next week",
    "Holiday on Wednesday",
  ];

  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const currentData = useMemo(() => subjectMap[selectedSubject], [selectedSubject]);

  return (
    <Box sx={{ padding: 3, backgroundColor: "#F5F5F5" }}>
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Welcome back, Tarun
        </Typography>
        <Typography variant="body2" sx={{ color: "#777" }}>
          Track your progress and continue your learning journey.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Weekly Progress" value="68%" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Topics Completed" value="7/14" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Study Time This Week" value="10.5 hrs" subtitle="+2.5 hrs from last week" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Upcoming Tests" value="2" subtitle="Next: 15 May 2025" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Select Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {Object.keys(subjectMap).map((subject) => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <PerformanceChart
            title="Weekly Course Performance"
            subject={selectedSubject}
            data={currentData}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 2, backgroundColor: "#fff", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Announcements
            </Typography>
            <List>
              {announcements.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={item} />
                  </ListItem>
                  {index < announcements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
