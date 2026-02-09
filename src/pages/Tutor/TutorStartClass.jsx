import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, CircularProgress, Alert } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

/**
 * Start class page when tutor clicks "Start class" from a course.
 * Creates a classroom for that course and loads Jitsi Meet in this page.
 */
export default function TutorStartClass() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState(null);

  const tutorName = localStorage.getItem("tutor_name") || "Tutor";

  const getJitsiMeetingUrl = (code, name) => {
    const base = `https://meet.jit.si/${code}`;
    if (!name || !String(name).trim()) return base;
    return `${base}#userInfo.displayName=${encodeURIComponent(JSON.stringify(String(name).trim()))}`;
  };

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    api
      .get("tutor/courses")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const c = res.data.data.find((x) => String(x.id) === String(courseId));
          setCourse(c || { id: courseId, name: "Course" });
        }
      })
      .catch(() => setCourse({ id: courseId, name: "Course" }))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleStartMeeting = async () => {
    if (!courseId) return;
    setCreating(true);
    setError(null);
    try {
      const res = await api.post("tutor/classrooms", {
        course_id: Number(courseId),
        name: course ? `${course.name} - Live` : "Live class",
      });
      const code = res.data?.classroom?.room_code;
      if (code) {
        window.open(getJitsiMeetingUrl(code, tutorName), "_blank", "noopener,noreferrer");
        setOpened(true);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create meeting");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Start class
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {course?.name && <>Course: {course.name}. </>}
        Create a live meeting and it will open in a new tab. Students can join from their Classes section.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Button
            variant="contained"
            size="large"
            startIcon={<VideocamIcon />}
            onClick={handleStartMeeting}
            disabled={creating}
            sx={{
              background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {creating ? "Creating meeting…" : "Start meeting"}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click to create a Jitsi Meet room; it will open in a new tab.
          </Typography>
          {opened && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              Meeting opened in a new tab.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outlined"
        onClick={() => navigate("/tutor/courses")}
        sx={{ mt: 2 }}
      >
        Back to My Courses
      </Button>
    </Box>
  );
}
