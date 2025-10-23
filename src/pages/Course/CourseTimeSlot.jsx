import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableHead, TableRow,
    TableCell, TableBody, Button, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, TableContainer,
    MenuItem, Select, FormControl, InputLabel, Card, CardContent, Chip
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { toast } from 'react-toastify';
import api from '../../api';


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
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 3 
        }}>
            {/* Compact Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                {/* Left Side - Title & Description */}
                <Box sx={{ textAlign: 'left', flex: 1, mr: 3 }}>
                    <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        mb: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '25px',
                        px: 3,
                        py: 1,
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                    }}>
                        <AccessTimeIcon sx={{ fontSize: 24, color: 'white' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                            Time Slots
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#5a6c7d', fontSize: '13px', maxWidth: 350 }}>
                        Manage course time slots with locations, schedules and seat capacity
                    </Typography>
                </Box>

                {/* Right Side - Button */}
                <Button
                    onClick={() => setOpenDialog(true)}
                    sx={{
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
                    }}
                >
                    + Add Slot
                </Button>
            </Box>

            {/* Slots Cards */}
            <Card sx={{ 
                maxWidth: 1200, 
                mx: 'auto',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)'
            }}>
                <CardContent sx={{ p: 0 }}>
                    {slots.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Class</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Course</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Location</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Day</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Time</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Seats</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {slots.map((slot) => (
                                        <TableRow key={slot.timeslot_id || slot.id} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' } }}>
                                            <TableCell sx={{ fontWeight: 500 }}>{slot.class_name}</TableCell>
                                            <TableCell>{slot.course_name}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationOnIcon fontSize="small" color="action" />
                                                    {slot.location_name}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={slot.week_days} size="small" sx={{ background: 'linear-gradient(45deg, #4caf50, #2e7d32)', color: 'white', fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTimeIcon fontSize="small" color="action" />
                                                    {slot.start_time} - {slot.end_time}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <EventSeatIcon fontSize="small" color="action" />
                                                    <Chip label={`${slot.seats} seats`} size="small" sx={{ background: 'linear-gradient(45deg, #ff9800, #f57c00)', color: 'white', fontWeight: 600 }} />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit(slot)} sx={{ color: '#667eea', '&:hover': { background: 'rgba(102, 126, 234, 0.1)' } }}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(slot.timeslot_id || slot.id)} sx={{ color: '#f44336', '&:hover': { background: 'rgba(244, 67, 54, 0.1)' } }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <AccessTimeIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>No Time Slots Found</Typography>
                            <Typography variant="body2" sx={{ color: '#999' }}>Create your first time slot to get started</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Add / Update Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => { setOpenDialog(false); resetForm(); }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)',
                        boxShadow: '0 24px 48px rgba(102, 126, 234, 0.2)',
                        overflow: 'visible'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    textAlign: 'center',
                    py: 3
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <AccessTimeIcon sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {editId ? "Update Time Slot" : "Create New Time Slot"}
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={() => { setOpenDialog(false); resetForm(); }}
                        sx={{ 
                            position: 'absolute', 
                            right: 16, 
                            top: 16, 
                            color: 'white',
                            '&:hover': { background: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 1 }}>
                        {/* Class Name & Seats */}
                        <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#667eea', fontWeight: 600 }}>
                                📚 Class Details
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Class Name"
                                    fullWidth
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': { borderColor: '#667eea' },
                                            '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                                        }
                                    }}
                                />
                                <TextField
                                    label="Available Seats"
                                    type="number"
                                    fullWidth
                                    value={seats}
                                    onChange={(e) => setSeats(e.target.value)}
                                    InputProps={{
                                        startAdornment: <EventSeatIcon sx={{ mr: 1, color: '#ff9800' }} />
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': { borderColor: '#ff9800' },
                                            '&.Mui-focused fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                                        }
                                    }}
                                />
                            </Box>
                        </Paper>

                        {/* Course & Location */}
                        <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255, 152, 0, 0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#ff9800', fontWeight: 600 }}>
                                🎓 Course & Location
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl fullWidth>
                                    <Select
                                        value={selectedCourse}
                                        displayEmpty
                                        onChange={(e) => {
                                            const courseId = e.target.value;
                                            setSelectedCourse(courseId);
                                            fetchLocationsByCourse(courseId);
                                            setSelectedLocation('');
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea', borderWidth: 2 }
                                        }}
                                    >
                                        <MenuItem value="" disabled>Select Course</MenuItem>
                                        {courses.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <Select
                                        value={selectedLocation}
                                        displayEmpty
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        disabled={!selectedCourse}
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff9800', borderWidth: 2 }
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOnIcon fontSize="small" />
                                                Select Location
                                            </Box>
                                        </MenuItem>
                                        {locations.map((loc) => (
                                            <MenuItem key={loc.id} value={loc.id}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationOnIcon fontSize="small" />
                                                    {loc.name}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>

                        {/* Schedule */}
                        <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(76, 175, 80, 0.1)', gridColumn: { xs: '1', md: '1 / -1' } }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#4caf50', fontWeight: 600 }}>
                                📅 Schedule & Timing
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
                                <FormControl fullWidth>
                                    <Select 
                                        value={selectedWeekDay} 
                                        displayEmpty
                                        onChange={(e) => setSelectedWeekDay(e.target.value)}
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4caf50', borderWidth: 2 }
                                        }}
                                    >
                                        <MenuItem value="" disabled>Select Week Day</MenuItem>
                                        {weekDays.map((w) => (
                                            <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        label="Start Time"
                                        value={startTime}
                                        onChange={(newValue) => setStartTime(newValue)}
                                        views={['hours', 'minutes']}
                                        renderInput={(params) => 
                                            <TextField 
                                                {...params} 
                                                fullWidth 
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover fieldset': { borderColor: '#4caf50' },
                                                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 }
                                                    }
                                                }}
                                            />
                                        }
                                    />
                                    <TimePicker
                                        label="End Time"
                                        value={endTime}
                                        onChange={(newValue) => setEndTime(newValue)}
                                        views={['hours', 'minutes']}
                                        renderInput={(params) => 
                                            <TextField 
                                                {...params} 
                                                fullWidth 
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover fieldset': { borderColor: '#4caf50' },
                                                        '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 }
                                                    }
                                                }}
                                            />
                                        }
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4 }}>
                        <Button 
                            onClick={() => { setOpenDialog(false); resetForm(); }}
                            size="large"
                            sx={{ 
                                px: 4, 
                                py: 1.5, 
                                borderRadius: 3,
                                border: '2px solid #ccc',
                                color: '#666',
                                fontWeight: 600,
                                '&:hover': {
                                    border: '2px solid #999',
                                    background: 'rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddOrUpdateSlot}
                            size="large"
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8, #6a42a0)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                            startIcon={<AccessTimeIcon />}
                        >
                            {editId ? "Update Time Slot" : "Create Time Slot"}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TimeSlots;