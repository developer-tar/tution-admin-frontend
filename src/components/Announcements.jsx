import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Announcement as AnnouncementIcon,
  ExpandMore,
  ExpandLess,
  AccessTime,
} from "@mui/icons-material";
import api from "../api";
import { toast } from "react-toastify";

const Announcements = ({ role = "student" }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [role]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine the API endpoint based on role
      let endpoint = "announcements";
      if (role === "admin") {
        endpoint = "admin/announcements";
      } else if (role === "parent") {
        endpoint = "parent/announcements";
      } else if (role === "student") {
        endpoint = "student/announcements";
      }

      const response = await api.get(endpoint);

      if (response.data.success) {
        const data = response.data.data;
        // Handle different response structures
        let announcementsList = Array.isArray(data)
          ? data
          : Array.isArray(data?.announcements)
          ? data.announcements
          : Array.isArray(data?.data)
          ? data.data
          : [];

        // Filter announcements by target audience, date/time, and class
        const now = new Date();
        announcementsList = announcementsList.filter((announcement) => {
          // Filter by target audience - handle both array and string formats
          let targetAudience = announcement.target_audience;
          
          // Convert to array if it's a string
          if (typeof targetAudience === "string") {
            targetAudience = [targetAudience.toLowerCase()];
          } else if (Array.isArray(targetAudience)) {
            targetAudience = targetAudience.map(a => a.toLowerCase());
          } else {
            targetAudience = ["all"]; // Default to all if not specified
          }

          const matchesAudience =
            targetAudience.includes(role) ||
            targetAudience.includes("all") ||
            (targetAudience.length === 3 && targetAudience.includes("admin") && targetAudience.includes("parent") && targetAudience.includes("student"));

          if (!matchesAudience) return false;

          // Filter by date/time - only show active announcements
          const startDateTime = announcement.start_date_time || announcement.start_datetime;
          const endDateTime = announcement.end_date_time || announcement.end_datetime;

          if (startDateTime) {
            const start = new Date(startDateTime);
            if (now < start) return false; // Not started yet
          }

          if (endDateTime) {
            const end = new Date(endDateTime);
            if (now > end) return false; // Already ended
          }

          // Filter by class if user has a class_id (for students/parents)
          // This assumes the user's class_id is stored in localStorage or passed as prop
          // For now, we'll check if class_ids exists and if it's not "all"
          const classIds = announcement.class_ids || (announcement.class_id ? [announcement.class_id] : []);
          
          // If announcement has specific classes and user has a class_id, check if user's class is included
          // Note: This requires getting user's class_id from localStorage or API
          // For now, if class_ids is empty or includes "all", show it
          // Otherwise, backend should handle class filtering
          if (classIds.length > 0 && !classIds.includes("all")) {
            // Backend should filter by class, but we can do basic filtering here
            // This is a placeholder - actual class filtering should be done on backend
            return true; // Let backend handle class filtering
          }

          return true;
        });

        setAnnouncements(announcementsList);
      } else {
        throw new Error(response.data.message || "Failed to fetch announcements");
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      
      // Don't show error toast for 404 or empty results
      if (err.response?.status !== 404) {
        setError("Failed to load announcements");
      } else {
        setAnnouncements([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                p: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnnouncementIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Announcements
            </Typography>
            {announcements.length > 0 && (
              <Chip
                label={announcements.length}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : announcements.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No announcements available
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement.id || index}>
                  <ListItem
                    sx={{
                      alignItems: "flex-start",
                      py: 2,
                      px: 0,
                      "&:hover": {
                        backgroundColor: "rgba(102, 126, 234, 0.05)",
                        borderRadius: 2,
                      },
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, flexGrow: 1 }}
                        >
                          {announcement.title || announcement.subject || "Announcement"}
                        </Typography>
                        {announcement.priority && (
                          <Chip
                            label={announcement.priority}
                            size="small"
                            color={getPriorityColor(announcement.priority)}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}
                      >
                        {announcement.message ||
                          announcement.content ||
                          announcement.description ||
                          ""}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <AccessTime sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(
                            announcement.created_at ||
                              announcement.date ||
                              announcement.published_at
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < announcements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default Announcements;

