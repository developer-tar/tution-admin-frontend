import { Grid, MenuItem, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import CommonLoader from "./CommonLoader";

const BooleanSelectField = ({ control, name, label, error, loading, required = false }) => (
    <Grid item xs={12} md={6}>
        {loading ? (
            <CommonLoader />
        ) : (
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <TextField
                        select
                        fullWidth
                        label={required ? `${label} *` : label}
                        value={field.value ? 1 : 0}
                        onChange={(e) => field.onChange(!!Number(e.target.value))}
                        error={!!error}
                        helperText={error?.message}
                        sx={{
                          '& .MuiInputLabel-root': {
                            '& .MuiInputLabel-asterisk': {
                              color: 'red',
                            },
                          },
                        }}
                    >
                        <MenuItem value={1}>Yes</MenuItem>
                        <MenuItem value={0}>No</MenuItem>
                    </TextField>
                )}
            />)}
    </Grid>
);

export default BooleanSelectField;
