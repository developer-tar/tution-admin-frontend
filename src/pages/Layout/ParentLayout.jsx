import { ExpandLess, ExpandMore } from "@mui/icons-material";
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
  Toolbar,
  Typography,
  Button
} from "@mui/material";
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logout  from "../../logout";
const drawerWidth = 240;

const ParentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [loading, setLoading] = useState(true);  // loader state
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };//logout 

  const handleToggle = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };
  const prefix = process.env.REACT_APP_PARENT_PREFIX;

  // Simulate page load finished by hiding loader after mount
  useEffect(() => {
    // You can customize this: here loader disappears after 1 second
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]); // reset loader when route changes if needed

  const menuItems = [
    {
      label: "Dashboard",
       path: `/${prefix}/dashboard`,
    },
    {
      label: "Students",
      children: [
        { label: "My Student", path: `/${prefix}/my-student-list` },
        { label: "Add Student", path: `/${prefix}/add-student` },
        { label: "Change Student Password", path: `/${prefix}/change-password` },
      ],
    },
    {
      label: "Progress",
      children: [
        { label: "End of Report", path: `/${prefix}/end-of-report` },
        { label: "Course Target Area", path: `/${prefix}/course-target-area` },
        { label: "Finished Test", path: `/${prefix}/finished-test` },
        { label: "Test Scores", path: `/${prefix}/test-scores` },
      ],
    },
    {
      label: "Setting",
      path: `/${prefix}/settings`,
    },
  ];

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
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" noWrap sx={{ color: "#fff", fontWeight: "bold" }}>
              Parent Panel
            </Typography>

            <Box>
              <Button
                onClick={handleLogout}
                variant="outlined"
                size="small"
                sx={{
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "#fff",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
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
                {item.children ? (
                  <>
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
                  </>
                ) : (
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemText primary={item.label} />
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
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ParentLayout;
