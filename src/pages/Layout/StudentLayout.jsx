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
    Button,
    LinearProgress,
    Avatar,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Fade,
    ListItemIcon,
} from "@mui/material";
import {
    Dashboard,
    Assignment,
    VideoLibrary,
    Announcement,
    School,
    Quiz,
    Visibility,
    Logout,
    AccountCircle,
    MenuBook,
    TrendingUp,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logout  from "../../logout";
import  CapitalizeFirstLetter  from "../../CapitalizeFirstLetter";

const drawerWidth = 280;

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const [loading, setLoading] = useState(true);  // loader state
    const [userData, setUserData] = useState(null); // user data from localStorage
    const name = process.env.REACT_APP_STUDENT_PREFIX; //getting the prefix from the environment variable

    const handleLogout = () => {
        logout();
        navigate("/login");
    };//logout 

    const menuItems = [
        {
            label: "📊 Dashboard",
            icon: Dashboard,
            path: `/${name}`,
            color: "#2196f3",
            gradient: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
        },
        {
            label: "📚 Homework",
            icon: MenuBook,
            color: "#4caf50",
            gradient: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
            children: [
                { 
                    label: "📝 My Course Assignment", 
                    icon: Assignment,
                    path: `/${name}/my-current-assignment`,
                    color: "#4caf50"
                },
                { 
                    label: "🎯 My Course Test", 
                    icon: Quiz,
                    path: `/${name}/my-course-test`,
                    color: "#ff9800"
                },
            ],
        },
        {
            label: "🎥 Video",
            icon: VideoLibrary,
            color: "#9c27b0",
            gradient: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
            children: [
                { 
                    label: "📹 My Course Video", 
                    icon: VideoLibrary,
                    path: `/${name}/my-course-video`,
                    color: "#9c27b0"
                },
                { 
                    label: "👁️ My Video Views", 
                    icon: Visibility,
                    path: `/${name}/my-course-view`,
                    color: "#e91e63"
                },
            ],
        },
        {
            label: "📢 Announcements",
            icon: Announcement,
            path: `/${name}/course-test`,
            color: "#ff5722",
            gradient: "linear-gradient(135deg, #ff5722 0%, #d84315 100%)",
        },
    ];

    const handleToggle = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

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

    // Auto-open parent menus based on current route and simulate page load
    useEffect(() => {
        // Auto-open parent menus if child route is active
        const currentPath = location.pathname;
        const newOpenMenus = {};
        
        menuItems.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => child.path === currentPath);
                if (hasActiveChild) {
                    newOpenMenus[item.label] = true;
                }
            }
        });
        
        // Only update if there are changes to avoid unnecessary re-renders
        if (Object.keys(newOpenMenus).length > 0) {
            setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
        }
        
        // Hide loader after 1 second
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]); // reset when route changes

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* Show fancy loader when loading */}
            {loading && (
                <LinearProgress 
                    sx={{ 
                        height: 6,
                        background: 'rgba(102, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        }
                    }} 
                />
            )}
            
            {/* Fancy Top App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                    backdropFilter: "blur(10px)",
                    top: loading ? "6px" : 0,
                    transition: "all 0.3s ease",
                    height: 70,
                }}
            >
                <Toolbar sx={{ 
                    justifyContent: "space-between", 
                    height: 70,
                    px: 3
                }}>
                    {/* Left Side - Logo & Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "12px",
                            p: 1.5,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                        }}>
                            <Typography sx={{ fontSize: '24px' }}>🎓</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ 
                                color: "#fff", 
                                fontWeight: 700,
                                fontSize: '22px',
                                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                            }}>
                                {CapitalizeFirstLetter(name)} Portal
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                Learning Management System
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right Side - User Profile & Logout */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            display: { xs: 'none', sm: 'flex' }, 
                            alignItems: 'center', 
                            gap: 1.5 
                        }}>
                            <Box sx={{ 
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: "50%",
                                p: 1
                            }}>
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
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                                    {userData?.full_name || 'Student Portal'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                                    {userData?.email || 'Welcome back!'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Tooltip title="Logout" arrow>
                            <IconButton
                                onClick={handleLogout}
                                sx={{
                                    background: "rgba(255,255,255,0.15)",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    "&:hover": {
                                        background: "rgba(255,255,255,0.25)",
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
                                    },
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <Logout sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
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
                        mt: '70px',
                        background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRight: 'none',
                        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
                        // Custom scrollbar
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
                        scrollbarWidth: "thin",
                        scrollbarColor: "#667eea rgba(0,0,0,0.05)",
                    },
                }}
            >
                {/* Sidebar Header */}
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                        fontSize: '24px',
                        fontWeight: 700
                    }}>
                        {userData?.full_name ? userData.full_name.charAt(0).toUpperCase() : <School sx={{ fontSize: 30, color: 'white' }} />}
                    </Avatar>
                    
                    {userData ? (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5, fontSize: '16px' }}>
                                {userData.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6c757d', mb: 1, display: 'block', fontSize: '12px' }}>
                                {userData.email}
                            </Typography>
                            <Chip 
                                label={userData.role || "Student"} 
                                size="small" 
                                sx={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '11px'
                                }} 
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 0.5 }}>
                                Student Panel
                            </Typography>
                            <Chip 
                                label="Learning Hub" 
                                size="small" 
                                sx={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontWeight: 600
                                }} 
                            />
                        </>
                    )}
                </Box>
                
                <Divider sx={{ mx: 2, mb: 2 }} />
                
                <List sx={{ px: 2 }}>
                    {menuItems.map((item, index) => {
                        const ItemIcon = item.icon;
                        const isSelected = location.pathname === item.path;
                        const isParentSelected = item.children?.some(child => location.pathname === child.path);
                        
                        return (
                            <Fade in timeout={300 + index * 100} key={item.label}>
                                <Box sx={{ mb: 1 }}>
                                    {item.children ? (
                                        <>
                                            <ListItemButton 
                                                onClick={() => handleToggle(item.label)}
                                                sx={{
                                                    borderRadius: '12px',
                                                    mb: 1,
                                                    background: isParentSelected || openMenus[item.label] 
                                                        ? item.gradient 
                                                        : 'rgba(255,255,255,0.7)',
                                                    color: isParentSelected || openMenus[item.label] ? 'white' : '#2c3e50',
                                                    boxShadow: isParentSelected || openMenus[item.label] 
                                                        ? '0 4px 15px rgba(0,0,0,0.2)' 
                                                        : '0 2px 8px rgba(0,0,0,0.1)',
                                                    '&:hover': {
                                                        background: isParentSelected || openMenus[item.label] 
                                                            ? item.gradient 
                                                            : 'rgba(102, 126, 234, 0.1)',
                                                        transform: 'translateX(4px)',
                                                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <ListItemIcon sx={{ 
                                                    minWidth: 40,
                                                    color: 'inherit'
                                                }}>
                                                    <ItemIcon sx={{ fontSize: 22 }} />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={item.label} 
                                                    primaryTypographyProps={{
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    }}
                                                />
                                                {openMenus[item.label] ? 
                                                    <ExpandLess sx={{ color: 'inherit' }} /> : 
                                                    <ExpandMore sx={{ color: 'inherit' }} />
                                                }
                                            </ListItemButton>
                                            
                                            <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding sx={{ ml: 2 }}>
                                                    {item.children.map((child, childIndex) => {
                                                        const ChildIcon = child.icon;
                                                        const isChildSelected = location.pathname === child.path;
                                                        
                                                        return (
                                                            <Fade in timeout={200 + childIndex * 50} key={child.label}>
                                                                <ListItemButton
                                                                    onClick={() => navigate(child.path)}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        mb: 0.5,
                                                                        ml: 1,
                                                                        background: isChildSelected 
                                                                            ? `linear-gradient(135deg, ${child.color}20, ${child.color}10)` 
                                                                            : 'transparent',
                                                                        borderLeft: isChildSelected 
                                                                            ? `3px solid ${child.color}` 
                                                                            : '3px solid transparent',
                                                                        '&:hover': {
                                                                            background: `linear-gradient(135deg, ${child.color}15, ${child.color}05)`,
                                                                            transform: 'translateX(2px)'
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    <ListItemIcon sx={{ 
                                                                        minWidth: 35,
                                                                        color: isChildSelected ? child.color : '#6c757d'
                                                                    }}>
                                                                        <ChildIcon sx={{ fontSize: 18 }} />
                                                                    </ListItemIcon>
                                                                    <ListItemText 
                                                                        primary={child.label}
                                                                        primaryTypographyProps={{
                                                                            fontWeight: isChildSelected ? 600 : 500,
                                                                            fontSize: '13px',
                                                                            color: isChildSelected ? child.color : '#495057'
                                                                        }}
                                                                    />
                                                                </ListItemButton>
                                                            </Fade>
                                                        );
                                                    })}
                                                </List>
                                            </Collapse>
                                        </>
                                    ) : (
                                        <ListItemButton
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                borderRadius: '12px',
                                                mb: 1,
                                                background: isSelected 
                                                    ? item.gradient 
                                                    : 'rgba(255,255,255,0.7)',
                                                color: isSelected ? 'white' : '#2c3e50',
                                                boxShadow: isSelected 
                                                    ? '0 4px 15px rgba(0,0,0,0.2)' 
                                                    : '0 2px 8px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    background: isSelected 
                                                        ? item.gradient 
                                                        : 'rgba(102, 126, 234, 0.1)',
                                                    transform: 'translateX(4px)',
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <ListItemIcon sx={{ 
                                                minWidth: 40,
                                                color: 'inherit'
                                            }}>
                                                <ItemIcon sx={{ fontSize: 22 }} />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </ListItemButton>
                                    )}
                                </Box>
                            </Fade>
                        );
                    })}
                </List>
                
                {/* Sidebar Footer */}
                <Box sx={{ mt: 'auto', p: 2 }}>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        p: 2,
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <TrendingUp sx={{ fontSize: 24, mb: 1 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            Keep Learning!
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Your progress matters
                        </Typography>
                    </Box>
                </Box>
            </Drawer>

            {/* Enhanced Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    p: 3,
                    mt: '70px',
                    minHeight: "calc(100vh - 70px)",
                    // Custom scrollbar for main content
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
                }}
            >
                <Fade in timeout={500}>
                    <Box>
                        <Outlet />
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
};

export default StudentLayout;
