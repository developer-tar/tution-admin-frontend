import React from 'react';
import { Box } from '@mui/material';

const VideoPlayer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        bgcolor: "#000",
        aspectRatio: "16 / 9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "14px",
        position: "relative"
      }}
    >
      <video
        controls
        width="100%"
        style={{
          borderRadius: "8px",
          objectFit: "cover"
        }}
        poster="/preview.jpg"
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </Box>
  );
};

export default VideoPlayer;
