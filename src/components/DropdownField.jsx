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
}) => {
  return (
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
              label={label}
              {...field}
              error={!!error}
              helperText={error?.message}
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
