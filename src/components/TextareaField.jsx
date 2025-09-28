import { Controller } from "react-hook-form";
import { TextField, Grid } from "@mui/material";
import CommonLoader from "./CommonLoader";

const TextareaField = ({ control, name, label, rows = 3, error, loading }) => (
  <Grid item xs={12}>
    {loading ? (
      <CommonLoader />
    ) : (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            multiline
            rows={rows}
            label={label}
            {...field}
            error={!!error}
            helperText={error?.message}
          />
        )}
      />
    )}
  </Grid>
);

export default TextareaField;
