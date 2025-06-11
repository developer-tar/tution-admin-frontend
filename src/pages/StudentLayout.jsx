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

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const prefix = '/student/';

    const menuItems = [

        { label: "Courses", path: `${prefix}course` },
        { label: "Assignments", path: `${prefix}course-assignment` },
        { label: "Content", path: `${prefix}course-content` },
        { label: "Tests", path: `${prefix}course-test` },
        { label: "Course List", path: `${prefix}course-list` },
        { label: "Assignments List", path: `${prefix}assignment-list` },
        { label: "Topic List", path: `${prefix}topicsubtopic-list` },
        { label: "Test List", path: `${prefix}test-list` },
        { label: "Reports", path: `${prefix}course-report` },
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

export default StudentLayout;
