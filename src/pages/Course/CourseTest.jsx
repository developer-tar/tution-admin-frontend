<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem, Select,
  InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../api';
import { button, h2, icon } from '../style';

const defaultQuestion = {
  question: '',
  options: ['', '', '', ''],
  answer: '',
  duration: ''
};

const validationSchema = yup.object().shape({
  academicCourseId: yup.string().required('Academic course is required'),
  subjectId: yup.string().required('Subject is required'),
  courseAssigmentId: yup.string().required('Assignment is required'),
  topicId: yup.string().required('Topic is required'),
  // subtopicId: yup.string().required('Subtopic is required'),
  questions: yup.array().of(
    yup.object().shape({
      question: yup.string().min(5).required('Question is required'),
      options: yup
        .array()
        .of(yup.string().max(255))
        .test('min-2-options', 'At least 2 options required', opts => opts.filter(v => v.trim()).length >= 2),
      answer: yup.string().required('Correct answer required'),
      duration: yup
  .number()
  .typeError("Duration must be a number")
  .min(1, "Minimum duration is 1")
  .max(3, "Maximum duration is 3")
  .required("Duration is required"),

    })
  )
});

const selectStyle = {
  height: 56,
  paddingY: '10px',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const CourseTest = () => {
  const [dropdownData, setDropdownData] = useState({
    academicCourses: [], subjects: [], assignments: [], topics: [], subtopics: []
  });
  const [assignmentMessage, setAssignmentMessage] = useState('');

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

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });
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
          const assignments = res.data.data.assignments || [];
          const subjects = res.data.data.subjects || [];
          setDropdownData(prev => ({ ...prev, subjects, assignments }));
          if (assignments.length === 0 && res.data.message) {
            setAssignmentMessage(res.data.message);
            toast.info(res.data.message);
          } else {
            setAssignmentMessage('');
          }
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
    } catch {
      toast.error('Submission failed');
    }
  };

  const dropdowns = [
    { label: 'Academic Course', name: 'academicCourseId', options: dropdownData.academicCourses },
    { label: 'Subject', name: 'subjectId', options: dropdownData.subjects },
    { label: 'Assignment', name: 'courseAssigmentId', options: dropdownData.assignments },
    { label: 'Topic', name: 'topicId', options: dropdownData.topics },
    { label: 'Subtopic', name: 'subtopicId', options: dropdownData.subtopics }
  ];

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} fontWeight={700}>
                      Course Test
                  </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {dropdowns.map(({ label, name, options }) => (
            <Grid item xs={12} sm={6} key={name}>
              <FormControl fullWidth error={!!errors[name]} variant="outlined">
                <InputLabel shrink>{label}</InputLabel>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={label}
                      displayEmpty
                      sx={selectStyle}
                      renderValue={(selected) => {
                        const item = options.find(opt => opt.id === selected);
                        return item ? item.name : '';
                      }}
                    >
                      {options.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              {errors[name] && <Typography color="error" fontSize={12}>{errors[name]?.message}</Typography>}
            </Grid>
          ))}

          {assignmentMessage && (
            <Grid item xs={12}>
              <Typography color="warning.main">{assignmentMessage}</Typography>
            </Grid>
          )}

          {fields.map((field, qIdx) => (
            <React.Fragment key={field.id}>
              <Grid item xs={12}><Typography variant="h6">Question {qIdx + 1}</Typography></Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Question"
                  {...register(`questions.${qIdx}.question`)}
                  error={!!errors.questions?.[qIdx]?.question}
                  helperText={errors.questions?.[qIdx]?.question?.message}
                />
              </Grid>
              {[0, 1, 2, 3].map(oIdx => (
                <Grid item xs={12} sm={6} key={oIdx}>
                  <TextField fullWidth label={`Option ${oIdx + 1}`} {...register(`questions.${qIdx}.options.${oIdx}`)} />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Correct Answer" {...register(`questions.${qIdx}.answer`)} error={!!errors.questions?.[qIdx]?.answer} helperText={errors.questions?.[qIdx]?.answer?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Duration (in sec)" {...register(`questions.${qIdx}.duration`)} error={!!errors.questions?.[qIdx]?.duration} helperText={errors.questions?.[qIdx]?.duration?.message} />
              </Grid>
              <Grid item xs={12}>
                <Button color="error" onClick={() => remove(qIdx)} disabled={fields.length === 1} startIcon={<DeleteIcon />}>Remove Question</Button>
              </Grid>
            </React.Fragment>
          ))}

          <Grid item xs={12}>
            <Button onClick={() => append(defaultQuestion)} startIcon={<AddIcon />}>Add More Questions</Button>
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" sx={button}>
              Submit Test
              <Box sx={icon}><ArrowForwardIcon sx={{ fontSize: 20, color: "#EF2A1E" }} /></Box>
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CourseTest;

=======
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem, Select,
  InputLabel, FormControl, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
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
  const [dropdownData, setDropdownData] = useState({
    academicCourses: [], subjects: [], assignments: [], topics: [], subtopics: []
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
            assignments: res.data.data.assignments || []
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
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight={700}>Course Test</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {['academicCourseId', 'subjectId', 'courseAssigmentId', 'topicId', 'subtopicId'].map((fieldName) => (
            <Grid item xs={12} sm={6} key={fieldName}>
              <FormControl fullWidth error={!!errors[fieldName]}>
                <InputLabel>{fieldName.replace(/Id$/, '').replace(/([A-Z])/g, ' $1')}</InputLabel>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label={fieldName}>
                      {(dropdownData[fieldName.replace('Id', 's')] || []).map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <Typography color="error" fontSize={12}>{errors?.[fieldName]?.message}</Typography>
              </FormControl>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexWrap="wrap">
              <Button variant="outlined" component="label">
                Upload CSV
                <input type="file" hidden accept=".csv" onChange={handleCSVUpload} />
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  const sample = `question,option1,option2,option3,option4,answer,duration
What is the capital of France?,Paris,Lyon,Marseille,,Paris,30`;
                  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'sample_test_format.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download Sample CSV
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" mt={2} mb={1}>📄 CSV Format Preview</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['question', 'option1', 'option2', 'option3', 'option4', 'answer', 'duration'].map(header => (
                      <TableCell key={header}><strong>{header}</strong></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>What is the capital of France?</TableCell>
                    <TableCell>Paris</TableCell>
                    <TableCell>Lyon</TableCell>
                    <TableCell>Marseille</TableCell>
                    <TableCell>Spiti</TableCell>
                    <TableCell>Paris</TableCell>
                    <TableCell>3</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {fields.map((field, idx) => (
            <React.Fragment key={field.id}>
              <Grid item xs={12}><Typography fontWeight="bold">Question {idx + 1}</Typography></Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Question" {...register(`questions.${idx}.question`)} error={!!errors?.questions?.[idx]?.question} helperText={errors?.questions?.[idx]?.question?.message} />
              </Grid>
              {[0, 1, 2, 3].map(optIdx => (
                <Grid item xs={12} sm={6} key={optIdx}>
                  <TextField fullWidth label={`Option ${optIdx + 1}`} {...register(`questions.${idx}.options.${optIdx}`)} />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Correct Answer" {...register(`questions.${idx}.answer`)} error={!!errors?.questions?.[idx]?.answer} helperText={errors?.questions?.[idx]?.answer?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Duration (in sec)" type="number" {...register(`questions.${idx}.duration`)} error={!!errors?.questions?.[idx]?.duration} helperText={errors?.questions?.[idx]?.duration?.message} />
              </Grid>
              <Grid item xs={12}>
                <Button color="error" onClick={() => remove(idx)} disabled={fields.length === 1} startIcon={<DeleteIcon />}>Remove Question</Button>
              </Grid>
            </React.Fragment>
          ))}

          <Grid item xs={12}><Button onClick={() => append(defaultQuestion)} startIcon={<AddIcon />}>Add More</Button></Grid>

          <Grid item xs={12}>
            <Button type="submit" sx={button}>Submit
              <Box sx={icon}><ArrowForwardIcon sx={{ fontSize: 20, color: "#EF2A1E" }} /></Box>
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CourseTest;
>>>>>>> master
