import React from 'react';
import { Typography, Box } from '@mui/material';

const LessonDescription = () => {
  return (
    <Box>
      <Typography fontWeight={700} fontSize="18px" mb={1}>
        Year 3 11+ Tuition
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        It has survived not only five centuries, but also the leap into electronic typesetting.
      </Typography>
    </Box>
  );
};

export default LessonDescription;
