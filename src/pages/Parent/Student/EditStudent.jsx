import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../api";
import useCommonDropdowns from "../../../hooks/useCommonDropdowns";
import DropdownField from "../../../components/DropdownField";
import InputField from "../../../components/InputField";
import TextareaField from "../../../components/TextareaField";
import BooleanSelectField from "../../../components/BooleanSelectField";
import SubmitButton from "../../../components/SubmitButton";

const dropdownParams = [
  "Genders",
  "Months",
  "Years",
  "Days",
  "Regions",
  "TargetSchools",
];

const EditStudent = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  const { dropdowns, loading: dropdownLoading } = useCommonDropdowns(
    dropdownParams
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      year_id: "",
      month_id: "",
      day_id: "",
      region_id: "",
      gender_id: "",
      target_school_id: "",
      display_name: "",
      show_answer_after_n_attempts: 1,
      allow_view_examiner_report_for_mocks: false,
      can_change_password: false,
      bio: "",
    },
  });

  // Fetch student data for editing
  const fetchStudentData = async () => {
    setFetchingData(true);
    try {
      const response = await api.get(`parent/student/${studentId}/edit`);
      
      if (response.data.success) {
        const studentData = response.data.data;
        
        // Set form values with fetched data
        setValue("first_name", studentData.student?.first_name || "");
        setValue("last_name", studentData.student?.last_name || "");
        setValue("email", studentData.student?.email || "");
        setValue("year_id", studentData.year_id || "");
        setValue("month_id", studentData.month_id || "");
        setValue("day_id", studentData.day_id || "");
        setValue("region_id", studentData.region_id || "");
        setValue("gender_id", studentData.gender_id || "");
        setValue("target_school_id", studentData.target_school_id || "");
        setValue("display_name", studentData.display_name || "");
        setValue("show_answer_after_n_attempts", studentData.show_answer_after_n_attempts || 1);
        setValue("allow_view_examiner_report_for_mocks", studentData.allow_view_examiner_report_for_mocks || false);
        setValue("can_change_password", studentData.can_change_password || false);
        setValue("bio", studentData.bio || "");
        
        toast.success("Student data loaded successfully!");
      } else {
        throw new Error(response.data.message || "Failed to fetch student data");
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        window.location.href = '/login';
        return;
      }
      
      if (err.response?.status === 404) {
        toast.error("Student not found.");
        navigate("/parent/my-student-list");
        return;
      }
      
      const errorMessage = err.message || err.response?.data?.message || "Failed to fetch student data";
      toast.error(errorMessage);
      navigate("/parent/my-student-list");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`parent/student/${studentId}`, data);
      toast.success("Student updated successfully!");
      navigate("/parent/my-student-list");
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
        const message = err.response?.data?.message || "Something went wrong";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Box p={3}>
        <Typography variant="h5" mb={2}>
          Loading Student Data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Edit Student
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <InputField
            control={control}
            name="first_name"
            label="First Name"
            error={errors.first_name}
            loading={dropdownLoading}
            required={true}
          />
          <InputField
            control={control}
            name="last_name"
            label="Last Name"
            error={errors.last_name}
            loading={dropdownLoading}
            required={true}
          />
          <InputField
            control={control}
            name="email"
            label="Email"
            type="email"
            error={errors.email}
            loading={dropdownLoading}
            required={true}
          />
          <InputField
            control={control}
            name="display_name"
            label="Display Name"
            error={errors.display_name}
            loading={dropdownLoading}
            required={true}
          />

          <DropdownField
            control={control}
            name="year_id"
            label="Year"
            options={dropdowns.Years || []}
            error={errors.year_id}
            loading={dropdownLoading}
            required={true}
          />
          <DropdownField
            control={control}
            name="month_id"
            label="Month"
            options={dropdowns.Months || []}
            error={errors.month_id}
            loading={dropdownLoading}
            required={true}
          />
          <DropdownField
            control={control}
            name="day_id"
            label="Day"
            options={dropdowns.Days || []}
            error={errors.day_id}
            loading={dropdownLoading}
            required={true}
          />
          <DropdownField
            control={control}
            name="gender_id"
            label="Gender"
            options={dropdowns.Genders || []}
            error={errors.gender_id}
            loading={dropdownLoading}
            required={true}
          />
          <DropdownField
            control={control}
            name="region_id"
            label="Region"
            options={dropdowns.Regions || []}
            error={errors.region_id}
            loading={dropdownLoading}
            required={true}
          />
          <DropdownField
            control={control}
            name="target_school_id"
            label="Target School"
            options={dropdowns.TargetSchools || []}
            error={errors.target_school_id}
            loading={dropdownLoading}
            required={true}
          />

          <InputField
            control={control}
            name="show_answer_after_n_attempts"
            label="Show Answer After N Attempts"
            type="number"
            error={errors.show_answer_after_n_attempts}
            loading={dropdownLoading}
          />

          <BooleanSelectField
            control={control}
            name="allow_view_examiner_report_for_mocks"
            label="Allow View Examiner Report For Mocks"
            error={errors.allow_view_examiner_report_for_mocks}
            loading={dropdownLoading}
          />

          <BooleanSelectField
            control={control}
            name="can_change_password"
            label="Can Change Password"
            error={errors.can_change_password}
            loading={dropdownLoading}
          />

          <TextareaField
            control={control}
            name="bio"
            label="Bio"
            error={errors.bio}
            loading={dropdownLoading}
          />

          <SubmitButton
            loading={loading}
            label="Update Student"
          />

        </Grid>
      </form>
    </Box>
  );
};

export default EditStudent;
