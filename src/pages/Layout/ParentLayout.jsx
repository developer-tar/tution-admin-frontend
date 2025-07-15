import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
    AppBar,
    Box,
    Collapse,
    CssBaseline,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

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
   const prefix = process.env.REACT_APP_PARENT_PREFIX; //getting the prefix from the environment variable

    const menuItems = [
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
            label: "Videes",
            children: [
                { label: "Manage Content", path: `/${prefix}/course-content` },
                { label: "Topic List", path: `/${prefix}/topicsubtopic-list` },
            ],
        },
        {
            label: "Setting",
            path: `/${prefix}/settings`,
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
                        Parent Panel
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
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default ParentLayout;
