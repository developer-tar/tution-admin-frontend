import { 
  ExpandLess, 
  ExpandMore, 
  Dashboard,
  School,
  PersonAdd,
  Lock,
  Assessment,
  BarChart,
  Quiz,
  Settings,
  People,
  TrendingUp,
  Logout,
  AccountCircle,
  ReceiptLong,
  Home,
  Notifications,
  EmojiEvents
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Collapse,
  CssBaseline,
  Drawer,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Badge
} from "@mui/material";
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logout  from "../../logout";
import  CapitalizeFirstLetter  from "../../CapitalizeFirstLetter";
import api from "../../api";
const drawerWidth = 240;

const ParentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [loading, setLoading] = useState(true);  // loader state
  const [userData, setUserData] = useState(null); // user data from localStorage
  const [announcementCount, setAnnouncementCount] = useState(0); // announcement count for badge
  
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };//logout 

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Helper function to check if parent menu should be highlighted
  const isParentActive = (item) => {
    if (item.path) {
      // Normalize both paths by removing trailing slash for comparison
      const currentPath = location.pathname.replace(/\/$/, '');
      const itemPath = item.path.replace(/\/$/, '');
      
      // Check if normalized paths match
      if (currentPath === itemPath) return true;
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  };
  const name = process.env.REACT_APP_PARENT_PREFIX;

  const menuItems = [
    {
      label: "Dashboard",
      path: `/${name}`,
      icon: <Dashboard />,
    },
    {
      label: "Students",
      icon: <School />,
      children: [
        { label: "My Student", path: `/${name}/my-student-list`, icon: <People /> },
        { label: "Add Student", path: `/${name}/add-student`, icon: <PersonAdd /> },
        { label: "Change Student Password", path: `/${name}/change-password`, icon: <Lock /> },
      ],
    },
    {
      label: "Progress",
      icon: <TrendingUp />,
      children: [
        { label: "End of Report", path: `/${name}/end-of-report`, icon: <Assessment /> },
        { label: "Course Target Area", path: `/${name}/course-target-area`, icon: <BarChart /> },
        { label: "Finished Test", path: `/${name}/finished-test`, icon: <Quiz /> },
        { label: "Test Scores", path: `/${name}/test-scores`, icon: <Assessment /> },
      ],
    },
    {
      label: "Billing",
      icon: <ReceiptLong />,
      children: [
        { label: "Course", path: `/${name}/billing/course`, icon: <School /> },
        { label: "Mock", path: `/${name}/billing/mock`, icon: <Quiz /> },
        { label: "Paper", path: `/${name}/billing/paper`, icon: <ReceiptLong /> },
        { label: "Billing Information", path: `/${name}/billing-information`, icon: <Home /> },
      ],
    },
    {
      label: "Announcements",
      path: `/${name}/announcements`,
      icon: <Notifications />,
      badgeCount: announcementCount,
    },
    {
      label: "Certificates",
      path: `/${name}/certificates`,
      icon: <EmojiEvents />,
    },
    {
      label: "Setting",
      path: `/${name}/settings`,
      icon: <Settings />,
    },
  ];

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  // Fetch announcement count for badge
  useEffect(() => {
    const fetchAnnouncementCount = async () => {
      try {
        const response = await api.get('parent/announcements');
        if (response.data && response.data.success && response.data.data) {
          const announcements = Array.isArray(response.data.data) ? response.data.data : [];
          setAnnouncementCount(announcements.length);
        }
      } catch (error) {
        console.error('Error fetching announcement count:', error);
        setAnnouncementCount(0);
      }
    };
    fetchAnnouncementCount();
  }, []);

  // Simulate page load finished by hiding loader after mount
  useEffect(() => {
    // You can customize this: here loader disappears after 1 second
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]); // reset loader when route changes if needed

  // Auto-expand parent menu when child route is active
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = { ...openMenus };
    
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
        {/* Top App Bar */}
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
                <Typography >📘</Typography>
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
              {/* User Profile Section */}
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
                  {userData?.full_name ? (
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      fontSize: '14px', 
                      fontWeight: 700,
                      bgcolor: 'rgba(255,255,255,0.3)'
                    }}>
                      {userData.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                  ) : (
                    <AccountCircle sx={{ color: "#fff", fontSize: 28 }} />
                  )}
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
                    {userData?.full_name || 'Parent Portal'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "rgba(255,255,255,0.7)", 
                      fontSize: '11px'
                    }}
                  >
                    {userData?.email || 'Welcome back!'}
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
                      {item.label === "Announcements" ? (
                        <Badge badgeContent={announcementCount} color="error" max={99}>
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
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
            bgcolor: "#f9f9f9",
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

export default ParentLayout;
