import React from "react";
import { Box, Grid } from "@mui/material";
import PerformanceChart from "./PerformanceChart";

const WeeklyPerformance = () => {
  const mathematicsData = [85, 70, 90, 75, 80];
  const englishData = [78, 65, 85, 70, 75];

  return (
    <Box sx={{ padding: 3, backgroundColor: "#FAFAFA" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PerformanceChart
            title="Weekly Course Performance"
            subject="Mathematics"
            data={mathematicsData}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PerformanceChart
            title="Weekly Course Performance"
            subject="English"
            data={englishData}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeeklyPerformance;
