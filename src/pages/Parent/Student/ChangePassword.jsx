import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import api from "../../../api";
import DropdownField from "../../../components/DropdownField";
import InputField from "../../../components/InputField";
import SubmitButton from "../../../components/SubmitButton";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [studentEmails, setStudentEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email_id: "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Fetch student emails on component mount
  const fetchStudentEmails = async () => {
    setEmailsLoading(true);
    try {
      const response = await api.get("parent/student-emails");
      
      if (response.data.success) {
        // Transform data to match dropdown format
        const emailOptions = response.data.data.map(student => ({
          id: student.email,
          name: student.email
        }));
        setStudentEmails(emailOptions);
      } else {
        throw new Error(response.data.message || "Failed to fetch student emails");
      }
    } catch (err) {
      console.error("Error fetching student emails:", err);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch student emails";
      toast.error(errorMessage);
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentEmails();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post("parent/student/reset-password", data);
      
      if (response.data.success) {
        toast.success(response.data.message || "Student password reset successfully!");
        reset();
        // Redirect to student list after successful password change
        navigate("/parent/my-student-list");
      } else {
        throw new Error(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      
      // Handle different error responses
      if (!err.response) {
        toast.error('Network error. Please check your internet connection.');
        return;
      }

      const { status, data } = err.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          break;

        case 422:
          // Validation Error - show field-specific errors
          const backendErrors = data.errors;
          if (backendErrors) {
            Object.entries(backendErrors).forEach(([field, messages]) => {
              setError(field, {
                type: "server",
                message: Array.isArray(messages) ? messages[0] : messages,
              });
            });
            toast.error(data.message || "Please check the form for errors.");
          } else {
            toast.error(data.message || "Validation error occurred.");
          }
          break;

        case 500:
          // Server Error
          toast.error(data.message || 'Server error occurred. Please try again later.');
          break;

        default:
          toast.error(data.message || 'An error occurred while resetting password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Reset Student Password
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <DropdownField
            control={control}
            name="email_id"
            label="Select Student Email"
            options={studentEmails}
            error={errors.email_id}
            loading={emailsLoading}
            required={true}
          />

          <InputField
            control={control}
            name="current_password"
            label="Current Password"
            type="password"
            error={errors.current_password}
            loading={emailsLoading}
            required={true}
          />

          <InputField
            control={control}
            name="new_password"
            label="New Password"
            type="password"
            error={errors.new_password}
            loading={emailsLoading}
            required={true}
          />

          <InputField
            control={control}
            name="confirm_password"
            label="Confirm New Password"
            type="password"
            error={errors.confirm_password}
            loading={emailsLoading}
            required={true}
          />

          <SubmitButton
            loading={loading}
            label="Reset Password"
          />

        </Grid>
      </form>
    </Box>
  );
};

export default ChangePassword;
