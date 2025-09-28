import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import CommonLoader from "../../components/CommonLoader";
const VideoLessonHeader = ({ getContent , loading}) => {
  const navigate = useNavigate();
  if (loading) {
      return (
         <CommonLoader variant="text" width={400}/>
      );
    }
  return (
    <Stack direction="row" alignItems="center" spacing={1} mb={3}>
      <IconButton onClick={() => navigate(-1)}>
        <ArrowBackIcon />
      </IconButton>
      <Box>
        <Typography fontWeight={700} fontSize="20px">{getContent}</Typography>
      </Box>
    </Stack>
  );
};

export default VideoLessonHeader;
