// CommonLoader.jsx
import React from 'react';
import { Skeleton, Box } from '@mui/material';

export default function CommonLoader({ width = '100%', height = 56, radius = 1 }) {
  return (
    <Box sx={{ width: '100%' }}>
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{ borderRadius: radius, mb: 2 }}
        />
    </Box>
  );
}
