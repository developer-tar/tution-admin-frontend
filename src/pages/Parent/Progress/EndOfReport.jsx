/**
 * StudentReportCard.js - Enhanced with weekly graph and per-week report view
 */

import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tabSubjects = ["Summary", "Mathematics", "English", "Verbal Reasoning", "Non-verbal Reasoning"];

const subjectWiseData = {
  Mathematics: [
    {
      topic: "Quadratic Equations",
      score: 85,
      total: 100,
      attempts: 3,
    },
    {
      topic: "Linear Equations",
      score: 92,
      total: 100,
      attempts: 2,
    },
  ],
  English: [
    {
      topic: "Grammar",
      score: 78,
      total: 100,
      attempts: 2,
    },
    {
      topic: "Comprehension",
      score: 82,
      total: 100,
      attempts: 1,
    },
  ],
  "Verbal Reasoning": [
    {
      topic: "Analogies",
      score: 74,
      total: 100,
      attempts: 2,
    },
  ],
  "Non-verbal Reasoning": [
    {
      topic: "Series Completion",
      score: 69,
      total: 100,
      attempts: 2,
    },
  ],
};

const weeklyPerformanceData = {
  Mathematics: [
    { week: "Week 1", score: 60 },
    { week: "Week 2", score: 72 },
    { week: "Week 3", score: 85 },
    { week: "Week 4", score: 90 },
  ],
  English: [
    { week: "Week 1", score: 70 },
    { week: "Week 2", score: 75 },
    { week: "Week 3", score: 78 },
    { week: "Week 4", score: 82 },
  ],
  "Verbal Reasoning": [
    { week: "Week 1", score: 65 },
    { week: "Week 2", score: 69 },
    { week: "Week 3", score: 74 },
    { week: "Week 4", score: 77 },
  ],
  "Non-verbal Reasoning": [
    { week: "Week 1", score: 55 },
    { week: "Week 2", score: 63 },
    { week: "Week 3", score: 69 },
    { week: "Week 4", score: 73 },
  ],
};

const EndOfReport = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const currentSubject = tabSubjects[activeTab];
  const subjectData = subjectWiseData[currentSubject] || [];
  const weeklyData = weeklyPerformanceData[currentSubject] || [];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Weekly Report Card - Student #{id}
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        {tabSubjects.map((label, idx) => (
          <Tab key={idx} label={label} />
        ))}
      </Tabs>

      {currentSubject !== "Summary" ? (
        <>
          <Typography variant="h6" mb={2}>
            {currentSubject} - Topic Wise Performance
          </Typography>

          <Grid container spacing={3}>
            {subjectData.map((topic, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {topic.topic}
                    </Typography>
                    <Typography variant="body1">
                      Score: <strong>{topic.score}%</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attempts: {topic.attempts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box mt={6}>
            <Typography variant="h6" gutterBottom>
              Weekly Performance Graph - {currentSubject}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3f51b5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      ) : (
        <Box>
          <Typography variant="body1">
            Select a subject tab above to view detailed topic-wise and weekly performance.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EndOfReport;
