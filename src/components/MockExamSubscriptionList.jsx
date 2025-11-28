import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

const MockExamSubscriptionList = () => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 8, 
        textAlign: 'center', 
        borderRadius: 4,
        border: '2px dashed rgba(102, 126, 234, 0.1)',
        bgcolor: 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Box 
        sx={{ 
          width: 80, 
          height: 80, 
          background: 'linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%)',
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 1,
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.1)'
        }}
      >
        <QuizIcon sx={{ fontSize: 40, color: '#667eea' }} />
      </Box>
      <Typography variant="h5" fontWeight={700} color="#2d3748">
        Mock Exam Subscriptions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', lineHeight: 1.6 }}>
        Mock exam billing details and purchase history will appear here. 
        <br />
        Currently, no mock exam subscriptions are available.
      </Typography>
    </Paper>
  );
};

export default MockExamSubscriptionList;

