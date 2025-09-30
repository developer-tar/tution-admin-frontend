<<<<<<< HEAD
import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { button, icon } from "./style";

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const AdminLogin = () => {
  const navigate = useNavigate();

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

  const onSubmit = async (data) => {
    try {
      const payload = new URLSearchParams();
      payload.append("email", data.email);
      payload.append("password", data.password);

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_APP_URL}admin/login`, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, role } = res.data.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Login failed!";
      toast.error(errMsg);
    }
  };

  return (
    <>
      <Grid container sx={{ height: "100vh" }}>
        {/* Left Side Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundImage: `url("/assets/images/signup-bg.png")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            // minHeight: { xs: 200, md: "auto" },

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            py: 9
          }}
        >
          <img
            src="/assets/images/hero-right-img.png"
            alt="Character"
            style={{ width: "80%", maxWidth: "300px" }}
          />
        </Grid>

        {/* Right Side Form */}
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
              <Box component="span" sx={{ color: "#D6232A" }}>Admin Login</Box>
            </Typography>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  placeholder="Admin Email"
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
                  type="password"
                  placeholder="Password"
                  variant="outlined"
                  {...field}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-start", }}>
              <Button
                disableElevation
                sx={button}
                type="submit"
              >
                Login
                <Box
                  sx={icon}
                >
                  <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
                </Box>
              </Button></Box>
          </Box>
        </Grid>
      </Grid>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default AdminLogin;
=======
import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom";
import { button, icon } from "./style";

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const AdminLogin = () => {
  const navigate = useNavigate();

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

  const onSubmit = async (data) => {
    try {
      const payload = new URLSearchParams();
      payload.append("email", data.email);
      payload.append("password", data.password);

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_APP_URL}admin/login`, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, role } = res.data.data;

      localStorage.setItem("admin-token", access_token);
      localStorage.setItem("admin-role", role);

      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Login failed!";
      toast.error(errMsg);
    }
  };

  return (
    <>
      <Grid container sx={{ height: "100vh" }}>
        {/* Left Side Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundImage: `url("/assets/images/signup-bg.png")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            // minHeight: { xs: 200, md: "auto" },

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            py: 9
          }}
        >
          <img
            src="/assets/images/hero-right-img.png"
            alt="Character"
            style={{ width: "80%", maxWidth: "300px" }}
          />
        </Grid>

        {/* Right Side Form */}
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
              <Box component="span" sx={{ color: "#D6232A" }}>Admin Login</Box>
            </Typography>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  placeholder="Admin Email"
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
                  type="password"
                  placeholder="Password"
                  variant="outlined"
                  {...field}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-start", }}>
              <Button
                disableElevation
                sx={button}
                type="submit"
              >
                Login
                <Box
                  sx={icon}
                >
                  <ArrowForwardIcon sx={{ fontSize: 20, color: '#EF2A1E' }} />
                </Box>
              </Button></Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default AdminLogin;
>>>>>>> master
