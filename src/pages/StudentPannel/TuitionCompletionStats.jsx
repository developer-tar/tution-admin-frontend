import React from "react";
import { Grid, Box, Typography, Divider, useTheme } from "@mui/material";

const StatBox = ({ children }) => (
  <Box
    sx={{
      p: 2,
      border: "1px solid #e0e0e0",
      borderRadius: 2,
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    }}
  >
    {children}
  </Box>
);

const TuitionCompletionStats = () => {
  const theme = useTheme();

  return (
    <>
      <Typography fontWeight={600} mt={5} mb={2}>
        Course Completion
      </Typography>
      <Grid container spacing={2}>
        {/* Date + Time Read */}
        <Grid item xs={12} md={4}>
          <StatBox>
            <Box display="flex" alignItems="center" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Completed:
                </Typography>
                <Typography fontWeight={700} fontSize="16px">
                  24 May 2025
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: "#ccc" }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Time To read:
                </Typography>
                <Typography fontWeight={700} fontSize="16px">
                  35 min
                </Typography>
              </Box>
            </Box>
          </StatBox>
        </Grid>

        {/* First Attempt */}
        <Grid item xs={12} md={4}>
          <StatBox>
            <Box>
              <Typography fontWeight={700} fontSize="24px">
                70%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Test Score <br />(First Attempt)
              </Typography>
            </Box>
          </StatBox>
        </Grid>

        {/* Second Attempt */}
        <Grid item xs={12} md={4}>
          <StatBox>
            <Box>
              <Typography fontWeight={700} fontSize="24px" sx={{ color: "green" }}>
                70%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Test Score <br />(Second Attempt)
              </Typography>
            </Box>
          </StatBox>
        </Grid>
      </Grid>
    </>
  );
};

export default TuitionCompletionStats;
