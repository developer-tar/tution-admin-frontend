import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';

const lessons = [
  "Number Bonds and Place Value",
  "Addition and Subtraction",
  "Number Bonds and Place Value",
  "Number Bonds and Place Value",
  "Number Bonds and Place Value",
  "Number Bonds and Place Value",
];

const CourseTestList = () => {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid #eee" }}>
      <Typography fontWeight={600} fontSize="16px" mb={2}>
        Course Tests
      </Typography>
      <Stack spacing={2}>
        {lessons.map((title, idx) => (
          <Box
            key={idx}
            sx={{
              borderRadius: 1,
              px: 2,
              py: 1,
              bgcolor: idx === 0 ? "#f5f9ff" : "transparent",
              borderLeft: idx === 0 ? "3px solid #26177C" : "none",
            }}
          >
            <Typography fontSize="14px" fontWeight={idx === 0 ? 600 : 500}>
              {idx + 1}. {title}
            </Typography>
            <Typography fontSize="12px" color="text.secondary">
              25 mins
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default CourseTestList;
