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

