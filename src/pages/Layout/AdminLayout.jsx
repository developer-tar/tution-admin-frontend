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
  Collapse,
} from "@mui/material";
import { 
  ExpandLess, 
  ExpandMore,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TopicIcon from '@mui/icons-material/Topic';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { Logout, AccountCircle } from "@mui/icons-material";
import CapitalizeFirstLetter from "../../CapitalizeFirstLetter"; 

const drawerWidth = 240;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const name = process.env.REACT_APP_ADMIN_PREFIX;

  // Admin logout function
  const handleLogout = () => {
    // Remove admin-role from localStorage
    localStorage.removeItem('admin-role');
    localStorage.removeItem('token'); // Also remove token if exists
    navigate("/login");
  };

  const handleToggle = (label) => {
    setOpenMenus((prev) => {
      // Close all other menus and toggle the clicked one
      const newOpenMenus = {};
      newOpenMenus[label] = !prev[label];
      return newOpenMenus;
    });
  };

  // Helper function to check if parent menu should be highlighted
  const isParentActive = (item) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const menuItems = [
    {
      label: "Course",
      icon: <SchoolIcon />,
      children: [
        { label: "Course List", path: `/${name}/course-list`, icon: <ListIcon /> },
        { label: "Add Course", path: `/${name}/course`, icon: <AddIcon /> },
      ],
    },
    { label: "Timeslots", path: "/admin/timeslot", icon: <AccessTimeIcon /> },
    {
      label: "Assignments",
      icon: <AssignmentIcon />,
      children: [
        { label: "Assignment List", path: `/${name}/assignment-list`, icon: <ListIcon /> },
        { label: "Course Assignment", path: `/${name}/course-assignment`, icon: <AddIcon /> },
      ],
    },
    {
      label: "Topics",
      icon: <TopicIcon />,
      children: [
        { label: "Topic & SubTopic List", path: `/${name}/topic/subtopic-list`, icon: <ListIcon /> },
        { label: "Course Content", path: `/${name}/course-content`, icon: <VideoLibraryIcon /> },
      ],
    },
    {
      label: "Tests",
      icon: <QuizIcon />,
      children: [
        { label: "Test List", path: `/${name}/test-list`, icon: <ListIcon /> },
        { label: "Add Test", path: `/${name}/course-test`, icon: <AddIcon /> },
      ],
    },
    {
      label: "Mock Exams",
      icon: <CategoryIcon />,
      children: [
        { label: "Mock Exam Categories", path: "/admin/mock-exam-categories", icon: <CategoryIcon /> },
        { label: "Mock Exams", path: "/admin/mock-exams", icon: <QuizIcon /> },
      ],
    },
    { label: "Reports", path: `/${name}/course-report`, icon: <BarChartIcon /> },
  ];

  // Simulate page load finished by hiding loader after mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Auto-expand parent menu when child route is active and close others
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = {};
    
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.path === currentPath);
        if (hasActiveChild) {
          newOpenMenus[item.label] = true;
        }
      }
    });
    
    setOpenMenus(newOpenMenus);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />

      {/* Show loader only when loading is true */}
      {loading && <LinearProgress sx={{ height: 4 }} />}

      {/* Container for AppBar and main layout */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Fancy Top App Bar */}
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
            {/* Left side - Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                }}
              >
                <Typography sx={{ fontSize: '28px' }}>🔧</Typography>
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  noWrap 
                  sx={{ 
                    color: "#fff", 
                    fontWeight: 700,
                    fontSize: '22px',
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  {CapitalizeFirstLetter(name)} Panel
                </Typography>
              </Box>
            </Box>

            {/* Right side - User info and Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Admin Profile Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box 
                  sx={{ 
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccountCircle sx={{ color: "#fff", fontSize: 28 }} />
                </Box>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "#fff", 
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    Admin Portal
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "rgba(255,255,255,0.7)", 
                      fontSize: '11px'
                    }}
                  >
                    System Administrator
                  </Typography>
                </Box>
              </Box>

              {/* Logout Button */}
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
                  fontSize: '13px',
                  textTransform: 'none',
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

        {/* Fancy Sidebar */}
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
              // Custom scrollbar styling
              "&::-webkit-scrollbar": {
                width: "8px",
              },
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
              // Firefox scrollbar
              scrollbarWidth: "thin",
              scrollbarColor: "#667eea rgba(0,0,0,0.05)",
            },
          }}
        >
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <Box key={item.label} sx={{ mb: 1 }}>
                {item.children ? (
                  <>
                    <ListItemButton 
                      onClick={() => handleToggle(item.label)}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        mb: 0.5,
                        background: (openMenus[item.label] || isParentActive(item))
                          ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" 
                          : "transparent",
                        color: (openMenus[item.label] || isParentActive(item)) ? "#fff" : "#495057",
                        "&:hover": {
                          background: (openMenus[item.label] || isParentActive(item))
                            ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" 
                            : "rgba(102, 126, 234, 0.1)",
                          transform: "translateX(4px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: (openMenus[item.label] || isParentActive(item)) ? "#fff" : "#667eea",
                        minWidth: 40 
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label} 
                        sx={{ 
                          "& .MuiTypography-root": { 
                            fontWeight: (openMenus[item.label] || isParentActive(item)) ? 600 : 500,
                            fontSize: "14px"
                          } 
                        }} 
                      />
                      {(openMenus[item.label] || isParentActive(item)) ? 
                        <ExpandLess sx={{ color: "#fff" }} /> : 
                        <ExpandMore sx={{ color: "#667eea" }} />
                      }
                    </ListItemButton>
                    <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItemButton
                            key={child.label}
                            sx={{ 
                              pl: 6,
                              mx: 1,
                              borderRadius: 2,
                              mb: 0.5,
                              background: location.pathname === child.path 
                                ? "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)" 
                                : "transparent",
                              color: location.pathname === child.path ? "#fff" : "#6c757d",
                              "&:hover": {
                                background: location.pathname === child.path 
                                  ? "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)" 
                                  : "rgba(59, 42, 159, 0.1)",
                                transform: "translateX(8px)",
                              },
                              transition: "all 0.3s ease",
                            }}
                            onClick={() => navigate(child.path)}
                          >
                            <ListItemIcon sx={{ 
                              color: location.pathname === child.path ? "#fff" : "#3B2A9F",
                              minWidth: 35 
                            }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={child.label} 
                              sx={{ 
                                "& .MuiTypography-root": { 
                                  fontWeight: location.pathname === child.path ? 600 : 400,
                                  fontSize: "13px"
                                } 
                              }} 
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItemButton
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      mb: 0.5,
                      background: location.pathname === item.path 
                        ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" 
                        : "transparent",
                      color: location.pathname === item.path ? "#fff" : "#495057",
                      "&:hover": {
                        background: location.pathname === item.path 
                          ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" 
                          : "rgba(102, 126, 234, 0.1)",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon sx={{ 
                      color: location.pathname === item.path ? "#fff" : "#667eea",
                      minWidth: 40 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      sx={{ 
                        "& .MuiTypography-root": { 
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          fontSize: "14px"
                        } 
                      }} 
                    />
                  </ListItemButton>
                )}
              </Box>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 3,
            mt: 8,
            minHeight: "100vh",
            overflowY: "auto",
            // Custom scrollbar styling for main content
            "&::-webkit-scrollbar": {
              width: "10px",
            },
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
            // Firefox scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: "#667eea rgba(0,0,0,0.05)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;