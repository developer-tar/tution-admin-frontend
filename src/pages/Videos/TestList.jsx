import { Box, Typography, Stack, Paper, Card, CardContent, Avatar, Chip, Fade, IconButton, Tooltip } from '@mui/material';
import { Assignment, Quiz, PlayArrow, Visibility, TrendingUp, School } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import CommonLoader from "../../components/CommonLoader";
const TestList = ({ relatedData = {}, slugUrl, loading }) => {
  if (loading) {
    return (
       <CommonLoader sx={{ p: 3, textAlign: "center", borderRadius: 2 }} />
    );
  }
  const testEntries = Object.entries(relatedData);

  return (
    <Fade in timeout={600}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Compact Tests Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                width: 32,
                height: 32,
                boxShadow: '0 2px 10px rgba(250,112,154,0.2)',
              }}
            >
              <Assignment sx={{ fontSize: 16 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '16px',
                  lineHeight: 1.2,
                }}
              >
                📝 Tests
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(0,0,0,0.6)',
                fontWeight: 500,
                fontSize: '12px',
              }}
            >
              {testEntries.length} Available
            </Typography>
          </Box>

          {testEntries.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 2,
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                borderRadius: 2,
                border: '1px dashed rgba(102,126,234,0.3)',
              }}
            >
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  width: 40,
                  height: 40,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <Quiz sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'rgba(0,0,0,0.7)',
                  mb: 0.5,
                }}
              >
                🚀 No Tests Available
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(0,0,0,0.5)',
                  fontWeight: 500,
                  fontSize: '11px',
                }}
              >
                Tests will appear here when available
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {testEntries.map(([testId, testName], idx) => (
                <Fade in timeout={600 + idx * 100} key={testId}>
                  <Card
                    sx={{
                      background: idx === 0 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(5px)',
                      borderRadius: 2,
                      border: idx === 0 
                        ? '1px solid rgba(255,255,255,0.3)'
                        : '1px solid rgba(102,126,234,0.2)',
                      boxShadow: idx === 0 
                        ? '0 4px 15px rgba(102,126,234,0.2)'
                        : '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: idx === 0 
                          ? '0 6px 20px rgba(102,126,234,0.3)'
                          : '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            background: idx === 0 
                              ? 'rgba(255,255,255,0.2)'
                              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            width: 28,
                            height: 28,
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        >
                          {idx + 1}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Link
                            to={`/student/test`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: idx === 0 ? 'white' : '#333',
                                fontSize: '14px',
                                lineHeight: 1.3,
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {testName}
                            </Typography>
                          </Link>
                        </Box>

                        <Tooltip title="Take Test" arrow>
                          <IconButton
                            component={Link}
                            to={`/student/test`}
                            size="small"
                            sx={{
                              background: idx === 0 
                                ? 'rgba(255,255,255,0.2)'
                                : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                              color: 'white',
                              width: 28,
                              height: 28,
                              '&:hover': {
                                background: idx === 0 
                                  ? 'rgba(255,255,255,0.3)'
                                  : 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default TestList;
