import React from "react";
import { Box, Grid, Typography, Button, LinearProgress } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { button, icon } from "../style";

const AssignmentCard = ({ subject, course, progress, deadline, due }) => {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        border: "1px solid #E0E0E0",
        backgroundColor: "#fff",
        mb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 600 }}>{subject}</Typography>
        <Box
          sx={{
            backgroundColor: due === "tomorrow" ? "#FFCDD2" : "#FFECB3",
            color: "#B71C1C",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        >
          {due === "tomorrow" ? "Due tomorrow" : "Due in 2 days"}
        </Box>
      </Box>
      <Typography sx={{ fontSize: "14px", color: "#777" }}>{course}</Typography>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "#F0F0F0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#4450A5",
          },
        }}
      />

      <Typography sx={{ fontSize: "12px", color: "#777" }}>
        {progress}% Complete
      </Typography>
      <Typography sx={{ fontSize: "12px", color: "#777" }}>Deadline: {deadline}</Typography>
    </Box>
  );
};

const AnnouncementCard = ({ title, date, description }) => {
  return (
    <Box
      sx={{
        mb: 2,
        paddingBottom: 1,
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>{title}</Typography>
      <Typography sx={{ fontSize: "12px", color: "#777" }}>{date} ago</Typography>
      <Typography sx={{ fontSize: "14px", color: "#555", mt: 1 }}>{description}</Typography>
    </Box>
  );
};

const CurrentAssign = () => {
  return (
    <Box sx={{ padding: 3, backgroundColor: "#FAFAFA" }}>
      <Grid container spacing={3}>
        {/* Current Assignments Section */}
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              padding: 2,
              borderRadius: 2,
              border: "1px solid #E0E0E0",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AssignmentIcon sx={{ marginRight: 1, color: "#4450A5" }} />
              <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
                Current Assignments
              </Typography>
            </Box>

            <AssignmentCard
              subject="Mathematics #4"
              course="Year 3 - 11+ Mathematics"
              progress={65}
              deadline="May 8, 2025"
              due="2 days"
            />

            <AssignmentCard
              subject="English #7"
              course="Year 3 - 11+ English"
              progress={30}
              deadline="May 7, 2025"
              due="tomorrow"
            />



            <Button
              disableElevation
              sx={button}
            >
              View All Assignments
              <Box
                sx={icon}
              >
                <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
              </Box>
            </Button>
          </Box>
        </Grid>

        {/* Recent Announcements Section */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              padding: 2,
              borderRadius: 2,
              border: "1px solid #E0E0E0",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <NotificationsNoneIcon sx={{ marginRight: 1, color: "#4450A5" }} />
              <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
                Recent Announcements
              </Typography>
            </Box>

            <AnnouncementCard
              title="Mock Exam Schedule Updated"
              date="1 day"
              description="The mock exam schedule for next week has been updated. Please check your calendar."
            />

            <AnnouncementCard
              title="New Study Materials Available"
              date="3 days"
              description="New verbal reasoning materials have been added to the resources section."
            />
            <Button
              disableElevation
              sx={button}
            >
              View All Announcements
              <Box
                sx={icon}
              >
                <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
              </Box>
            </Button>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CurrentAssign;
