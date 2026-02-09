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
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Event as EventIcon,
  PlayArrow as JoinIcon,
  Refresh as RefreshIcon,
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
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <EventIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography color="text.secondary">
            {filter === "all" ? "No classes found for your enrolled courses." : `No ${filter} classes.`}
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Tutor</strong></TableCell>
                <TableCell><strong>Start</strong></TableCell>
                <TableCell><strong>End</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((cls) => {
                const config = statusConfig[cls.status] || statusConfig.pending;
                return (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls.course?.name ?? "—"}</TableCell>
                    <TableCell>{cls.tutor?.full_name ?? "—"}</TableCell>
                    <TableCell>{formatDateTime(cls.start_time)}</TableCell>
                    <TableCell>{formatDateTime(cls.end_time)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={config.label}
                        sx={{ bgcolor: config.bg, color: config.color, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {canJoin(cls.status) && cls.room_code ? (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<JoinIcon />}
                          href={getJoinUrl(cls.room_code, displayName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "&:hover": { opacity: 0.9 },
                          }}
                        >
                          {cls.status === "ongoing" ? "Join class" : "Open room"}
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StudentClasses;
