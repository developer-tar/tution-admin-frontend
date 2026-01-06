import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

// Common Loading Progress component for consistent loading states
const LoadingProgress = ({ 
    message = "Loading...", 
    subMessage = "Please wait", 
    height = 3,
    showText = true,
    color = "blue", // blue, gradient
    sx = {} 
}) => {
    
    // Color configurations
    const getProgressColor = () => {
        switch(color) {
            case 'gradient':
                return {
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                        backgroundImage: 'linear-gradient(90deg, #4450A5 0%, #EF2A1E 100%)'
                    }
                };
            case 'blue':
            default:
                return {
                    backgroundColor: '#e3f2fd',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#1976d2'
                    }
                };
        }
    };

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <LinearProgress 
                sx={{ 
                    height: height,
                    mb: showText ? 2 : 0,
                    ...getProgressColor()
                }} 
            />
            {showText && (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#1A2334' }}>
                        {message}
                    </Typography>
                    {subMessage && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            {subMessage}
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default LoadingProgress;

