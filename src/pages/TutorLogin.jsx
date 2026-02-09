import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { button, icon } from "./style";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const TutorLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    try {
      const payload = new URLSearchParams();
      payload.append("email", data.email);
      payload.append("password", data.password);

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_APP_URL}tutor/login`,
        payload,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (res.data && res.data.success) {
        const { access_token, role, full_name, email } = res.data.data;

        localStorage.setItem("token", access_token);
        localStorage.setItem("role", role.toLowerCase());
        if (full_name != null) localStorage.setItem("tutor_name", full_name);
        if (email != null) localStorage.setItem("tutor_email", email);

        toast.success(res.data.message || "Tutor login successful!");
        navigate("/tutor");
      } else {
        const errMsg = res.data?.data?.error || res.data?.message || "Login failed!";
        toast.error(errMsg);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const errs = error.response.data?.errors;
        if (errs) {
          toast.error(Object.values(errs).flat().join(", ") || "Validation failed");
        } else {
          toast.error(error.response.data?.data?.error || "Validation failed");
        }
      } else if (error.response?.data?.data?.error) {
        toast.error(error.response.data.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Login failed! Please check your credentials.");
      }
    }
  };

  return (
    <>
      <Grid container sx={{ height: "100vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundImage: `url("/assets/images/signup-bg.png")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            py: 9,
          }}
        >
          <img
            src="/assets/images/hero-right-img.png"
            alt="Character"
            style={{ width: "80%", maxWidth: "300px" }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundColor: "#fff",
            py: 6,
            px: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: "100%", maxWidth: 400 }}
          >
            <Box sx={{ mb: 4 }}>
              <img src="/assets/images/logo.svg" alt="Logo" />
            </Box>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              <Box component="span" sx={{ color: "#1565c0" }}>Tutor Login</Box>
            </Typography>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  placeholder="Tutor Email"
                  variant="outlined"
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  variant="outlined"
                  {...field}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{ color: "#666" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button disableElevation sx={button} type="submit">
                Login
                <Box sx={icon}>
                  <ArrowForwardIcon sx={{ fontSize: 20, color: "#1565c0" }} />
                </Box>
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default TutorLogin;
