import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem, Select,
  InputLabel, FormControl, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Avatar, Chip,
  Accordion, AccordionSummary, AccordionDetails, Divider, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuizIcon from '@mui/icons-material/Quiz';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import TopicIcon from '@mui/icons-material/Topic';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { button, icon } from '../style';

const defaultQuestion = {
  question: '',
  options: ['', '', '', ''],
  answer: '',
  duration: ''
};

const answerInOptionsTest = (answerPath, optionsPath) =>
  yup.string().test('answer-in-options', 'Answer must match one of the options', function (value) {
    const options = this.resolve(yup.ref(optionsPath)) || [];
    return options.includes(value);
  });

const validationSchema = yup.object().shape({
  academicCourseId: yup.string().required('Academic course is required'),
  subjectId: yup.string().required('Subject is required'),
  courseAssigmentId: yup.string().required('Assignment is required'),
  topicId: yup.string().required('Topic is required'),
  subtopicId: yup.string().nullable(),
  questions: yup.array().min(1, 'At least one question is required').of(
    yup.object().shape({
      question: yup.string().required('Question is required').min(10).max(255),
      options: yup.array().of(yup.string().required().min(1).max(255)).min(2, 'Minimum 2 options required'),
      answer: answerInOptionsTest('answer', 'options').required('Answer is required'),
      duration: yup.number().typeError('Duration must be a number').required('Duration is required').min(1),
    })
  )
});

