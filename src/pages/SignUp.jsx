import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { button, icon } from "./style";

// Yup validation schema
const schema = yup.object().shape({
  role: yup.string().required("Please select a role"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

// Map roles to backend expected values
const roleMap = {
  parent: "3",
  tutor: "4",
};

export default function SignUp() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = new URLSearchParams();
      payload.append("email", data.email);
      payload.append("password", data.password);
      payload.append("first_name", data.firstName);
      payload.append("last_name", data.lastName);
      payload.append("choose_the_role", roleMap[data.role]);

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_APP_URL}register`, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      toast.success("Signup successful!", { position: "top-right" });
      console.log("Success:", res.data);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Signup failed! Please try again.";
      toast.error(errMsg, { position: "top-right" });
      console.error("Signup error:", error.response?.data || error.message);
    }
  };

  return (
    <>
      <Box sx={{ height: "100vh", bgcolor: "#f9f9f9" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
         <Grid container sx={{ height: "100vh" }}>
            {/* Left */}
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

            {/* Right */}
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
              {/* Logo */}
              <Box sx={{ mb: 4 }}>
                <img src="/assets/images/logo.svg" alt="Logo" />
              </Box>

              {/* Title */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                <Box component="span" sx={{ color: "#D6232A" }}>
                  Getting Started
                </Box>
              </Typography>

              {/* Form Fields */}
              <Box sx={{ display: "grid", gap: 2 }}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset" error={!!errors.role}>
                      <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                        Select Your Role
                      </FormLabel>
                      <RadioGroup row {...field}>
                        <FormControlLabel value="parent" control={<Radio />} label="I am a Parent" />
                        <FormControlLabel value="tutor" control={<Radio />} label="I am a Tutor" />
                      </RadioGroup>
                      {errors.role && (
                        <Typography variant="caption" color="error">
                          {errors.role.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      placeholder="First Name"
                      variant="outlined"
                      {...field}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      placeholder="Last Name"
                      variant="outlined"
                      {...field}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      placeholder="Email"
                      variant="outlined"
                      {...field}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="password"
                      placeholder="Password"
                      variant="outlined"
                      {...field}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Button type="submit" disableElevation sx={button}>
                    Sign Up
                    <Box sx={icon}>
                      <ArrowForwardIcon sx={{ fontSize: 20, color: "#EF2A1E" }} />
                    </Box>
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Toast Message Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
