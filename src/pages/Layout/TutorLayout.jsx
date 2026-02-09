import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Button,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  EmojiEvents as EmojiEventsIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  AccessTime as AccessTimeIcon,
  Videocam as VideocamIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Logout, AccountCircle } from "@mui/icons-material";

const drawerWidth = 240;

const menuItems = [
  { label: "Dashboard", path: "/tutor", icon: <DashboardIcon /> },
  { label: "Students", path: "/tutor/students", icon: <PeopleIcon /> },
  { label: "Courses", path: "/tutor/courses", icon: <SchoolIcon /> },
  { label: "Classes", path: "/tutor/classes", icon: <VideocamIcon /> },
  { label: "Mock Exams", path: "/tutor/mock-exams", icon: <QuizIcon /> },
  { label: "Papers", path: "/tutor/papers", icon: <DescriptionIcon /> },
  { label: "Timeslots", path: "/tutor/timeslots", icon: <AccessTimeIcon /> },
  { label: "Assignments", path: "/tutor/assignments", icon: <AssignmentIcon /> },
  { label: "Tests", path: "/tutor/tests", icon: <QuizIcon /> },
  { label: "Announcements", path: "/tutor/announcements", icon: <NotificationsIcon /> },
  { label: "Awards", path: "/tutor/awards", icon: <EmojiEventsIcon /> },
  { label: "Certificates", path: "/tutor/certificates", icon: <PictureAsPdfIcon /> },
];

const TutorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tutorName, setTutorName] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("tutor_name");
    localStorage.removeItem("tutor_email");
    window.location.href = "/tutor-login";
  };

  useEffect(() => {
    setTutorName(localStorage.getItem("tutor_name") || "");
    setTutorEmail(localStorage.getItem("tutor_email") || "");
  }, []);

  const isMenuActive = (item) => {
    const currentPath = location.pathname.replace(/\/$/, "") || "/tutor";
    return currentPath === item.path || (item.path === "/tutor" && currentPath === "/tutor");
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      {loading && <LinearProgress sx={{ height: 4 }} />}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)",
            boxShadow: "none",
            top: loading ? "4px" : 0,
            transition: "top 0.3s",
          }}
        >
          <Toolbar sx={{
            justifyContent: "space-between",
            px: 3,
            height: 70,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <Typography sx={{ fontSize: "28px" }}>👨‍🏫</Typography>
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  noWrap
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "22px",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Tutor Panel
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountCircle sx={{ color: "#fff", fontSize: 28 }} />
                </Box>
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}
                  >
                    {tutorName || "Tutor"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}
                  >
                    {tutorEmail}
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={handleLogout}
                variant="contained"
                size="medium"
                startIcon={<Logout />}
                sx={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "none",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.25)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              mt: 8,
              background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRight: "1px solid #dee2e6",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": {
                background: "rgba(0,0,0,0.05)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "linear-gradient(180deg, #3B2A9F 0%, #D62926 100%)",
              },
              scrollbarWidth: "thin",
              scrollbarColor: "#667eea rgba(0,0,0,0.05)",
            },
          }}
        >
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.label}
                selected={isMenuActive(item)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  background: isMenuActive(item)
                    ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                  color: isMenuActive(item) ? "#fff" : "#495057",
                  "&:hover": {
                    background: isMenuActive(item)
                      ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                      : "rgba(102, 126, 234, 0.1)",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.3s ease",
                  "&.Mui-selected": {
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                  },
                }}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon
                  sx={{
                    color: isMenuActive(item) ? "#fff" : "#667eea",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: isMenuActive(item) ? 600 : 500,
                      fontSize: "14px",
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            p: 3,
            pb: 8,
            mt: 8,
            minHeight: "100vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "10px" },
            "&::-webkit-scrollbar-track": {
              background: "rgba(0,0,0,0.05)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "10px",
              border: "2px solid #f9f9f9",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "linear-gradient(180deg, #3B2A9F 0%, #D62926 100%)",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "#667eea rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ pb: 4 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TutorLayout;
