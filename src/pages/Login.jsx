import { yupResolver } from "@hookform/resolvers/yup";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import api from "../api";
import { button, icon } from "./style";
import CommonLoader from "../components/CommonLoader";

const SkeletonWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  flexWrap: 'nowrap',
  alignItems: 'center',
}));


// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  role: yup.number().typeError("Role is required").required("Role is required").integer("Role must be a number"),
});

const Login = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

 const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      role: ""
    },
  });
  
  useEffect(() => {

    const fetchRoles = async () => {
      try {
        const res = await api.get('common/data?param=Roles')
        // Exclude Tutor – tutors must use /tutor-login (tutor panel only)
        const allRoles = res.data.data || [];
        const nonTutorRoles = allRoles.filter(
          (r) => String(r.name || "").toLowerCase() !== "tutor"
        );
        setRoles(nonTutorRoles);

        if (nonTutorRoles.length > 0) {
          reset({ role: nonTutorRoles[0].id });
        }

      } catch (err) {
        toast.error("Failed to fetch roles")
      }
      finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [reset]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {

    const formData = new FormData();

    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("choose_the_role", data.role)

    try {
      setLoginLoading(true);
      const res = await api.post('login', formData);

      const { access_token, role } = res.data.data;
      const roleModify = role.toLowerCase();
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", roleModify);
      localStorage.setItem('userData', JSON.stringify(res.data.data));

      toast.success(` ${roleModify} login successful!`);
      navigate(`/${roleModify}/`);

    } catch (error) {
      const errMsg = error.response?.data?.message || "Login failed!";
      toast.error(errMsg);
    } finally {
      setLoginLoading(false);
    }

  };

  return (
    <>
      <Grid container sx={{ height: "100vh" }}>

        {/* Left Section */}
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

        {/* Right - Form */}
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
            sx={{ width: "100%", maxWidth: 400 }}
          >
            {/* Logo */}
            <Box sx={{ mb: 4 }}>
              <img src="/assets/images/logo.svg" alt="Logo" />
            </Box>

            {/* Heading */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              <Box component="span" sx={{ color: "#D6232A" }}>Login</Box>
            </Typography>
            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" error={!!errors.role}>
                  {loading ? (
                    <CommonLoader width={100} height={30} />
                  ) : (
                    <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                      Select Your Role
                    </FormLabel>
                  )}
                  {loading ? (
                    <SkeletonWrapper>
                      {[...Array(3)].map(() => (
                        <CommonLoader height={30} width={100}/>
                      ))}
                    </SkeletonWrapper>
                  ) : (
                    <RadioGroup row {...field}>
                      {roles.map((role) => (
                        <FormControlLabel
                          key={role.id}
                          value={role.id}
                          control={<Radio />}
                          label={`I am ${role.name}`}
                        />
                      ))}
                    </RadioGroup>
                  )}
                  {errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            {/* Email */}
            {loading ? (
              <CommonLoader height={40} />
            ) : (
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
                    sx={{ mb: 2 }}
                  />
                )}
              />
            )}
            {/* Password */}
            {loading ? (
              <CommonLoader height={40} />
            ) : (
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
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
              <Button
                disableElevation
                sx={{
                  ...button,
                  backgroundColor: "#EF2A1E",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#EF2A1E",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#EF2A1E",
                    color: "#fff",
                    opacity: 0.7,
                  },
                }}
                onClick={handleSubmit(onSubmit)}
                disabled={loginLoading || loading}
              >
                {loginLoading ? "Logging in..." : "Login"}
                {!(loginLoading || loading) && (
                  <Box sx={icon}>
                    <ArrowForwardIcon sx={{ fontSize: 20, color: "#EF2A1E" }} />
                  </Box>
                )}
              </Button>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Are you a tutor?{" "}
                <Link to="/tutor-login" style={{ color: "#1565c0", fontWeight: 600 }}>Log in to the tutor panel</Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Login;
