// pages/TuitionDashboard.jsx
import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import TuitionCard from "./StudentPannel/TuitionCard";

const StatCard = ({ title, value, subtitle }) => {
    return (
        <Box
            sx={{
                padding: 2,
                borderRadius: 2,
                border: "1px solid #E0E0E0",
                backgroundColor: "#fff",
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: 1,
            }}
        >
            <Typography variant="body2" sx={{ color: "#777", fontSize: "14px" }}>
                {title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#000" }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" sx={{ color: "#888", fontSize: "12px" }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};
// Sample Data (replace with API or dynamic content if needed)
const courses = [
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 80,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 60,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 45,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 90,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 20,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 100,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 80,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 60,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 45,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 90,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 20,
    },
    {
        image: "/assets/images/studend-img.png",
        title: "Year 3 11+ Tuition",
        description:
            "Lays the foundation for the Year 4 course. 1 hour and 45 minutes of tuition including core literacy and numeracy skills.",
        progress: 100,
    },
];

const StudentPannel = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography
                variant="h5"
                fontWeight="bold"
                textAlign={{ xs: "center", md: "left" }}
                gutterBottom
            >
                Welcome back, Student
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
                textAlign={{ xs: "center", md: "left" }}
            >
                Track your progress and continue your learning journey.
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Weekly Progress" value="68%" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Topics Completed" value="7/14" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Study Time This Week" value="10.5 hrs" subtitle="+2.5 hrs from last week" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Upcoming Tests" value="2" subtitle="Next: 15 May 2025" />
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentPannel;
