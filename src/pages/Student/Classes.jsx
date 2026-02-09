import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Alert,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Event as EventIcon,
  PlayArrow as JoinIcon,
  Schedule,
  Refresh as RefreshIcon,
  School,
  Person,
} from "@mui/icons-material";
import api from "../../api";

const statusConfig = {
  pending: { label: "Pending", color: "#ff9800", bg: "rgba(255, 152, 0, 0.12)" },
  ongoing: { label: "Ongoing", color: "#4caf50", bg: "rgba(76, 175, 80, 0.12)" },
  ended: { label: "Ended", color: "#9e9e9e", bg: "rgba(158, 158, 158, 0.12)" },
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/** Jitsi Meet URL with display name pre-filled for "Enter your name". */
const getJoinUrl = (roomCode, displayName) => {
  const base = `https://meet.jit.si/${roomCode}`;
  if (!displayName || !String(displayName).trim()) return base;
  return `${base}#userInfo.displayName=${encodeURIComponent(JSON.stringify(String(displayName).trim()))}`;
};

const StudentClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | upcoming | ongoing | ended

  const displayName = (() => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data).full_name : "";
    } catch {
      return "";
    }
  })();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("student/classes");
      const data = response.data?.data;
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filtered = classes.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const canJoin = (status) => status === "ongoing" || status === "pending";

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2c3e50" }}>
        My Classes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        View upcoming, ongoing, and past live classes. Join when a class is ongoing or about to start.
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v != null && setFilter(v)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="ongoing">Ongoing</ToggleButton>
          <ToggleButton value="ended">Ended</ToggleButton>
        </ToggleButtonGroup>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchClasses}
          disabled={loading}
          size="small"
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card>
                <CardContent>
                  <Skeleton height={24} width="60%" />
                  <Skeleton height={20} width="40%" sx={{ mt: 1 }} />
                  <Skeleton height={20} width="80%" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <EventIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography color="text.secondary">
            {filter === "all" ? "No classes found for your enrolled courses." : `No ${filter} classes.`}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((cls) => {
            const config = statusConfig[cls.status] || statusConfig.pending;
            return (
              <Grid item xs={12} md={6} key={cls.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    borderLeft: `4px solid ${config.color}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                        {cls.name}
                      </Typography>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          bgcolor: config.bg,
                          color: config.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    {cls.course?.name && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                        <School sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {cls.course.name}
                        </Typography>
                      </Box>
                    )}
                    {cls.tutor?.full_name && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                        <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {cls.tutor.full_name}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5 }}>
                      <Schedule sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(cls.start_time)} — {formatDateTime(cls.end_time)}
                      </Typography>
                    </Box>
                    {canJoin(cls.status) && cls.room_code && (
                      <Button
                        variant="contained"
                        startIcon={<JoinIcon />}
                        href={getJoinUrl(cls.room_code, displayName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          mt: 2,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          "&:hover": { opacity: 0.9 },
                        }}
                      >
                        {cls.status === "ongoing" ? "Join class" : "Open room"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default StudentClasses;
