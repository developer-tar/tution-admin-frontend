import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableHead, TableRow,
    TableCell, TableBody, Button, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, TableContainer,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

const gradientButtonStyle = {
    background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
    color: '#fff',
    fontWeight: 600,
    paddingX: 2,
    paddingY: 0.5,
    borderRadius: 2,
    textTransform: 'none',
    '&:hover': {
        background: 'linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)',
        opacity: 0.9,
    }
};

const TimeSlots = () => {
    const [slots, setSlots] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    // form states
    const [className, setClassName] = useState('');
    const [seats, setSeats] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedWeekDay, setSelectedWeekDay] = useState('');
    const [editId, setEditId] = useState(null);

    // dropdown data
    const [courses, setCourses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [weekDays, setWeekDays] = useState([]);

    // fetch slots
    const fetchSlots = async () => {
        try {
            const res = await api.get('admin/course/timeslot');
            setSlots(res.data?.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch slots");
        }
    };

    // fetch dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, weekRes] = await Promise.all([
                    api.get('admin/ca_records'),
                    api.get('common/data?param=WeekDays')
                ]);
                setCourses(courseRes.data?.data || []);
                setWeekDays(weekRes.data?.data || []);
                fetchSlots();
            } catch (error) {
                toast.error('Failed to fetch dropdown data');
            }
        };
        fetchData();
    }, []);

    // fetch locations based on course
    const fetchLocationsByCourse = async (courseId) => {
        try {
            const res = await api.get(`admin/ca_based_location/${courseId}`);
            setLocations(res.data?.data || []);
        } catch (error) {
            toast.error("Failed to fetch locations for course");
            setLocations([]);
        }
    };

    const resetForm = () => {
        setClassName('');
        setSeats('');
        setStartTime(null);
        setEndTime(null);
        setSelectedCourse('');
        setSelectedLocation('');
        setSelectedWeekDay('');
        setEditId(null);
    };

    const handleAddOrUpdateSlot = async () => {
        if (!className || !seats || !selectedCourse || !selectedLocation || !selectedWeekDay || !startTime || !endTime) {
            toast.error("Please fill all fields");
            return;
        }
        if (startTime >= endTime) {
            toast.error("End time must be after start time");
            return;
        }

        const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const payload = {
            academic_course_id: selectedCourse,
            class_name: className,
            location_id: selectedLocation,
            weekday_id: selectedWeekDay,
            start_time: formatTime(startTime),
            end_time: formatTime(endTime),
            seats: Number(seats)
        };

        if (editId) payload.timeslot_id = editId;

        try {
            let res;
            if (editId) res = await api.patch('admin/timeslot', payload);
            else res = await api.post('admin/timeslot', payload);

            if (res.data?.success) {
                toast.success(res.data?.message || (editId ? "Slot updated!" : "Slot added!"));
                fetchSlots();
                setOpenDialog(false);
                resetForm();
            } else {
                toast.error(res.data?.message || "Failed to save slot");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    // delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            const res = await api.delete(`admin/timeslot/${id}`);
            if (res.data?.success) {
                toast.success(res.data?.message || "Slot deleted!");
                fetchSlots();
            } else {
                toast.error(res.data?.message || "Failed to delete slot");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error deleting slot");
        }
    };

    // edit
    const handleEdit = (slot) => {
        setEditId(slot.timeslot_id || slot.id);
        setClassName(slot.class_name || "");
        setSeats(slot.seats || "");
        setSelectedCourse(slot.academic_course_id || "");
        fetchLocationsByCourse(slot.academic_course_id);
        setSelectedLocation(slot.location_id || "");
        setSelectedWeekDay(slot.weekday_id || "");

        setStartTime(slot.start_time ? new Date(`1970-01-01T${slot.start_time}:00`) : null);
        setEndTime(slot.end_time ? new Date(`1970-01-01T${slot.end_time}:00`) : null);

        setOpenDialog(true);
    };

    return (
        <Box sx={{ px: 2, py: 3, width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Time Slots
                </Typography>
                <Button sx={gradientButtonStyle} onClick={() => setOpenDialog(true)}>
                    + Add Slot
                </Button>
            </Box>

            {/* Slots Table */}
            <Paper sx={{ width: '100%', overflowX: 'auto' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Class Name</strong></TableCell>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell><strong>Location</strong></TableCell>
                                <TableCell><strong>Week Day</strong></TableCell>
                                <TableCell><strong>Start Time</strong></TableCell>
                                <TableCell><strong>End Time</strong></TableCell>
                                <TableCell><strong>Seats</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {slots.length > 0 ? (
                                slots.map((slot) => (
                                    <TableRow key={slot.timeslot_id || slot.id}>
                                        <TableCell>{slot.class_name}</TableCell>
                                        <TableCell>{slot.course_name}</TableCell>
                                        <TableCell>{slot.location_name}</TableCell>
                                        <TableCell>{slot.week_days}</TableCell>
                                        <TableCell>{slot.start_time}</TableCell>
                                        <TableCell>{slot.end_time}</TableCell>
                                        <TableCell>{slot.seats}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(slot)}><EditIcon color="primary" /></IconButton>
                                            <IconButton onClick={() => handleDelete(slot.timeslot_id || slot.id)}><DeleteIcon color="error" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No slots found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add / Update Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => { setOpenDialog(false); resetForm(); }} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{editId ? "Update Slot" : "Add Slot"}</Typography>
                    <IconButton onClick={() => { setOpenDialog(false); resetForm(); }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Class Name"
                            fullWidth
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />

                        <TextField
                            label="Seats"
                            type="number"
                            fullWidth
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Course</InputLabel>
                            <Select
                                value={selectedCourse}
                                onChange={(e) => {
                                    const courseId = e.target.value;
                                    setSelectedCourse(courseId);
                                    fetchLocationsByCourse(courseId);
                                    setSelectedLocation('');
                                }}
                            >
                                {courses.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Location</InputLabel>
                            <Select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                disabled={!selectedCourse}
                            >
                                {locations.map((loc) => (
                                    <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Week Day</InputLabel>
                            <Select value={selectedWeekDay} onChange={(e) => setSelectedWeekDay(e.target.value)}>
                                {weekDays.map((w) => (
                                    <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TimePicker
                                    label="Start Time"
                                    value={startTime}
                                    onChange={(newValue) => setStartTime(newValue)}
                                    views={['hours', 'minutes']}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                                <TimePicker
                                    label="End Time"
                                    value={endTime}
                                    onChange={(newValue) => setEndTime(newValue)}
                                    views={['hours', 'minutes']}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Box>
                        </LocalizationProvider>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button onClick={() => { setOpenDialog(false); resetForm(); }} sx={{ mr: 2 }}>Cancel</Button>
                            <Button sx={gradientButtonStyle} onClick={handleAddOrUpdateSlot}>
                                {editId ? "Update" : "Save"}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TimeSlots;
