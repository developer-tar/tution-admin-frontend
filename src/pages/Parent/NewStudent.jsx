import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Chip,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";

const schema = yup.object().shape({
  acdemic_year_id: yup.number().typeError("Academic year is required").required("Academic year is required"),
  name: yup.string().required("Course name is required"),
  amount: yup.number().typeError("Amount must be a number").positive("Amount must be positive").required("Amount is required"),
  description: yup.string().min(500, "Description must be at least 500 characters").required("Description is required"),
  type_of_modes: yup.array().min(1, "At least one mode is required"),
  course_image: yup.mixed().required("Course image is required"),
});

const Course = () => {
  const [subjectsList, setSubjectsList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [modes, setModes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locationsSelected, setLocationsSelected] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      acdemic_year_id: "",
      name: "",
      amount: "",
      type_of_modes: [],
      course_image: null,
      description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [years, locs, modeList, subs] = await Promise.all([
          api.get("common/data?param=AcdemicYears"),
          api.get("common/data?param=Locations"),
          api.get("common/data?param=Modes"),
          api.get("common/data?param=Subjects"),
        ]);
        setAcademicYears(years.data.data);
        setLocations(locs.data.data);
        setModes(modeList.data.data);
        setSubjectsList(subs.data.data);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        toast.error("Failed to load dropdown data.");
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    if (!subjects.length || !locationsSelected.length) {
      toast.error("Please select at least one subject and one location.");
      return;
    }
    if (!features.length) {
      toast.error("Please add at least one feature.");
      return;
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "course_image" && key !== "type_of_modes") {
        formData.append(key, value);
      }
    });

    formData.append("course_image", data.course_image);
    subjects.forEach((id, i) => formData.append(`subject_ids[${i}]`, id));
    locationsSelected.forEach((id, i) => formData.append(`location_ids[${i}]`, id));
    features.forEach((f, i) => formData.append(`features_names[${i}]`, f));
    data.type_of_modes.forEach((m, i) => formData.append(`type_of_modes[${i}]`, m));

    try {
      setLoading(true);
      await api.post("admin/assign/course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Course created successfully!");
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  const renderSelectChips = (items, selected, label, onDelete) => (
    <Box mt={1}>
      {selected.map((id) => {
        const item = items.find((i) => i.id === id);
        return (
          <Chip
            key={id}
            label={item?.name}
            onDelete={() => onDelete(id)}
            sx={{ mr: 1, mt: 1 }}
          />
        );
      })}
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3} fontWeight={700}>
       Add New Student
      </Typography>
      <Grid container spacing={2}>
        {/* Academic Year */}
        <Grid item xs={12} md={6}>
          <Controller
            name="acdemic_year_id"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label="Academic Year"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.acdemic_year_id}
                helperText={errors.acdemic_year_id?.message}
              >
                {academicYears.map((y) => (
                  <MenuItem key={y.id} value={Number(y.id)}>
                    {y.start_end_year}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* Course Name */}
        <Grid item xs={12} md={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                label="Course Name"
                {...field}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        {/* Subject & Location Selection */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Add Subject"
            value=""
            onChange={(e) => {
              const val = e.target.value;
              if (!subjects.includes(val)) setSubjects([...subjects, val]);
            }}
          >
            {subjectsList.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          {renderSelectChips(subjectsList, subjects, "Subjects", (id) =>
            setSubjects(subjects.filter((s) => s !== id))
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Add Location"
            value=""
            onChange={(e) => {
              const val = e.target.value;
              if (!locationsSelected.includes(val))
                setLocationsSelected([...locationsSelected, val]);
            }}
          >
            {locations.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </TextField>
          {renderSelectChips(locations, locationsSelected, "Locations", (id) =>
            setLocationsSelected(locationsSelected.filter((l) => l !== id))
          )}
        </Grid>

        {/* Modes Multi-Select */}
        <Grid item xs={12} md={6}>
          <Controller
            name="type_of_modes"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label="Mode(s)"
                SelectProps={{ multiple: true }}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={!!errors.type_of_modes}
                helperText={errors.type_of_modes?.message}
              >
                {modes.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* Amount */}
        <Grid item xs={12} md={6}>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                type="number"
                label="Amount"
                {...field}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
            )}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                label="Course Description"
                multiline
                minRows={6}
                fullWidth
                {...field}
                error={!!errors.description}
                helperText={
                  errors.description?.message || `${field.value.length}/500 characters`
                }
              />
            )}
          />
        </Grid>

        {/* Features Input */}
        <Grid item xs={12} md={6}>
          <Box display="flex">
            <TextField
              fullWidth
              label="Add Feature"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
            />
            <IconButton
              onClick={() => {
                if (featureInput.trim().length < 50) {
                  toast.error("Feature must be at least 50 characters.");
                } else {
                  setFeatures([...features, featureInput.trim()]);
                  setFeatureInput("");
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Box mt={1}>
            {features.map((f, i) => (
              <Chip
                key={i}
                label={f}
                onDelete={() => setFeatures(features.filter((_, idx) => idx !== i))}
                sx={{ mr: 1, mt: 1 }}
              />
            ))}
          </Box>
        </Grid>

        {/* Course Image Upload */}
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Course Image</Typography>
          <Controller
            name="course_image"
            control={control}
            render={() => (
              <TextField
                type="file"
                fullWidth
                inputProps={{ accept: "image/*" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  setValue("course_image", file);
                }}
                error={!!errors.course_image}
                helperText={errors.course_image?.message}
              />
            )}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            fullWidth
            onClick={handleSubmit(onSubmit)}
            sx={{
              background: "linear-gradient(to right, #3f2b96, #a71d31)",
              color: "#fff",
              borderRadius: "30px",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              textTransform: "none",
              transition: "0.3s",
              "&:hover": {
                background: "linear-gradient(to right, #3f2b96, #a71d31)",
                transform: "scale(1.02)",
              },
            }}
            endIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />
            }
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </Grid>
      </Grid>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default Course;