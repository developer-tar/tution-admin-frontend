<<<<<<< HEAD
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const TuitionDetailsHeader = () => {
  const navigate = useNavigate();
  return (
    <Stack direction="row" alignItems="center" spacing={1} mb={3}>
      <ArrowBackIcon sx={{ cursor: "pointer" }} onClick={() => navigate(-1)} />
      <Box>
        <Typography fontWeight={700} fontSize="20px">
          Year 3 11+ Tuition
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your progress and continue your learning journey.
        </Typography>
      </Box>
    </Stack>
  );
};

export default TuitionDetailsHeader;
=======
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const TuitionDetailsHeader = () => {
  const navigate = useNavigate();
  return (
    <Stack direction="row" alignItems="center" spacing={1} mb={3}>
      <ArrowBackIcon sx={{ cursor: "pointer" }} onClick={() => navigate(-1)} />
      <Box>
        <Typography fontWeight={700} fontSize="20px">
          Year 3 11+ Tuition
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your progress and continue your learning journey.
        </Typography>
      </Box>
    </Stack>
  );
};

export default TuitionDetailsHeader;
>>>>>>> master
