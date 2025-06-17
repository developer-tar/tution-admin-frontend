import React from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const MyCourseHeader = () => {
  const navigate = useNavigate();

  return (
    <Stack direction="row" alignItems="center" spacing={1} mb={3}>
      <IconButton onClick={() => navigate(-1)}>
        <ArrowBackIcon />
      </IconButton>
      <Box>
        <Typography fontWeight={700} fontSize="20px">My Course Video</Typography>
      </Box>
    </Stack>
  );
};

export default MyCourseHeader;
