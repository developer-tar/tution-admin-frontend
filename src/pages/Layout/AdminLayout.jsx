import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    // { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Courses", path: "/admin/course" },
    { label: "Assignments", path: "/admin/course-assignment" },
    { label: "Content", path: "/admin/course-content" },
    { label: "Tests", path: "/admin/course-test" },
    { label: "Course List", path: "/admin/course-list" },
    { label: "Assignments List", path: "/admin/assignment-list" },
    { label: "Topic List", path: "/admin/topicsubtopic-list" },
    { label: "Test List", path: "/admin/test-list" },
    { label: "Reports", path: "/admin/course-report" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top App Bar with Gradient */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ color: "#fff", fontWeight: "bold" }}>
            Admin Panel
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
            mt: 8,
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.label}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemText primary={item.label} />
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
