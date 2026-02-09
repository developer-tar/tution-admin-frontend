import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Videocam as StartIcon,
  Schedule as ScheduleIcon,
  List as ListIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import api from "../../api";
import JitsiMeet from "../../components/JitsiMeet";

const statusConfig = {
  pending: { label: "Pending", color: "#ff9800" },
  ongoing: { label: "Ongoing", color: "#4caf50" },
  ended: { label: "Ended", color: "#9e9e9e" },
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function TutorClasses() {
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tab, setTab] = useState(0);

  // Start class
  const [startCourseId, setStartCourseId] = useState("");
  const [creating, setCreating] = useState(false);

  // Schedule class
  const [scheduleCourseId, setScheduleCourseId] = useState("");
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const tutorName = localStorage.getItem("tutor_name") || "Tutor";

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get("tutor/courses");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCourses(res.data.data);
        if (res.data.data.length && !startCourseId) setStartCourseId(String(res.data.data[0].id));
        if (res.data.data.length && !scheduleCourseId) setScheduleCourseId(String(res.data.data[0].id));
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const res = await api.get("tutor/classrooms");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setClassrooms(res.data.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load classes");
    } finally {
      setLoadingClassrooms(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (tab === 2) fetchClassrooms();
  }, [tab]);

  const handleStartMeeting = async () => {
    if (!startCourseId) {
      setError("Select a course.");
      return;
    }
    const course = courses.find((c) => String(c.id) === String(startCourseId));
    setCreating(true);
    setError(null);
    try {
      const res = await api.post("tutor/classrooms", {
        course_id: Number(startCourseId),
        name: course ? `${course.name} - Live` : "Live class",
      });
      const roomCode = res.data?.classroom?.room_code;
      if (roomCode) {
        window.open(`/tutor/meeting/${roomCode}`, "_blank", "noopener,noreferrer");
        setSuccess("Meeting opened in a new tab. Students can join via the Classes section.");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create meeting");
    } finally {
      setCreating(false);
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!scheduleCourseId || !scheduleName.trim()) {
      setError("Course and class name are required.");
      return;
    }
    setScheduling(true);
    setError(null);
    setSuccess(null);
    try {
      // Send times in UTC so backend stores correctly; datetime-local gives local time without timezone
      const startUtc = scheduleStart ? new Date(scheduleStart).toISOString() : null;
      const endUtc = scheduleEnd ? new Date(scheduleEnd).toISOString() : null;
      await api.post("tutor/classrooms", {
        course_id: Number(scheduleCourseId),
        name: scheduleName.trim(),
        start_time: startUtc,
        end_time: endUtc,
      });
      setSuccess("Class scheduled.");
      setScheduleName("");
      setScheduleStart("");
      setScheduleEnd("");
      fetchClassrooms();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to schedule class");
    } finally {
      setScheduling(false);
    }
  };

  const handleStartExisting = (roomCode) => {
    window.open(`/tutor/meeting/${roomCode}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Classes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Start a live meeting, schedule a class, or view and start from your scheduled classes.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
        <Tab icon={<StartIcon />} iconPosition="start" label="Start class" />
        <Tab icon={<ScheduleIcon />} iconPosition="start" label="Schedule class" />
        <Tab icon={<ListIcon />} iconPosition="start" label="My scheduled classes" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Create and start a meeting now
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Course</InputLabel>
                <Select
                  value={startCourseId}
                  label="Course"
                  onChange={(e) => setStartCourseId(e.target.value)}
                  disabled={loadingCourses}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleStartMeeting}
                disabled={creating || loadingCourses}
                sx={{ background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)", "&:hover": { opacity: 0.9 } }}
              >
                {creating ? "Creating…" : "Create & start meeting"}
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Typography variant="body2" color="text.secondary">
          Meeting will open in a new tab when you click &quot;Create &amp; start meeting&quot;.
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Schedule a class with start and end time
            </Typography>
            <form onSubmit={handleScheduleClass}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}>
                <FormControl size="small" required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={scheduleCourseId}
                    label="Course"
                    onChange={(e) => setScheduleCourseId(e.target.value)}
                    disabled={loadingCourses}
                  >
                    {courses.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Class name"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  required
                  placeholder="e.g. Week 3 - Algebra"
                />
                <TextField
                  size="small"
                  label="Start time"
                  type="datetime-local"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  label="End time"
                  type="datetime-local"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={scheduling || loadingCourses}
                  sx={{ alignSelf: "flex-start", background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)", "&:hover": { opacity: 0.9 } }}
                >
                  {scheduling ? "Scheduling…" : "Schedule class"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        {loadingClassrooms ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        ) : classrooms.length === 0 ? (
          <Card><CardContent><Typography color="text.secondary">No scheduled classes yet. Create one from "Start class" or "Schedule class".</Typography></CardContent></Card>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell><strong>Course</strong></TableCell>
                  <TableCell><strong>Start</strong></TableCell>
                  <TableCell><strong>End</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classrooms.map((c) => {
                  const config = statusConfig[c.status] || statusConfig.pending;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.course?.name ?? "—"}</TableCell>
                      <TableCell>{formatDateTime(c.start_time)}</TableCell>
                      <TableCell>{formatDateTime(c.end_time)}</TableCell>
                      <TableCell><Chip size="small" label={config.label} sx={{ bgcolor: config.color + "20", color: config.color }} /></TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PlayIcon />}
                          onClick={() => handleStartExisting(c.room_code)}
                          sx={{ background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)", "&:hover": { opacity: 0.9 } }}
                        >
                          Start
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Box>
  );
}
