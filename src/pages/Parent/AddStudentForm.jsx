import  { useState } from "react";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api from "../../api";
import useCommonDropdowns from "../../hooks/useCommonDropdowns";
import DropdownField from "../../components/DropdownField";
import InputField from "../../components/InputField";
import TextareaField from "../../components/TextareaField";
import BooleanSelectField from "../../components/BooleanSelectField";
import SubmitButton from "../../components/SubmitButton";

const dropdownParams = [
  "Genders",
  "Months",
  "Years",
  "Days",
  "Regions",
  "TargetSchools",
];

const schema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().required().email("Invalid email"),
  password: yup.string().required().min(8).max(10),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required(),
  year_id: yup.number().required(),
  month_id: yup.number().required(),
  day_id: yup.number().required(),
  region_id: yup.number().required(),
  gender_id: yup.number().required(),
  target_school_id: yup.number().required(),
  display_name: yup.string().required().max(100),
  show_answer_after_n_attempts: yup
    .number()
    .nullable()
    .min(1)
    .max(4)
    .typeError("Must be number between 1 and 4"),
  allow_view_examiner_report_for_mocks: yup.boolean().nullable(),
  can_change_password: yup.boolean().nullable(),
  bio: yup.string().nullable(),
});

const AddStudentForm = () => {
  const [loading, setLoading] = useState(false);
  const { dropdowns, loading: dropdownLoading } = useCommonDropdowns(
    dropdownParams
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirmation: "",
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("parent/add/student", data);
      toast.success("Student created successfully!");
      reset();
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Add New Student
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <InputField
            control={control}
            name="first_name"
            label="First Name"
            error={errors.first_name}
            loading={dropdownLoading}
          />
          <InputField
            control={control}
            name="last_name"
            label="Last Name"
            error={errors.last_name}
            loading={dropdownLoading}
          />
          <InputField
            control={control}
            name="email"
            label="Email"
            type="email"
            error={errors.email}
            loading={dropdownLoading}
          />
          <InputField
            control={control}
            name="password"
            label="Password"
            type="password"
            error={errors.password}
            loading={dropdownLoading}
          />
          <InputField
            control={control}
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            error={errors.password_confirmation}
            loading={dropdownLoading}
          />
          <InputField
            control={control}
            name="display_name"
            label="Display Name"
            error={errors.display_name}
            loading={dropdownLoading}
          />

          <DropdownField
            control={control}
            name="year_id"
            label="Year"
            options={dropdowns.Years || []}
            error={errors.year_id}
            loading={dropdownLoading}
          />
          <DropdownField
            control={control}
            name="month_id"
            label="Month"
            options={dropdowns.Months || []}
            error={errors.month_id}
            loading={dropdownLoading}
          />
          <DropdownField
            control={control}
            name="day_id"
            label="Day"
            options={dropdowns.Days || []}
            error={errors.day_id}
            loading={dropdownLoading}
          />
          <DropdownField
            control={control}
            name="gender_id"
            label="Gender"
            options={dropdowns.Genders || []}
            error={errors.gender_id}
            loading={dropdownLoading}
          />
          <DropdownField
            control={control}
            name="region_id"
            label="Region"
            options={dropdowns.Regions || []}
            error={errors.region_id}
            loading={dropdownLoading}
          />
          <DropdownField
            control={control}
            name="target_school_id"
            label="Target School"
            options={dropdowns.TargetSchools || []}
            error={errors.target_school_id}
            loading={dropdownLoading}
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
          label="Add Student" 
          />

        </Grid>
      </form>
      <ToastContainer />
    </Box>
  );
};

export default AddStudentForm;
