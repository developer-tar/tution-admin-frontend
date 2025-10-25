import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Fade,
  IconButton,
  Tooltip,
  Divider,
  Alert
} from '@mui/material';
import {
  Quiz,
  Timer,
  Assignment,
  PlayArrow,
  ArrowBack,
  CheckCircle,
  Cancel,
  NavigateNext,
  NavigateBefore,
  Flag,
  Info,
  School
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api';

const SubTopicTest = () => {
  const { sub_topic_test_id } = useParams();
  const navigate = useNavigate();

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-10px); }
        70% { transform: translateY(-5px); }
        90% { transform: translateY(-2px); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  // States
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('processing'); // 'processing', 'success', 'results'
  const [testCompleted, setTestCompleted] = useState(false);

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await api.get(`/student/subtopic/test/${sub_topic_test_id}`);
        setTestData(response.data.data);
        
        // Calculate total time for all questions
        const totalTime = response.data.data.test.questions.reduce(
          (total, question) => total + parseInt(question.duration_in_sec), 0
        );
        setTimeRemaining(totalTime);
      } catch (error) {
        toast.error('Failed to fetch test data');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (sub_topic_test_id) {
      fetchTestData();
    }
  }, [sub_topic_test_id, navigate]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (testStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeRemaining]);

  const handleStartTest = () => {
    setTestStarted(true);
    // Track start time for first question
    const currentQuestion = testData.test.questions[0];
    setQuestionStartTimes(prev => ({
      ...prev,
      [currentQuestion.id]: Date.now()
    }));
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testData.test.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = testData.test.questions[nextIndex];
      
      // Track start time for next question
      setQuestionStartTimes(prev => ({
        ...prev,
        [nextQuestion.id]: Date.now()
      }));
      
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const prevQuestion = testData.test.questions[prevIndex];
      
      // Track start time for previous question if not already tracked
      setQuestionStartTimes(prev => ({
        ...prev,
        [prevQuestion.id]: prev[prevQuestion.id] || Date.now()
      }));
      
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const handleSubmitTest = async () => {
    // Prevent re-submission if test is already completed
    if (testCompleted) {
      toast.warning('Test already completed. Please go back to content.');
      return;
    }

    setShowConfirmDialog(false);
    setSubmitting(true);
    setShowProcessing(true);
    setProcessingStep('processing');
    
    try {
      // Calculate time taken for each question
      const currentTime = Date.now();
      const answersArray = testData.test.questions.map(question => {
        const startTime = questionStartTimes[question.id] || currentTime;
        const timeTaken = Math.floor((currentTime - startTime) / 1000); // Convert to seconds
        
        return {
          question_id: question.id,
          option_id: answers[question.id] ? parseInt(answers[question.id]) : null,
          time_taken: timeTaken > 0 ? timeTaken : 1 // Minimum 1 second
        };
      }).filter(answer => answer.option_id !== null); // Only include answered questions

      const submitData = {
        answers: answersArray
      };

      const response = await api.post(`/student/subtopic/test/${sub_topic_test_id}/submit`, submitData);
      
      if (response.data.success) {
        // Show success step
        setProcessingStep('success');
        
        // Wait 1200ms then show results
        setTimeout(() => {
          setTestResults(response.data.data);
          setTestCompleted(true);
          setShowProcessing(false);
          setShowResultsDialog(true);
          toast.success(response.data.message || 'Test submitted successfully!');
          
          // Auto-navigate back after 5 seconds
          setTimeout(() => {
            setShowResultsDialog(false);
            navigate(-1);
          }, 5000);
        }, 1200);
      } else {
        throw new Error(response.data.message || 'Failed to submit test');
      }
      
    } catch (error) {
      console.error('Test submission error:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        toast.error(error.response.data.message || 'Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error(error.response.data.message || 'Test not found.');
        navigate(-1);
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Week information not found for this test.');
      } else if (error.response?.status === 403) {
        const message = error.response.data.message || 'You cannot access this test right now.';
        toast.error(message);
        // Show detailed time restriction message
        if (message.includes('available from')) {
          toast.warning('Please check the test schedule and try again during the allowed time period.');
        }
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          // Handle specific validation errors
          const errorMessages = [];
          
          // Check for test completion error
          if (errors.test_id && errors.test_id.includes('You have already completed this test.')) {
            toast.error('You have already completed this test.');
            navigate(-1);
            return;
          }
          
          // Handle answers validation errors
          if (errors.answers) {
            errorMessages.push(...errors.answers);
          }
          
          // Handle individual answer field errors
          Object.keys(errors).forEach(key => {
            if (key.startsWith('answers.')) {
              errorMessages.push(...errors[key]);
            }
          });
          
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join(', '));
          } else {
            toast.error(error.response.data.message || 'Validation error occurred.');
          }
        } else {
          toast.error(error.response.data.message || 'Validation error occurred.');
        }
      } else if (error.response?.status === 500) {
        toast.error(error.response.data.message || 'An error occurred while submitting the test.');
      } else {
        toast.error(error.message || 'Failed to submit test. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
      setShowProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              <Quiz sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>Loading Test...</Typography>
            <LinearProgress sx={{ mt: 2, width: 200 }} />
          </Card>
        </Box>
      </Container>
    );
  }

  if (!testData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">Test not found</Typography>
          <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
        </Card>
      </Container>
    );
  }

  // Test Instructions Screen
  if (!testStarted) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={600}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            mb: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Tooltip title="Go Back" arrow>
                  <IconButton 
                    onClick={() => navigate(-1)}
                    sx={{
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      '&:hover': { background: 'rgba(255,255,255,0.25)' }
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Tooltip>
                
                <Avatar sx={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 60,
                  height: 60
                }}>
                  <Quiz sx={{ fontSize: 30 }} />
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    📝 {testData.test.name}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Test Instructions & Overview
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        <Grid container spacing={4}>
          {/* Test Overview */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={800}>
              <Card sx={{ height: 'fit-content' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Info />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      Test Instructions
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" paragraph>
                      Welcome to the <strong>{testData.test.name}</strong>. Please read the following instructions carefully before starting:
                    </Typography>
                    
                    <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        This test contains <strong>{testData.test.questions.length} questions</strong>
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Total time allocated: <strong>{formatTime(timeRemaining)}</strong>
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Each question has a specific time limit
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        You can navigate between questions using Next/Previous buttons
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Your progress will be saved automatically
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        Once time runs out, the test will be submitted automatically
                      </Typography>
                    </Box>

                    <Paper sx={{ p: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                          <Flag sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="h6" color="warning.dark">
                          Important Notes
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="warning.dark">
                        • Make sure you have a stable internet connection<br/>
                        • Do not refresh the page during the test<br/>
                        • Answer all questions to maximize your score<br/>
                        • Review your answers before final submission
                      </Typography>
                    </Paper>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={handleStartTest}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '25px',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Start Test
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Test Statistics */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={1000}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Assignment />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Test Overview
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Questions
                      </Typography>
                      <Chip 
                        label={testData.test.questions.length} 
                        sx={{ bgcolor: 'primary.main', color: 'white' }}
                        size="small" 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Duration
                      </Typography>
                      <Chip 
                        label={formatTime(timeRemaining)} 
                        sx={{ bgcolor: 'secondary.main', color: 'white' }}
                        size="small" 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Question Types
                      </Typography>
                      <Chip 
                        label="Multiple Choice" 
                        sx={{ bgcolor: 'info.main', color: 'white' }}
                        size="small" 
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Good luck with your test! 🍀
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Test Interface
  const currentQuestion = testData.test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.test.questions.length) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Test Header */}
      <Card sx={{
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: 'white',
        borderRadius: '15px',
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Quiz />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {testData.test.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Question {currentQuestionIndex + 1} of {testData.test.questions.length}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer />
                <Typography variant="h6" fontWeight={600}>
                  {formatTime(timeRemaining)}
                </Typography>
              </Box>
              
              <Chip 
                label={`${getAnsweredCount()}/${testData.test.questions.length} Answered`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white'
              }
            }} 
          />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {currentQuestion.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Chip 
                icon={<Timer />}
                label={`${currentQuestion.duration_in_sec}s per question`}
                sx={{ 
                  borderColor: 'info.main', 
                  color: 'info.main',
                  '& .MuiChip-icon': {
                    color: 'info.main'
                  }
                }}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options.map((option) => (
                <Paper 
                  key={option.id}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: answers[currentQuestion.id] === option.id.toString() 
                      ? '2px solid #667eea' 
                      : '1px solid #e0e0e0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  onClick={() => handleAnswerChange(currentQuestion.id, option.id.toString())}
                >
                  <FormControlLabel
                    value={option.id.toString()}
                    control={<Radio />}
                    label={
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {option.name}
                      </Typography>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<NavigateBefore />}
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outlined"
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentQuestionIndex === testData.test.questions.length - 1 ? (
                <Button
                  variant="contained"
                  sx={{ 
                    px: 4,
                    bgcolor: testCompleted ? 'grey.500' : 'success.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: testCompleted ? 'grey.600' : 'success.dark'
                    }
                  }}
                  startIcon={submitting ? null : testCompleted ? <ArrowBack /> : <CheckCircle />}
                  onClick={() => testCompleted ? navigate(-1) : setShowConfirmDialog(true)}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : testCompleted ? 'Back to Content' : 'Submit Test'}
                </Button>
              ) : (
                <Button
                  endIcon={<NavigateNext />}
                  onClick={handleNextQuestion}
                  variant="contained"
                  sx={{ px: 4 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main' }}>
              <Flag />
            </Avatar>
            Submit Test?
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to submit your test?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have answered {getAnsweredCount()} out of {testData.test.questions.length} questions.
            Once submitted, you cannot make any changes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitTest} 
            variant="contained" 
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'success.dark'
              }
            }}
            startIcon={<CheckCircle />}
          >
            Submit Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Processing Dialog */}
      <Dialog 
        open={showProcessing} 
        onClose={() => {}} // Prevent closing during processing
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          {processingStep === 'processing' && (
            <Fade in timeout={600}>
              <Box>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  animation: 'pulse 2s infinite'
                }}>
                  <Quiz sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Processing Your Test...
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Please wait while we evaluate your answers
                </Typography>
                <LinearProgress 
                  sx={{ 
                    width: '100%', 
                    height: 8, 
                    borderRadius: 4,
                    background: 'rgba(102, 126, 234, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }
                  }} 
                />
              </Box>
            </Fade>
          )}
          
          {processingStep === 'success' && (
            <Fade in timeout={600}>
              <Box>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  bgcolor: 'success.main',
                  animation: 'bounce 0.6s ease-in-out'
                }}>
                  <CheckCircle sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={600} gutterBottom color="success.main">
                  Test Submitted Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Preparing your results...
                </Typography>
              </Box>
            </Fade>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Results Dialog */}
      <Dialog 
        open={showResultsDialog} 
        onClose={() => {
          setShowResultsDialog(false);
          navigate(-1);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: testResults?.score === 100 ? 'success.main' : testResults?.score >= 70 ? 'info.main' : 'warning.main' 
            }}>
              {testResults?.score === 100 ? <CheckCircle /> : <Quiz />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Test Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {testData?.test?.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {testResults && (
            <Grid container spacing={3}>
              {/* Score Card */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  background: testResults.score === 100 
                    ? 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
                    : testResults.score >= 70 
                    ? 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)'
                    : 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={700}>
                      {testResults.score}%
                    </Typography>
                    <Typography variant="body1">
                      Your Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Correct Answers Card */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {testResults.correct_answers}/{testResults.total_questions}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Correct Answers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Stats */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {testResults.attempt_count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Attempt
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {Math.floor(testResults.total_time_taken / 60)}m {testResults.total_time_taken % 60}s
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Time Taken
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {testResults.total_questions - testResults.correct_answers}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Incorrect
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip
                          label={testResults.is_completed ? 'Completed' : 'In Progress'}
                          sx={{
                            bgcolor: testResults.is_completed ? 'success.main' : 'warning.main',
                            color: 'white'
                          }}
                          variant="filled"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Status
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Performance Message */}
              <Grid item xs={12}>
                <Alert 
                  severity={
                    testResults.score === 100 ? 'success' : 
                    testResults.score >= 70 ? 'info' : 'warning'
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {testResults.score === 100 
                      ? '🎉 Perfect Score! Excellent work!' 
                      : testResults.score >= 70 
                      ? '👍 Good job! You passed the test.' 
                      : '📚 Keep practicing to improve your score.'}
                  </Typography>
                  <Typography variant="body2">
                    {testResults.score === 100 
                      ? 'You answered all questions correctly. Outstanding performance!' 
                      : testResults.score >= 70 
                      ? 'You have a good understanding of the topic. Well done!' 
                      : 'Review the topics and try again to improve your understanding.'}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowResultsDialog(false);
              navigate(-1);
            }}
            variant="contained"
            sx={{ px: 4 }}
          >
            Back to Content
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubTopicTest;
