import React from "react";
import { Box, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import BarChartIcon from "@mui/icons-material/BarChart";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PerformanceChart = ({ title, subject, data }) => {
  const chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: subject,
        data: data,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#EF2A1E"); // Red color
          gradient.addColorStop(1, "#4450A5"); // Blue color
          return gradient;
        },
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: "1px solid #E0E0E0",
        backgroundColor: "#fff",
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <BarChartIcon sx={{ mr: 1, color: "#4450A5" }} />
        <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
          {title}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "14px", color: "#777", mb: 2 }}>
        {subject}
      </Typography>
      <Bar data={chartData} options={chartOptions} height={150} />
    </Box>
  );
};

export default PerformanceChart;
