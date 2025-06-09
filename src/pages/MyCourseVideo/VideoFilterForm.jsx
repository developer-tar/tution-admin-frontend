import React from "react";
import {
  Grid,
  Box,
  TextField,
  Button,
  InputAdornment
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const VideoFilterForm = () => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        mb: 4,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Subject" variant="outlined" size="small" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Subtopic" variant="outlined" size="small" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Topic" variant="outlined" size="small" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Video Name" variant="outlined" size="small" />
        </Grid>
        <Grid item xs={12} mt={2}>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(90deg, #26177C 0%, #EF2A1E 100%)",
              borderRadius: 20,
              px: 4,
              py: 1,
              float: "right",
            }}
            endIcon={<ArrowForwardIcon />}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoFilterForm;
