import {
  Box,
  Drawer,
  List,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Collapse,
  ListItemButton,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const drawerWidth = 240;

const ParentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const menuItems = [
    {
      label: "Courses",
      children: [
        { label: "Manage Courses", path: "/admin/course" },
        { label: "Course List", path: "/admin/course-list" },
        { label: "Course Report", path: "/admin/course-report" },
      ],
    },
    {
      label: "Assignments",
      children: [
        { label: "Manage Assignments", path: "/admin/course-assignment" },
        { label: "Assignments List", path: "/admin/assignment-list" },
      ],
    },
    {
      label: "Content",
      children: [
        { label: "Manage Content", path: "/admin/course-content" },
        { label: "Topic List", path: "/admin/topicsubtopic-list" },
      ],
    },
    {
      label: "Tests",
      children: [
        { label: "Manage Tests", path: "/admin/course-test" },
        { label: "Test List", path: "/admin/test-list" },
      ],
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top App Bar */}
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
            <Box key={item.label}>
              <ListItemButton onClick={() => handleToggle(item.label)}>
                <ListItemText primary={item.label} />
                {openMenus[item.label] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.label}
                      sx={{ pl: 4 }}
                      selected={location.pathname === child.path}
                      onClick={() => navigate(child.path)}
                    >
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
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

export default ParentLayout;
