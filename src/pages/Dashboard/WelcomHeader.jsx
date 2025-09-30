<<<<<<< HEAD
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { h2 } from "../style";

const StatCard = ({ title, value, subtitle }) => {
  return (
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
};

const WelcomHeader = () => {
  return (
    <Box sx={{ padding: 3, backgroundColor: "#F5F5F5" }}>
      {/* Header Section */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={h2}>
          Welcome back, Admin
        </Typography>
        <Typography variant="body2" sx={{ color: "#777" }}>
          Track your progress and continue your learning journey.
        </Typography>
      </Box>

      {/* Grid Layout */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Weekly Progress" value="68%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Topics Completed" value="7/14" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Study Time This Week" value="10.5 hrs" subtitle="+2.5 hrs from last week" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Tests" value="2" subtitle="Next: 15 May 2025" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WelcomHeader;
=======
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { h2 } from "../style";

const StatCard = ({ title, value, subtitle }) => {
  return (
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
};

const WelcomHeader = () => {
  return (
    <Box sx={{ padding: 3, backgroundColor: "#F5F5F5" }}>
      {/* Header Section */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" sx={h2}>
          Welcome back, Admin
        </Typography>
        <Typography variant="body2" sx={{ color: "#777" }}>
          Track your progress and continue your learning journey.
        </Typography>
      </Box>

      {/* Grid Layout */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Weekly Progress" value="68%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Topics Completed" value="7/14" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Study Time This Week" value="10.5 hrs" subtitle="+2.5 hrs from last week" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Tests" value="2" subtitle="Next: 15 May 2025" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WelcomHeader;
>>>>>>> master
