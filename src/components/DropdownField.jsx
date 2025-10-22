import { Controller } from "react-hook-form";
import { TextField, MenuItem, Grid } from "@mui/material";
import CommonLoader from "./CommonLoader";

const DropdownField = ({
  control,
  name,
  label,
  options = [],
  error,
  loading,
  onChange = () => {}, // default fallback
  required = false,
}) => {
  return (
    <Grid item xs={12} md={6}>
      {loading ? (
        <CommonLoader />
      ) : (
        <Controller
          name={name}
          control={control}
          defaultValue="" // 👈 ensure default value is defined
          render={({ field }) => (
            <TextField
              select
              fullWidth
              label={required ? `${label} *` : label}
              {...field}
              value={field.value ?? ""} // 👈 force controlled value
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value);
                onChange(value);
              }}
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
              {options.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
    </Grid>
  );
};

export default DropdownField;
