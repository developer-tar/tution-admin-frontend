import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';

// Sample vocabulary test questions
const sampleQuestions = [
  { question: 'Choose which word has the following definition: a raging fire', options: ['inferno', 'satisfactory', 'mellow', 'calm'] , duration_in_sec: 2},
  { question: 'Which word means: very happy or joyful', options: ['ecstatic', 'gloomy', 'neutral', 'worried'] ,  duration_in_sec: 2},
  { question: 'Which word means: to go up or climb', options: ['descend', 'ascend', 'decline', 'fall'] ,duration_in_sec: 2},
  { question: 'Which word means: without delay; immediate', options: ['late', 'prompt', 'lazy', 'casual'] ,duration_in_sec: 2},
  { question: 'Which word is a synonym for “helpful”?', options: ['useless', 'supportive', 'selfish', 'dull'] ,duration_in_sec: 2}
];

const StudentTest = () => {
  const [current, setCurrent] = useState(0); // current question index
  const [answers, setAnswers] = useState({}); // selected answers
  const [expired, setExpired] = useState({}); // tracks which questions have expired
  const [remainingTime, setRemainingTime] = useState({}); // stores time left for each question
  const [timeLeft, setTimeLeft] = useState(60); // time left for current question
  const [skipped, setSkipped] = useState({}); // tracks skipped questions
  const timerRef = useRef(null); // reference to the current interval
  const latestTimeRef = useRef(60); // stores the latest time before interval is cleared

  // ⏱️ Timer per question logic
  useEffect(() => {
    const savedTime = remainingTime[current] ?? 10; // load saved time or default 10s
    setTimeLeft(savedTime);
    latestTimeRef.current = savedTime;

    // Skip setting timer if already expired
    if (expired[current]) return;

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        latestTimeRef.current = prev - 1;

        // When time runs out
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setExpired(prev => ({ ...prev, [current]: true }));
          setRemainingTime(prev => ({ ...prev, [current]: 0 }));
          handleAutoNext(); // auto move to next question
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    // Cleanup and save remaining time
    return () => {
      clearInterval(timerRef.current);
      setRemainingTime(prev => ({ ...prev, [current]: latestTimeRef.current }));
    };
  }, [current]);

  // Handles option selection
  const handleSelect = (option) => {
    if (expired[current]) return; // don't allow answer if expired
    setAnswers(prev => ({ ...prev, [current]: option }));
  };

  // Auto navigate to next question if time is up
  const handleAutoNext = () => {
    setCurrent(prev => (prev < sampleQuestions.length - 1 ? prev + 1 : prev));
  };

  // Skip current question manually
  const handleSkip = () => {
    clearInterval(timerRef.current);
    setSkipped(prev => ({ ...prev, [current]: true }));
    setExpired(prev => ({ ...prev, [current]: true }));
    setRemainingTime(prev => ({ ...prev, [current]: 0 }));
    handleAutoNext();
  };

  // Save current answers as a draft
  const handleSaveDraft = () => {
    console.log('Draft saved:', answers);
    alert('Draft saved!');
  };

  // Final submit action
  const handleSubmit = () => {
    alert('Submitted answers:\n' + JSON.stringify(answers, null, 2));
  };

  // Determine status for each question
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
        {/* Main Question Area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} mb={1}>Question {current + 1}</Typography>
            <Typography mb={2}>{sampleQuestions[current].question}</Typography>

            {/* Render options */}
            <Grid container spacing={2}>
              {sampleQuestions[current].options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx); // A, B, C, D
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

            {/* Show timeout warning if question expired and unanswered */}
            {expired[current] && !answers[current] && (
              <Typography color="error" fontWeight={500} mt={2}>
                ⛔ Time’s up! You can’t answer this question now.
              </Typography>
            )}

            {/* Navigation and action buttons */}
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

        {/* Right Sidebar: Status Tracker */}
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
