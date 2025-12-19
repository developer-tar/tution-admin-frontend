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
  Button,
} from "@mui/material";
import {
  Announcement as AnnouncementIcon,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Today,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";

const Announcements = ({ role = "student" }) => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [todayAnnouncements, setTodayAnnouncements] = useState([]);
  const [otherAnnouncements, setOtherAnnouncements] = useState([]);
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

      console.log(`[Announcements ${role}] API Response:`, {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data),
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        firstLevel: response.data?.data,
      });

      if (response.data && response.data.success !== false) {
        const data = response.data.data;
        // Handle different response structures (paginated or direct array)
        let announcementsList = [];
        
        if (Array.isArray(data)) {
          // Direct array response
          announcementsList = data;
          console.log(`[Announcements ${role}] Direct array response, count:`, announcementsList.length);
        } else if (data && typeof data === 'object') {
          // Paginated response from Laravel
          if (Array.isArray(data.data)) {
            announcementsList = data.data;
            console.log(`[Announcements ${role}] Paginated response (data.data), count:`, announcementsList.length);
          } else if (Array.isArray(data.announcements)) {
            announcementsList = data.announcements;
            console.log(`[Announcements ${role}] Paginated response (data.announcements), count:`, announcementsList.length);
          } else {
            // Try to find any array property
            for (const key in data) {
              if (Array.isArray(data[key])) {
                announcementsList = data[key];
                console.log(`[Announcements ${role}] Found array in property '${key}', count:`, announcementsList.length);
                break;
              }
            }
            if (announcementsList.length === 0) {
              console.warn(`[Announcements ${role}] No array found in response data:`, data);
            }
          }
        } else {
          console.warn(`[Announcements ${role}] Unexpected data type:`, typeof data, data);
        }

        console.log(`[Announcements ${role}] Raw announcements count:`, announcementsList.length);

        // Filter announcements by target audience and date/time
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const filteredAnnouncements = announcementsList.filter((announcement) => {
          // Filter by target audience - handle both array and string formats
          let targetAudience = announcement.target_audience || announcement.target_roles;
          
          // Convert to array if it's a string
          if (typeof targetAudience === "string") {
            targetAudience = [targetAudience.toLowerCase()];
          } else if (Array.isArray(targetAudience)) {
            targetAudience = targetAudience.map(a => typeof a === 'string' ? a.toLowerCase() : a);
          } else {
            // If no target audience specified, show to all (null or empty means all)
            targetAudience = ["all"];
          }

          // Normalize role for comparison
          const normalizedRole = role === "admin" ? "admin" : role === "parent" ? "parent" : role === "student" ? "student" : role;
          const roleMap = { "admin": "Admin", "parent": "Parent", "student": "Student" };
          const capitalizedRole = roleMap[normalizedRole] || normalizedRole;

          const matchesAudience =
            targetAudience.includes(normalizedRole) ||
            targetAudience.includes(capitalizedRole) ||
            targetAudience.includes("all") ||
            (targetAudience.length === 3 && targetAudience.includes("admin") && targetAudience.includes("parent") && targetAudience.includes("student"));

          if (!matchesAudience) {
            console.log(`[Announcements ${role}] Filtered out - audience mismatch:`, {
              announcementId: announcement.id,
              targetAudience,
              normalizedRole,
            });
            return false;
          }

          // Filter by date/time - only show active announcements
          const startDateTime = announcement.start_date_time || announcement.start_datetime || announcement.published_at;
          const endDateTime = announcement.end_date_time || announcement.end_datetime || announcement.expires_at;

          if (startDateTime) {
            const start = new Date(startDateTime);
            if (now < start) {
              console.log(`[Announcements ${role}] Filtered out - not started yet:`, {
                announcementId: announcement.id,
                startDateTime,
                now: now.toISOString(),
              });
              return false; // Not started yet
            }
          }

          if (endDateTime) {
            const end = new Date(endDateTime);
            if (now > end) {
              console.log(`[Announcements ${role}] Filtered out - already ended:`, {
                announcementId: announcement.id,
                endDateTime,
                now: now.toISOString(),
              });
              return false; // Already ended
            }
          }

          return true;
        });

        console.log(`[Announcements ${role}] Filtered announcements count:`, filteredAnnouncements.length);

        // Separate today's announcements and other announcements
        const todayAnnouncements = filteredAnnouncements.filter(announcement => {
          if (announcement.is_today) return true;
          const publishedDate = announcement.start_date_time || announcement.start_datetime || announcement.published_at;
          if (!publishedDate) return false;
          const pubDate = new Date(publishedDate);
          const announcementDate = new Date(pubDate.getFullYear(), pubDate.getMonth(), pubDate.getDate());
          return announcementDate.getTime() === today.getTime();
        });

        const otherAnnouncements = filteredAnnouncements.filter(announcement => {
          if (announcement.is_today) return false;
          const publishedDate = announcement.start_date_time || announcement.start_datetime || announcement.published_at;
          if (!publishedDate) return true;
          const pubDate = new Date(publishedDate);
          const announcementDate = new Date(pubDate.getFullYear(), pubDate.getMonth(), pubDate.getDate());
          return announcementDate.getTime() !== today.getTime();
        });

        // Priority order: urgent > important > general > maintenance
        const getPriorityOrder = (priority) => {
          const priorityLower = priority?.toLowerCase() || 'general';
          switch (priorityLower) {
            case 'urgent':
              return 0;
            case 'important':
              return 1;
            case 'general':
              return 2;
            case 'maintenance':
              return 3;
            default:
              return 2; // Default to general
          }
        };

        // Sort today's announcements: pinned first, then by priority (urgent > important > general > maintenance), then by date
        const sortedToday = todayAnnouncements.sort((a, b) => {
          // Pinned items first
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          
          // Then by priority
          const priorityA = getPriorityOrder(a.priority);
          const priorityB = getPriorityOrder(b.priority);
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Then by date (newest first)
          const dateA = new Date(a.start_date_time || a.start_datetime || a.published_at || a.created_at || 0);
          const dateB = new Date(b.start_date_time || b.start_datetime || b.published_at || b.created_at || 0);
          return dateB - dateA;
        });

        // Sort other announcements: pinned first, then by date
        const sortedOther = otherAnnouncements.sort((a, b) => {
          // Pinned items first
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          
          // Then by date (newest first)
          const dateA = new Date(a.start_date_time || a.start_datetime || a.published_at || a.created_at || 0);
          const dateB = new Date(b.start_date_time || b.start_datetime || b.published_at || b.created_at || 0);
          return dateB - dateA;
        });

        setTodayAnnouncements(sortedToday);
        setOtherAnnouncements(sortedOther);
        setAnnouncements([...sortedToday, ...sortedOther]);
        
        console.log(`[Announcements ${role}] Final counts - Today: ${sortedToday.length}, Other: ${sortedOther.length}, Total: ${sortedToday.length + sortedOther.length}`);
      } else {
        console.warn(`[Announcements ${role}] API returned success=false or no data:`, response.data);
        setAnnouncements([]);
        setTodayAnnouncements([]);
        setOtherAnnouncements([]);
      }
    } catch (err) {
      console.error(`[Announcements ${role}] Error fetching announcements:`, err);
      console.error(`[Announcements ${role}] Error details:`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      
      // Set empty arrays on any error
      setAnnouncements([]);
      setTodayAnnouncements([]);
      setOtherAnnouncements([]);
      
      // Handle different error cases
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const errorData = err.response.data;
        
        if (status === 404) {
          // 404 is valid - no announcements found, don't show error
          setError(null);
        } else if (status === 401) {
          setError("Authentication failed. Please log in again.");
          toast.error("Authentication failed. Please log in again.");
        } else if (status === 403) {
          setError("You don't have permission to view announcements.");
          toast.error("You don't have permission to view announcements.");
        } else if (status === 500) {
          setError("Server error. Please try again later.");
          toast.error("Server error. Please try again later.");
        } else {
          const errorMessage = errorData?.message || errorData?.error || `Failed to load announcements (${status})`;
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError("Network error. Please check your connection and try again.");
        toast.error("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        const errorMessage = err.message || "Failed to load announcements";
        setError(errorMessage);
        toast.error(errorMessage);
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
            {todayAnnouncements.length > 0 && (
              <Chip
                icon={<Today />}
                label={`${todayAnnouncements.length} Today`}
                size="small"
                color="error"
                sx={{ ml: 1, fontWeight: 600 }}
              />
            )}
            {announcements.length > 0 && (
              <Chip
                label={announcements.length}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {(role === "student" || role === "parent") && announcements.length > 0 && (
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(role === "student" ? "/student/announcements" : "/parent/announcements");
                }}
                sx={{ textTransform: "none" }}
              >
                View All
              </Button>
            )}
            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
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
            <Box>
              {/* Today's Announcements Section */}
              {todayAnnouncements.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                      p: 1.5,
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                      borderRadius: 2,
                      border: "1px solid rgba(244, 67, 54, 0.3)",
                    }}
                  >
                    <Today sx={{ color: "error.main", fontSize: 20 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "error.main" }}
                    >
                      Today's Announcements ({todayAnnouncements.length})
                    </Typography>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {todayAnnouncements.map((announcement, index) => (
                      <React.Fragment key={announcement.id || `today-${index}`}>
                        <ListItem
                          sx={{
                            alignItems: "flex-start",
                            py: 2,
                            px: 0,
                            backgroundColor: "rgba(244, 67, 54, 0.03)",
                            borderRadius: 2,
                            mb: 1,
                            border: "1px solid rgba(244, 67, 54, 0.1)",
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 0.08)",
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
                                sx={{ fontWeight: 700, flexGrow: 1, color: "error.dark" }}
                              >
                                {announcement.title || announcement.subject || "Announcement"}
                              </Typography>
                              <Chip
                                icon={<Today />}
                                label="Today"
                                size="small"
                                color="error"
                                sx={{ fontWeight: 600 }}
                              />
                              {announcement.priority && (
                                <Chip
                                  label={announcement.priority}
                                  size="small"
                                  color={getPriorityColor(announcement.priority)}
                                />
                              )}
                              {announcement.is_pinned && (
                                <Chip
                                  label="Pinned"
                                  size="small"
                                  color="warning"
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
                        {index < todayAnnouncements.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}

              {/* Other Announcements Section */}
              {otherAnnouncements.length > 0 && (
                <Box>
                  {todayAnnouncements.length > 0 && (
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
                    >
                      All Announcements
                    </Typography>
                  )}
                  <List sx={{ p: 0 }}>
                    {otherAnnouncements.map((announcement, index) => (
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
                      {index < otherAnnouncements.length - 1 && <Divider />}
                    </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default Announcements;

