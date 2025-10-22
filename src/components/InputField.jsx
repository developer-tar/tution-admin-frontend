import { Grid, TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { useState } from "react";
import CommonLoader from "./CommonLoader";

const InputField = ({ control, name, label, type = "text", error, loading, required = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
              fullWidth
              label={required ? `${label} *` : label}
              type={isPasswordField ? (showPassword ? "text" : "password") : type}
              variant="outlined"
              {...field}
              error={!!error}
              helperText={error?.message}
              sx={{
                '& .MuiInputLabel-root': {
                  '& .MuiInputLabel-asterisk': {
                    color: 'red',
                  },
                },
              }}
              InputProps={isPasswordField ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              } : undefined}
            />
          )}
        />
      )}
    </Grid>
  );
};

export default InputField;
