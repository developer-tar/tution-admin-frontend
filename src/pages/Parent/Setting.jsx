import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify"

import api from "../../api";
import InputField from "../../components/InputField";
import SubmitButton from "../../components/SubmitButton";

const Setting = () => {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  // Submit name changes
  const onUpdateProfile = async (data) => {
    setLoadingProfile(true);
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
      };
      await api.post("/update-profile", payload);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Submit password change
  const onChangePassword = async (data) => {
    setLoadingPassword(true);
    try {
      const payload = {
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirmation: data.new_password_confirmation,
      };
      await api.post("/change-password", payload);
      toast.success("Password changed successfully!");
      reset({
        ...data,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors) {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Settings
      </Typography>

      {/* Update Profile Section */}
      <form onSubmit={handleSubmit(onUpdateProfile)}>
        <Typography variant="subtitle1" mb={1}>
          Update Profile
        </Typography>
        <Grid container spacing={2}>
          <InputField
            control={control}
            name="first_name"
            label="First Name"
            error={errors.first_name}
          />
          <InputField
            control={control}
            name="last_name"
            label="Last Name"
            error={errors.last_name}
          />
          <SubmitButton loading={loadingProfile} label="Update Profile" />
        </Grid>
      </form>

      <Divider sx={{ my: 4 }} />

      {/* Change Password Section */}
      <form onSubmit={handleSubmit(onChangePassword)}>
        <Typography variant="subtitle1" mb={1}>
          Change Password
        </Typography>
        <Grid container spacing={2}>
          <InputField
            control={control}
            name="current_password"
            label="Current Password"
            type="password"
            error={errors.current_password}
          />
          <InputField
            control={control}
            name="new_password"
            label="New Password"
            type="password"
            error={errors.new_password}
          />
          <InputField
            control={control}
            name="new_password_confirmation"
            label="Confirm New Password"
            type="password"
            error={errors.new_password_confirmation}
          />
          <SubmitButton loading={loadingPassword} label="Change Password" />
        </Grid>
      </form>

    </Box>
  );
};

export default Setting;
