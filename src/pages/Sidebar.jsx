// import {
//   Box,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Collapse,
// } from "@mui/material";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import QuizIcon from "@mui/icons-material/Quiz";
// import ReportIcon from "@mui/icons-material/Report";
// import ExpandLess from "@mui/icons-material/ExpandLess";
// import ExpandMore from "@mui/icons-material/ExpandMore";
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const Sidebar = () => {
//   const [openCourses, setOpenCourses] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleCoursesClick = () => {
//     setOpenCourses(!openCourses);
//   };

//   // Auto-open "Courses" if current path matches any course route
//   useEffect(() => {
//     if (location.pathname.startsWith("/course")) {
//       setOpenCourses(true);
//     }
//   }, [location.pathname]);

//   const menuItems = [
//     { text: "Dashboard", icon: <DashboardIcon />, link: "/" },
//   ];

//   const courseItems = [
//     { text: "Course", icon: <AssignmentIcon />, link: "/course" },
//     { text: "Course Assignments", icon: <AssignmentIcon />, link: "/course-assignment" },
//     { text: "Course Content", icon: <ContentCopyIcon />, link: "/course-content" },
//     { text: "Course Test", icon: <QuizIcon />, link: "/course-test" },
//     { text: "Course Report", icon: <ReportIcon />, link: "/course-report" }

//   ];

//   return (
//     <Box
//       sx={{
//         width: 240,
//         bgcolor: "#fff",
//         height: "100vh",
//         boxShadow: "2px 0px 5px rgba(0,0,0,0.1)",
//         p: 2,
//         display: "flex",
//         flexDirection: "column",
//         gap: 1,
//       }}
//     >
//       <List sx={{ width: "100%" }}>
//         {menuItems.map((item, index) => {
//           const isActive = location.pathname === item.link;
//           return (
//             <ListItem
//               button
//               key={index}
//               onClick={() => navigate(item.link)}
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 2,
//                 paddingY: 1,
//                 paddingX: 2,
//                 background: isActive
//                   ? "linear-gradient(90deg, #EF2A1E 0%, #4450A5 100%)"
//                   : "transparent",
//                 borderRadius: 1.5,
//                 color: isActive ? "#fff" : "#333",
//                 "&:hover": {
//                   background: isActive
//                     ? "linear-gradient(90deg, #EF2A1E 0%, #4450A5 100%)"
//                     : "#f5f5f5",
//                 },
//               }}
//             >
//               <ListItemIcon sx={{ color: isActive ? "#fff" : "#888", minWidth: "36px" }}>
//                 {item.icon}
//               </ListItemIcon>
//               <ListItemText
//                 primary={item.text}
//                 sx={{
//                   fontWeight: isActive ? 600 : 500,
//                   fontSize: "14px",
//                   color: isActive ? "#fff" : "#333",
//                 }}
//               />
//             </ListItem>
//           );
//         })}

//         {/* Courses Section */}
//         <ListItem
//           button
//           onClick={handleCoursesClick}
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 2,
//             paddingY: 1,
//             paddingX: 2,
//             borderRadius: 1.5,
//             color: "#333",
//             "&:hover": {
//               background: "#f5f5f5",
//             },
//           }}
//         >
//           <ListItemIcon sx={{ color: "#888", minWidth: "36px" }}>
//             <MenuBookIcon />
//           </ListItemIcon>
//           <ListItemText
//             primary="Courses"
//             sx={{
//               fontWeight: 500,
//               fontSize: "14px",
//               color: "#333",
//             }}
//           />
//           {openCourses ? <ExpandLess /> : <ExpandMore />}
//         </ListItem>

//         <Collapse in={openCourses} timeout="auto" unmountOnExit>
//           <List component="div" disablePadding sx={{ pl: 4 }}>
//             {courseItems.map((item, index) => {
//               const isActive = location.pathname === item.link;
//               return (
//                 <ListItem
//                   button
//                   key={index}
//                   onClick={() => navigate(item.link)}
//                   sx={{
//                     paddingY: 1,
//                     background: isActive ? "#f0f0f0" : "transparent",
//                     borderRadius: 1,
//                     "&:hover": {
//                       background: "#f5f5f5",
//                     },
//                   }}
//                 >
//                   <ListItemIcon sx={{ color: isActive ? "#EF2A1E" : "#888" }}>
//                     {item.icon}
//                   </ListItemIcon>
//                   <ListItemText
//                     primary={item.text}
//                     sx={{
//                       fontWeight: isActive ? 600 : 500,
//                       fontSize: "14px",
//                       color: isActive ? "#EF2A1E" : "#333",
//                     }}
//                   />
//                 </ListItem>
//               );
//             })}
//           </List>
//         </Collapse>
//       </List>
//     </Box>
//   );
// };

// export default Sidebar;



import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QuizIcon from "@mui/icons-material/Quiz";
import ReportIcon from "@mui/icons-material/Report";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group"; // Used for "Student Pannel"
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";


const Sidebar = () => {
  const [openCourses, setOpenCourses] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCoursesClick = () => {
    setOpenCourses(!openCourses);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/course")) {
      setOpenCourses(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/" },
    { text: "Student Pannel", icon: <GroupIcon />, link: "/student-pannel" },
   { text: "Videos", icon: <OndemandVideoIcon />, link: "/videos" },
      { text: "My Course Video", icon: <VideoLibraryIcon />, link: "/my-course-video-page" },
  ];

  const courseItems = [
    { text: "Course", icon: <AssignmentIcon />, link: "/course" },
    { text: "Course Assignments", icon: <AssignmentIcon />, link: "/course-assignment" },
    { text: "Course Content", icon: <ContentCopyIcon />, link: "/course-content" },
    { text: "Course Test", icon: <QuizIcon />, link: "/course-test" },
    { text: "Course Report", icon: <ReportIcon />, link: "/course-report" },
  ];

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#fff",
        height: "100vh",
        boxShadow: "2px 0px 5px rgba(0,0,0,0.1)",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        overflowY: "auto",
      }}
    >
      <List>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.link;
          return (
            <ListItem
              button
              key={index}
              onClick={() => navigate(item.link)}
              sx={{
                gap: 2,
                py: 1,
                px: 2,
                borderRadius: 1.5,
                background: isActive
                  ? "linear-gradient(90deg, #EF2A1E 0%, #4450A5 100%)"
                  : "transparent",
                color: isActive ? "#fff" : "#333",
                "&:hover": {
                  background: isActive
                    ? "linear-gradient(90deg, #EF2A1E 0%, #4450A5 100%)"
                    : "#f5f5f5",
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? "#fff" : "#888", minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "14px",
                  color: isActive ? "#fff" : "#333",
                }}
              />
            </ListItem>
          );
        })}

        {/* Courses Section */}
        <ListItem
          button
          onClick={handleCoursesClick}
          sx={{
            gap: 2,
            py: 1,
            px: 2,
            borderRadius: 1.5,
            "&:hover": {
              background: "#f5f5f5",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#888", minWidth: 36 }}>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText
            primary="Courses"
            sx={{ fontWeight: 500, fontSize: "14px", color: "#333" }}
          />
          {openCourses ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={openCourses} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 4 }}>
            {courseItems.map((item, index) => {
              const isActive = location.pathname === item.link;
              return (
                <ListItem
                  button
                  key={index}
                  onClick={() => navigate(item.link)}
                  sx={{
                    py: 1,
                    background: isActive ? "#f0f0f0" : "transparent",
                    borderRadius: 1,
                    "&:hover": {
                      background: "#f5f5f5",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "#EF2A1E" : "#888", minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "14px",
                      color: isActive ? "#EF2A1E" : "#333",
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </List>
    </Box>
  );
};

export default Sidebar;
