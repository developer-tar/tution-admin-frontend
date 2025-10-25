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
    
    </>
  );
};

export default TuitionCompletionStats;