const CourseTest = () => {
  const navigate = useNavigate();
  const [dropdownData, setDropdownData] = useState({
    academicCourses: [], subjects: [], courseAssigments: [], topics: [], subtopics: []
  });

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      academicCourseId: '', subjectId: '', courseAssigmentId: '', topicId: '', subtopicId: '',
      questions: [defaultQuestion]
    },
    resolver: yupResolver(validationSchema)
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'questions' });
  const watchAll = watch();

  useEffect(() => {
    api.get('admin/ca_records')
      .then(res => setDropdownData(prev => ({ ...prev, academicCourses: res.data.data || [] })))
      .catch(() => toast.error('Failed to fetch academic courses'));
  }, []);

  useEffect(() => {
    if (watchAll.academicCourseId) {
      api.get(`admin/ca_based_weeks_subjects/${watchAll.academicCourseId}`)
        .then(res => {
          setDropdownData(prev => ({
            ...prev,
            subjects: res.data.data.subjects || [],
            courseAssigments: res.data.data.assignments || []
          }));
        })
        .catch(() => toast.error('Failed to fetch subjects/assignments'));
    }
  }, [watchAll.academicCourseId]);

  useEffect(() => {
    if (watchAll.subjectId && watchAll.courseAssigmentId) {
      api.get(`admin/fetch/course/topic/${watchAll.subjectId}/${watchAll.courseAssigmentId}`)
        .then(res => setDropdownData(prev => ({ ...prev, topics: res.data.data || [] })))
        .catch(() => toast.error('Failed to fetch topics'));
    }
  }, [watchAll.subjectId, watchAll.courseAssigmentId]);

  useEffect(() => {
    if (watchAll.topicId) {
      api.get(`admin/fetch/course/subtopic/${watchAll.topicId}`)
        .then(res => setDropdownData(prev => ({ ...prev, subtopics: res.data.data || [] })))
        .catch(() => toast.error('Failed to fetch subtopics'));
    }
  }, [watchAll.topicId]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Only .csv files are allowed.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = [];
        const parsed = results.data.map((row, index) => {
          const options = [row.option1, row.option2, row.option3, row.option4].filter(Boolean);
          const answer = row.answer;
          const duration = row.duration;

          if (options.length < 2) errors.push(`Row ${index + 2}: Minimum 2 options required.`);
          if (!answer || !options.includes(answer)) errors.push(`Row ${index + 2}: Answer must match one of the options.`);
          if (!duration || isNaN(duration)) errors.push(`Row ${index + 2}: Duration must be a valid number.`);

          return {
            question: row.question || '',
            options,
            answer,
            duration: parseInt(duration || 1)
          };
        });

        if (errors.length > 0) {
          toast.error(`CSV Validation Failed:\n${errors.join('\n')}`);
          return;
        }

        replace(parsed);
        toast.success(`${parsed.length} questions loaded from CSV`);
      },
      error: () => toast.error('Failed to parse CSV')
    });
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('topic_id', data.topicId);
    formData.append('subtopic_id', data.subtopicId);

    data.questions.forEach((q, i) => {
      formData.append(`questions[${i}]`, q.question);
      q.options.forEach((opt, j) => formData.append(`options[${i}][${j}]`, opt));
      formData.append(`answers[${i}]`, q.answer);
      formData.append(`duration_in_sec[${i}]`, q.duration);
    });

    try {
      await api.post('admin/assign/test', formData);
      toast.success('Test created successfully!');
      reset({ academicCourseId: '', subjectId: '', courseAssigmentId: '', topicId: '', subtopicId: '', questions: [defaultQuestion] });
      
      // Navigate to test list page after successful creation
      setTimeout(() => {
        navigate('/admin/test-list');
      }, 1500); // Small delay to show success message
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 56,
            height: 56
          }}>
            <QuizIcon sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Course Test Creator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create engaging tests with multiple choice questions
            </Typography>
          </Box>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Course Selection Card */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                width: 48,
                height: 48
              }}>
                <SchoolIcon sx={{ color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Course & Topic Selection
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {[
                { field: 'academicCourseId', label: 'Academic Course', icon: '🎓' },
                { field: 'subjectId', label: 'Subject', icon: '📚' },
                { field: 'courseAssigmentId', label: 'Assignment', icon: '📝' },
                { field: 'topicId', label: 'Topic', icon: '📖' },
                { field: 'subtopicId', label: 'Subtopic', icon: '📄' }
              ].map(({ field, label, icon }) => (
                <Grid item xs={12} sm={6} key={field}>
                  <FormControl fullWidth error={!!errors[field]}>
                    <InputLabel sx={{ 
                      background: 'white',
                      px: 1,
                      '&.Mui-focused': { color: '#667eea' }
                    }}>
                      {icon} {label}
                    </InputLabel>
                    <Controller
                      name={field}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Select 
                          {...controllerField} 
                          label={`${icon} ${label}`}
                          sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(102, 126, 234, 0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#667eea'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#667eea'
                            }
                          }}
                        >
                          {(dropdownData[field.replace('Id', 's')] || []).map(opt => (
                            <MenuItem key={opt.id} value={opt.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography>{opt.name}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors?.[field]?.message && (
                      <Typography color="error" fontSize={12} sx={{ mt: 0.5, ml: 1 }}>
                        {errors[field].message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* CSV Upload Card */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                width: 48,
                height: 48
              }}>
                <UploadFileIcon sx={{ color: 'white' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Bulk Question Upload
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Upload CSV File
                <input type="file" hidden accept=".csv" onChange={handleCSVUpload} />
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const sample = `question,option1,option2,option3,option4,answer,duration
What is the capital of France?,Paris,Lyon,Marseille,India,Paris,30
What is 2 + 2?,3,4,5,6,4,20
Which planet is closest to the Sun?,Mercury,Venus,Earth,Mars,Mercury,25
What is the largest ocean on Earth?,Atlantic,Pacific,Indian,Arctic,Pacific,30
Who wrote Romeo and Juliet?,Charles Dickens,William Shakespeare,Mark Twain,Jane Austen,William Shakespeare,35
What is the chemical symbol for water?,H2O,CO2,NaCl,O2,H2O,15
How many continents are there?,5,6,7,8,7,20
What is the square root of 64?,6,7,8,9,8,25
Which gas do plants absorb from the atmosphere?,Oxygen,Nitrogen,Carbon Dioxide,Hydrogen,Carbon Dioxide,30
What is the capital of Japan?,Beijing,Seoul,Tokyo,Bangkok,Tokyo,20`;
                  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'sample_test_format.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#f57c00',
                    background: 'rgba(255, 152, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Download Sample
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* CSV Format Preview */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                width: 48,
                height: 48
              }}>
                <Typography sx={{ fontSize: '20px' }}>📄</Typography>
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                CSV Format Preview
              </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    {['question', 'option1', 'option2', 'option3', 'option4', 'answer', 'duration'].map(header => (
                      <TableCell key={header} sx={{ fontWeight: 600, color: '#495057' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }}>
                    <TableCell>What is the capital of France?</TableCell>
                    <TableCell>Paris</TableCell>
                    <TableCell>Lyon</TableCell>
                    <TableCell>Marseille</TableCell>
                    <TableCell>India</TableCell>
                    <TableCell>
                      <Chip label="Paris" size="small" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label="30 sec" size="small" sx={{ background: '#e3f2fd', color: '#1976d2' }} />
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }}>
                    <TableCell>What is 2 + 2?</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>4</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>6</TableCell>
                    <TableCell>
                      <Chip label="4" size="small" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label="20 sec" size="small" sx={{ background: '#e3f2fd', color: '#1976d2' }} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
                width: 48,
                height: 48
              }}>
                <QuizIcon sx={{ color: 'white' }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Test Questions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fields.length} question{fields.length !== 1 ? 's' : ''} added
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => append(defaultQuestion)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Add Question
              </Button>
            </Box>

            {fields.map((field, idx) => (
              <Accordion 
                key={field.id}
                sx={{ 
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  '&:before': { display: 'none' },
                  background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    borderRadius: 3,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 2
                    }
                  }}
                >
                  <Avatar sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 32,
                    height: 32,
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {idx + 1}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Question {idx + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {watchAll.questions?.[idx]?.question || 'Enter your question...'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(idx);
                    }}
                    disabled={fields.length === 1}
                    sx={{ 
                      color: '#f44336',
                      '&:hover': { background: 'rgba(244, 67, 54, 0.1)' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </AccordionSummary>
                
                <AccordionDetails sx={{ pt: 0 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="📝 Question Text"
                        multiline
                        rows={3}
                        {...register(`questions.${idx}.question`)} 
                        error={!!errors?.questions?.[idx]?.question} 
                        helperText={errors?.questions?.[idx]?.question?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': { borderColor: 'rgba(102, 126, 234, 0.3)' },
                            '&:hover fieldset': { borderColor: '#667eea' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' }
                          }
                        }}
                      />
                    </Grid>
                    
                    {[0, 1, 2, 3].map(optIdx => (
                      <Grid item xs={12} sm={6} key={optIdx}>
                        <TextField 
                          fullWidth 
                          label={`${String.fromCharCode(65 + optIdx)}. Option ${optIdx + 1}`}
                          {...register(`questions.${idx}.options.${optIdx}`)} 
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '& fieldset': { borderColor: 'rgba(102, 126, 234, 0.3)' },
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      </Grid>
                    ))}
                    
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="✅ Correct Answer"
                        {...register(`questions.${idx}.answer`)} 
                        error={!!errors?.questions?.[idx]?.answer} 
                        helperText={errors?.questions?.[idx]?.answer?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': { borderColor: 'rgba(76, 175, 80, 0.3)' },
                            '&:hover fieldset': { borderColor: '#4caf50' },
                            '&.Mui-focused fieldset': { borderColor: '#4caf50' }
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="⏱️ Duration (seconds)"
                        type="number" 
                        {...register(`questions.${idx}.duration`)} 
                        error={!!errors?.questions?.[idx]?.duration} 
                        helperText={errors?.questions?.[idx]?.duration?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': { borderColor: 'rgba(255, 152, 0, 0.3)' },
                            '&:hover fieldset': { borderColor: '#ff9800' },
                            '&.Mui-focused fieldset': { borderColor: '#ff9800' }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>

        {/* Submit Section */}
        <Box sx={{ display: 'flex', mt: 4 }}>
          <Button 
            type="submit" 
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              px: 6,
              py: 2,
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-3px)',
                boxShadow: '0 16px 45px rgba(102, 126, 234, 0.5)'
              },
              '&:active': {
                transform: 'translateY(-1px)'
              }
            }}
          >
            Create Test
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CourseTest;
