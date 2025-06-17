import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';

const sampleQuestions = [
  { question: 'Choose which word has the following definition: a raging fire', options: ['inferno', 'satisfactory', 'mellow', 'calm'] },
  { question: 'Which word means: very happy or joyful', options: ['ecstatic', 'gloomy', 'neutral', 'worried'] },
  { question: 'Which word means: to go up or climb', options: ['descend', 'ascend', 'decline', 'fall'] },
  { question: 'Which word means: without delay; immediate', options: ['late', 'prompt', 'lazy', 'casual'] },
  { question: 'Which word is a synonym for “helpful”?', options: ['useless', 'supportive', 'selfish', 'dull'] }
];

const StudentTest = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [expired, setExpired] = useState({});
  const [remainingTime, setRemainingTime] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [skipped, setSkipped] = useState({});
  const timerRef = useRef(null);
  const latestTimeRef = useRef(60);

  // ⏱️ Timer per question logic
  useEffect(() => {
    const savedTime = remainingTime[current] ?? 60;
    setTimeLeft(savedTime);
    latestTimeRef.current = savedTime;

    if (expired[current]) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        latestTimeRef.current = prev - 1;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setExpired(prev => ({ ...prev, [current]: true }));
          setRemainingTime(prev => ({ ...prev, [current]: 0 }));
          handleAutoNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      setRemainingTime(prev => ({ ...prev, [current]: latestTimeRef.current }));
    };
  }, [current]);

  const handleSelect = (option) => {
    if (expired[current]) return;
    setAnswers(prev => ({ ...prev, [current]: option }));
  };

  const handleAutoNext = () => {
    setCurrent(prev => (prev < sampleQuestions.length - 1 ? prev + 1 : prev));
  };

  const handleSkip = () => {
    clearInterval(timerRef.current);
    setSkipped(prev => ({ ...prev, [current]: true }));
    setExpired(prev => ({ ...prev, [current]: true }));
    setRemainingTime(prev => ({ ...prev, [current]: 0 }));
    handleAutoNext();
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', answers);
    alert('Draft saved!');
  };

  const handleSubmit = () => {
    alert('Submitted answers:\n' + JSON.stringify(answers, null, 2));
  };

  const getStatus = (idx) => {
    if (skipped[idx]) return 'Skipped';
    if (answers[idx]) return 'Answered';
    if (expired[idx]) return 'Missed';
    return 'Pending';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold">TEST WEEK 15 - Y3 - VOCABULARY</Typography>
      <Typography color="error" mb={2}>⏳ TIME LEFT for Q{current + 1}: {timeLeft}s</Typography>

      <Grid container spacing={2}>
        {/* Question Area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} mb={1}>Question {current + 1}</Typography>
            <Typography mb={2}>{sampleQuestions[current].question}</Typography>

            <Grid container spacing={2}>
              {sampleQuestions[current].options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const selected = answers[current] === opt;
                return (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Button
                      variant={selected ? "contained" : "outlined"}
                      fullWidth
                      onClick={() => handleSelect(opt)}
                      disabled={!!expired[current]}
                    >
                      {label}. {opt}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {expired[current] && !answers[current] && (
              <Typography color="error" fontWeight={500} mt={2}>
                ⛔ Time’s up! You can’t answer this question now.
              </Typography>
            )}

            <Box mt={3} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Button
                onClick={() => setCurrent(prev => Math.max(0, prev - 1))}
                disabled={current === 0}
              >
                Back
              </Button>
              <Button onClick={handleSkip}>Skip</Button>
              <Button onClick={handleSaveDraft}>Save as Draft</Button>
              <Button
                onClick={() => setCurrent(prev => Math.min(sampleQuestions.length - 1, prev + 1))}
                disabled={current === sampleQuestions.length - 1}
              >
                Next
              </Button>
              <Button color="error" variant="contained" onClick={handleSubmit}>
                Finish
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Status Tracker */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight="bold" mb={1}>Status</Typography>
            {sampleQuestions.map((_, idx) => {
              const status = getStatus(idx);
              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    color:
                      status === 'Answered' ? 'green' :
                      status === 'Missed' ? 'red' :
                      status === 'Skipped' ? 'orange' : 'gray'
                  }}
                >
                  <Typography>Q{idx + 1}</Typography>
                  <Typography>{status}</Typography>
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentTest;