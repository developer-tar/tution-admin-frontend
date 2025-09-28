import { Grid, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import CommonLoader from "./CommonLoader";

const InputField = ({ control, name, label, type = "text", error, loading }) => (
  <Grid item xs={12} md={6}>
    {loading ? (
      <CommonLoader />
    ) : (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            label={label}
            type={type}
            variant="outlined"
            {...field}
            error={!!error}
            helperText={error?.message}
          />
        )}
      />
    )}
  </Grid>
);

export default InputField;
