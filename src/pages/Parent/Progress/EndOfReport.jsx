import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slide,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { useState, forwardRef, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Slide transition for dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const tabSubjects = [
  "Summary",
  "Mathematics",
  "English",
  "Verbal Reasoning",
  "Non-verbal Reasoning",
];

const students = ["Tarun", "Priya", "Rahul", "Sneha"];

const subjectWiseData = {
  Mathematics: [
    { topic: "Quadratic Equations", score: 85, total: 100, attempts: 3 },
    { topic: "Linear Equations", score: 92, total: 100, attempts: 2 },
  ],
  English: [
    { topic: "Grammar", score: 78, total: 100, attempts: 2 },
    { topic: "Comprehension", score: 82, total: 100, attempts: 1 },
  ],
  "Verbal Reasoning": [
    { topic: "Analogies", score: 74, total: 100, attempts: 2 },
  ],
  "Non-verbal Reasoning": [
    { topic: "Series Completion", score: 69, total: 100, attempts: 2 },
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const EndOfReport = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(tabSubjects.indexOf("Mathematics"));
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentModalOpen, setStudentModalOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Simulate data loading on student selection or tab change
  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 1200); // 1.2s loading
      return () => clearTimeout(timer);
    }
  }, [selectedStudent, activeTab]);

  const currentSubject = tabSubjects[activeTab];
  const subjectData = subjectWiseData[currentSubject] || [];
  const weeklyData = weeklyPerformanceData[currentSubject] || [];

  const handleStudentSelect = () => {
    if (selectedStudent) {
      setStudentModalOpen(false);
    }
  };

  return (
    <Box p={4} sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Student Selector Modal */}
      <Dialog
        open={studentModalOpen}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          if (selectedStudent) setStudentModalOpen(false);
        }}
      >
        <DialogTitle>Select Student</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              label="Select Student"
            >
              {students.map((name, i) => (
                <MenuItem key={i} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box mt={3} textAlign="right">
            <Button
              variant="contained"
              onClick={handleStudentSelect}
              disabled={!selectedStudent}
            >
              Confirm
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Header with title and change student button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        {loading ? (
          <Skeleton variant="text" width={350} height={40} />
        ) : (
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Weekly Report Card - Student #{selectedStudent || "N/A"}
          </Typography>
        )}

        {loading ? (
          <Skeleton variant="rectangular" width={120} height={36} />
        ) : (
          <Button
            variant="outlined"
            onClick={() => setStudentModalOpen(true)}
            sx={{ textTransform: "none" }}
          >
            Change Student
          </Button>
        )}
      </Box>

      {/* Linear Progress Bar */}
      {loading && (
        <Box mb={3}>
          <LinearProgress />
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 4,
          borderBottom: "1px solid #ddd",
          ".MuiTab-root": {
            fontWeight: 500,
            textTransform: "capitalize",
            fontSize: "1rem",
          },
        }}
        disabled={loading}
      >
        {tabSubjects.map((label, idx) => (
          <Tab key={idx} label={label} />
        ))}
      </Tabs>

      {/* Content */}
      {loading ? (
        <Box>
          <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      ) : currentSubject !== "Summary" ? (
        <>
          <Typography variant="h5" mb={3} fontWeight={600}>
            {currentSubject} - Topic Wise Performance
          </Typography>

          <Grid container spacing={3}>
            {subjectData.map((topic, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-5px)" },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {topic.topic}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Score:{" "}
                      <strong style={{ color: theme.palette.success.main }}>
                        {topic.score}%
                      </strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attempts: {topic.attempts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={6}>
              <Box
                p={2}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <Typography variant="h6" mb={2} fontWeight={600}>
                  Weekly Performance Graph
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3f51b5"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                p={2}
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <Typography variant="h6" mb={2} fontWeight={600}>
                  Topic-wise Score Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="score"
                      nameKey="topic"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {subjectData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box mt={4}>
          <Typography variant="body1" color="text.secondary">
            Select a subject tab above to view detailed topic-wise and weekly
            performance.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EndOfReport;
