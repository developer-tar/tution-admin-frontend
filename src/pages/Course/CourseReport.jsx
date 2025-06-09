import { Box, Typography, Grid, TextField, Button, MenuItem, Paper } from "@mui/material";
import { button, h2, icon } from "../style";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const CourseReport = () => {
    return (
        <Box p={3}>
            <Typography variant="h5" mb={3} fontWeight={700}>
                    Course Report
                  </Typography>

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField select fullWidth label="Academic Year">
                        <MenuItem value="2024/2025">2024/2025</MenuItem>
                        <MenuItem value="2023/2024">2023/2024</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField fullWidth label="Course Name" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField fullWidth label="Subject" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField fullWidth label="Assignment" />
                </Grid>
            </Grid>

            {/* Report Summary */}
            <Grid container spacing={2}>
                {[
                    { title: "Total Enrolled", value: 125 },
                    { title: "Completion Rate", value: "82%" },
                    { title: "Avg Test Score", value: "74%" },
                    { title: "Assignment Submitted", value: "89%" },
                ].map((metric, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">{metric.title}</Typography>
                            <Typography variant="h4">{metric.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Export Option */}
            <Box mt={4} display="flex" justifyContent="flex-end">
                <Button
                    disableElevation
                    sx={button}
                >
                    Export as PDF
                    <Box
                        sx={icon}
                    >
                        <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
                    </Box>
                </Button>
            </Box>
        </Box>
    );
};

export default CourseReport;
