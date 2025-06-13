import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Divider,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TopicIcon from '@mui/icons-material/Topic';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Course", path: "/admin/course-list", icon: <SchoolIcon /> },
    { label: "Assignments", path: "/admin/assignment-list", icon: <AssignmentIcon /> },
    { label: "Topic", path: "/admin/topicsubtopic-list", icon: <TopicIcon /> },
    { label: "Test", path: "/admin/test-list", icon: <QuizIcon /> },
    { label: "Reports", path: "/admin/course-report", icon: <BarChartIcon /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ pl: 3 }}>
          <Typography variant="h6" noWrap sx={{ color: "#fff", fontWeight: "bold" }}>
            📘 Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#fff", // Light background
            color: "#333", // Dark text
            pt: 8,
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: "#f0f0ff",
                    color: "#3B2A9F",
                    '& .MuiListItemIcon-root': {
                      color: "#3B2A9F",
                    },
                  },
                  '&:hover': {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#555" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f9f9f9",
          p: 3,
          mt: 8,
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;