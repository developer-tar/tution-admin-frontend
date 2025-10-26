import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home,
  ArrowBack,
  ErrorOutline,
  Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoHome = () => {
    navigate('/'); // Go to home page
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        }
      }}
    >
      {/* Floating Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '70%',
          right: '15%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          animation: 'float 4s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }
          }}
        >
          {/* Error Icon */}
          <Box
            sx={{
              mb: 3,
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <Box
              sx={{
                width: { xs: 120, md: 150 },
                height: { xs: 120, md: 150 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' }
                }
              }}
            >
              <ErrorOutline 
                sx={{ 
                  fontSize: { xs: 60, md: 80 }, 
                  color: 'white',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }} 
              />
            </Box>
          </Box>

          {/* 404 Text */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 900,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
              mb: 2,
              letterSpacing: '-2px'
            }}
          >
            404
          </Typography>

          {/* Oops Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#2c3e50',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            🚫 Oops! Page Not Found
          </Typography>

          {/* Description */}
          <Typography
            variant="h6"
            sx={{
              color: '#6c757d',
              mb: 1,
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 500
            }}
          >
            The page you're looking for doesn't exist.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#8e9aaf',
              mb: 4,
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}
          >
            It might have been moved, deleted, or you entered the wrong URL.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              mt: 4
            }}
          >
            {/* Go Back Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: '100%', sm: '160px' }
              }}
            >
              Go Back
            </Button>

            {/* Go Home Button */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  color: '#5a6fd8',
                  background: 'rgba(102, 126, 234, 0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.3s ease',
                minWidth: { xs: '100%', sm: '160px' }
              }}
            >
              Go Home
            </Button>
          </Box>

          {/* Search Suggestion */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Search sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: '#667eea'
                }}
              >
                Need Help?
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#6c757d',
                fontSize: '14px'
              }}
            >
              Check the URL for typos or use the navigation menu to find what you're looking for.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
