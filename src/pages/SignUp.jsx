import { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../api";
import { toast } from "react-toastify"
import { button, icon } from "./style";
import { styled } from '@mui/material/styles';
import CommonLoader from "../components/CommonLoader";

const SkeletonWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  flexWrap: 'nowrap',
  alignItems: 'center',
}));

// Yup validation schema
const schema = yup.object().shape({
  role: yup.string().required("Please select a role"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});



export default function SignUp() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
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

  useEffect(() => {

    const fetchRoles = async () => {
      try {
        const res = await api.get('common/data?param=Roles')

        const filteredRoles = (res.data.data || []).filter(role => role.name !== 'Student');
        setRoles(filteredRoles);
        if (filteredRoles.length > 0) {
          reset({ role: filteredRoles[0].id });
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



  const onSubmit = async (data) => {
    try {
      setSignUpLoading(true);
      const formData = new FormData();

      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("first_name", data.firstName);
      formData.append("last_name", data.lastName);
      formData.append("choose_the_role", data.role);

      await api.post('register', formData);
      toast.success("Signup successful!", { position: "top-right" });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Signup failed! Please try again.";
      toast.error(errMsg, { position: "top-right" });
      console.error("Signup error:", error.response?.data || error.message);
    }
    finally {
      setSignUpLoading(false);
    }

  };

  return (
    <>
      <Box sx={{ height: "100vh", bgcolor: "#f9f9f9" }}>

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
                    {loading ? (
                      <CommonLoader width={100} height={30} />
                    ) : (
                      <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                        Select Your Role
                      </FormLabel>
                    )}
                    {loading ? (
                      <SkeletonWrapper>
                        {[...Array(2)].map(() => (
                          <CommonLoader height={30} />
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

              {loading ? (
                <CommonLoader height={40} />
              ) : (
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
              )}

              {loading ? (
                <CommonLoader height={40} />
              ) : (
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
              )}

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
                    />
                  )}
                />
              )}

              {loading ? (
                <CommonLoader height={40} />
              ) : (
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
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-start", }}>
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
                      opacity: 0.7, // optional to show it's disabled
                    },
                  }}
                  onClick={handleSubmit(onSubmit)}
                  disabled={signUpLoading || loading}
                >
                  {signUpLoading ? "Signing up..." : "Sign Up"}
                  {!(signUpLoading || loading) && (
                    <Box sx={icon}>
                      <ArrowForwardIcon sx={{ fontSize: 20, color: "#EF2A1E" }} />
                    </Box>
                  )}
                </Button>

              </Box>

            </Box>
          </Grid>
        </Grid>

      </Box>

    </>
  );
}
