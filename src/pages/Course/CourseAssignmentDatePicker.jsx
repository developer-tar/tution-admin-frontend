import * as React from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';

export default function CourseAssignmentDatePicker() {
    const [value, setValue] = React.useState(null);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label="Start Date"
                value={value}
                onChange={(newValue) => setValue(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
            />
        </LocalizationProvider>
    );
}
