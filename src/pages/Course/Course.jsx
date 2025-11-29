import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Paper,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

export default function Course() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetchingCourse, setFetchingCourse] = useState(false);
  const [existingImage, setExistingImage] = useState(null);
  const [courseData, setCourseData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const [academicYears, setAcademicYears] = useState([]);
  const [locations, setLocations] = useState([]);
  const [modes, setModes] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");

  const [onlineFeatures, setOnlineFeatures] = useState([]);
  const [onlineFeatureInput, setOnlineFeatureInput] = useState("");

  const [inPersonFeatures, setInPersonFeatures] = useState([]);
  const [inPersonFeatureInput, setInPersonFeatureInput] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [locationsSelected, setLocationsSelected] = useState([]);

  const [onlineAmounts, setOnlineAmounts] = useState({ 1: "", 3: "", 6: "", 12: "" });
  const [inPersonAmounts, setInPersonAmounts] = useState({ 1: "", 3: "", 6: "", 12: "" });

  const data = watch();
  const subscriptionPlans = [1, 3, 6, 12]; // months

  // Fetch dropdown data
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
        toast.error("Failed to load dropdown data, please try again.");
      }
    };
    fetchData();
  }, []);

  // Fetch course data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCourseData = async () => {
        setFetchingCourse(true);
        try {
          const response = await api.get(`admin/assign/course/${id}`);
          if (response.data.success) {
            const courseData = response.data.data;
            
            // Store course data in state for later use (especially for academic year dropdown)
            setCourseData(courseData);
            
            // Transform API response to form format
            setValue("name", courseData.name || "");
            setValue("description", courseData.description || "");
            // Note: acdemic_year_id will be set in a separate useEffect that waits for academicYears to load
            
            // Set multi-select fields
            if (courseData.subject_ids) {
              setSubjects(courseData.subject_ids);
            }
            if (courseData.type_of_modes) {
              setValue("type_of_modes", courseData.type_of_modes);
            }
            if (courseData.location_ids) {
              setLocationsSelected(courseData.location_ids);
            }
            
            // Set features
            if (courseData.features_names) {
              setFeatures(courseData.features_names);
            }
            if (courseData.online_features_names) {
              setOnlineFeatures(courseData.online_features_names);
            }
            if (courseData.in_person_features_names) {
              setInPersonFeatures(courseData.in_person_features_names);
            }
            
            // Transform prices object to individual fields
            if (courseData.prices) {
              const onlinePrices = {};
              const inPersonPrices = {};
              
              Object.entries(courseData.prices).forEach(([key, value]) => {
                if (key.startsWith("amount_for_online_")) {
                  const period = key.replace("amount_for_online_", "");
                  onlinePrices[period] = value ? String(value) : "";
                } else if (key.startsWith("amount_for_in_person_")) {
                  const period = key.replace("amount_for_in_person_", "");
                  inPersonPrices[period] = value ? String(value) : "";
                }
              });
              
              setOnlineAmounts(onlinePrices);
              setInPersonAmounts(inPersonPrices);
            }
            
            // Set existing image
            if (courseData.image) {
              setExistingImage(courseData.image);
            }
          }
        } catch (err) {
          console.error("Error fetching course:", err);
          if (err.response?.status === 404) {
            toast.error("Course not found");
            navigate("/admin/course-list");
          } else {
            toast.error("Failed to load course data");
          }
        } finally {
          setFetchingCourse(false);
        }
      };
      fetchCourseData();
    }
  }, [id, isEditMode, setValue, navigate]);

  // Set academic year value when both courseData and academicYears are available
  useEffect(() => {
    if (isEditMode && courseData && academicYears.length > 0) {
      const apiYearId = courseData.acdemic_year_id;
      console.log('🔵 Academic Year useEffect triggered');
      console.log('🔵 API Year ID:', apiYearId, 'Type:', typeof apiYearId);
      console.log('🔵 Available academic years:', academicYears);
      
      if (!apiYearId && apiYearId !== 0) {
        console.warn('⚠️ No academic year ID in course data');
        return;
      }

      // Check the type of IDs in the dropdown to ensure type match
      const firstYearId = academicYears[0]?.id;
      const isNumberType = typeof firstYearId === 'number';
      console.log('🔵 First year ID type:', typeof firstYearId, 'Value:', firstYearId);
      
      // Convert to match the dropdown type
      const yearId = isNumberType ? Number(apiYearId) : String(apiYearId);
      console.log('🔵 Converted year ID:', yearId, 'Type:', typeof yearId);
      
      // Verify the year exists in the dropdown options
      const yearExists = academicYears.some(y => {
        // Compare with type coercion to handle both number and string
        const matches = y.id == yearId || String(y.id) === String(yearId) || Number(y.id) === Number(yearId);
        if (matches) {
          console.log('✅ Found matching year:', y);
        }
        return matches;
      });
      
      if (yearExists) {
        console.log('✅ Setting academic year ID:', yearId, 'Type:', typeof yearId);
        setValue("acdemic_year_id", yearId, { shouldValidate: false, shouldDirty: true });
        // Verify the value was set
        setTimeout(() => {
          const currentValue = watch("acdemic_year_id");
          console.log('🔵 Current form value after setValue:', currentValue);
          if (currentValue !== yearId) {
            console.warn('⚠️ Value mismatch! Expected:', yearId, 'Got:', currentValue);
          }
        }, 100);
      } else {
        console.error('❌ Academic year ID not found in dropdown:', yearId, 'Available years:', academicYears.map(y => ({ id: y.id, type: typeof y.id, name: y.start_end_year })));
      }
    }
  }, [academicYears, courseData, isEditMode, setValue]);

  // ---------- Feature Handlers ----------
  const handleAddFeature = () => {
    if (featureInput.trim().length < 50) {
      toast.error("Feature must be at least 50 characters.");
      return;
    }
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput("");
  };

  const handleAddOnlineFeature = () => {
    if (onlineFeatureInput.trim().length < 50) {
      toast.error("Feature must be at least 50 characters.");
      return;
    }
    setOnlineFeatures([...onlineFeatures, onlineFeatureInput.trim()]);
    setOnlineFeatureInput("");
  };

  const handleAddInPersonFeature = () => {
    if (inPersonFeatureInput.trim().length < 50) {
      toast.error("Feature must be at least 50 characters.");
      return;
    }
    setInPersonFeatures([...inPersonFeatures, inPersonFeatureInput.trim()]);
    setInPersonFeatureInput("");
  };

  // ---------- Select Handlers ----------
  const handleAddSubject = (id) => {
    if (!subjects.includes(id)) setSubjects([...subjects, id]);
  };
  const handleAddLocation = (id) => {
    if (!locationsSelected.includes(id))
      setLocationsSelected([...locationsSelected, id]);
  };

  // Check if a specific mode is selected
  const isModeSelected = (modeName) => {
    return data.type_of_modes?.some(modeId => {
      const mode = modes.find(m => m.id === Number(modeId));
      return mode && mode.name.toLowerCase().includes(modeName.toLowerCase());
    });
  };

  // Get mode name by ID
  const getModeName = (modeId) => {
    const mode = modes.find(m => m.id === Number(modeId));
    return mode ? mode.name : "";
  };

  // ---------- Submit ----------
  const onSubmit = async (formValues) => {
    setLoading(true);
    try {
      // Validate features
      if (features.length === 0) {
        toast.error("Please provide at least one feature");
        setLoading(false);
        return;
      }

      // Validate course image (only required for create, optional for edit)
      if (!isEditMode && !(formValues.course_image instanceof File)) {
        toast.error("Please select a valid image file.");
        setLoading(false);
        return;
      }

      // Check if in-person mode is selected and has valid amounts
      const hasInPersonMode = isModeSelected("person");
      
      if (hasInPersonMode) {
        const hasValidAmount = Object.values(inPersonAmounts).some(val => val && parseFloat(val) > 0);
        
        if (!hasValidAmount) {
          toast.error("Please provide at least one valid installment amount for in-person mode.");
          return;
        }
      }

      // Check if online mode is selected and has valid amounts
      const hasOnlineMode = isModeSelected("online");
      
      if (hasOnlineMode) {
        const hasValidAmount = Object.values(onlineAmounts).some(val => val && parseFloat(val) > 0);
        
        if (!hasValidAmount) {
          toast.error("Please provide at least one valid installment amount for online mode.");
          return;
        }
      }

      const formData = new FormData();

      // Append basic form values
      formData.append("name", formValues.name);
      formData.append("acdemic_year_id", formValues.acdemic_year_id);
      formData.append("description", formValues.description);
      
      // Only append image if it's a new file (for create or update with new image)
      if (formValues.course_image instanceof File) {
        formData.append("course_image", formValues.course_image);
      }

      // Append multi-selects using [] format as per API documentation
      if (formValues.type_of_modes) {
        formValues.type_of_modes.forEach((val) => {
          formData.append('type_of_modes[]', val);
        });
      }

      subjects.forEach((val) => {
        formData.append('subject_ids[]', val);
      });

      locationsSelected.forEach((val) => {
        formData.append('location_ids[]', val);
      });

      // Append features using [] format as per API documentation
      features.forEach((f) => {
        formData.append('features_names[]', f);
      });

      onlineFeatures.forEach((f) => {
        formData.append('online_features_names[]', f);
      });

      inPersonFeatures.forEach((f) => {
        formData.append('in_person_features_names[]', f);
      });

      // Append installment amounts based on selected modes
      if (isModeSelected("online")) {
        Object.entries(onlineAmounts).forEach(([plan, amount]) => {
          if (amount && parseFloat(amount) > 0) {
            formData.append(`amount_for_online_${plan}`, parseFloat(amount).toFixed(2));
          } else {
            formData.append(`amount_for_online_${plan}`, "0.00");
          }
        });
      }

      if (isModeSelected("person")) {
        Object.entries(inPersonAmounts).forEach(([plan, amount]) => {
          if (amount && parseFloat(amount) > 0) {
            formData.append(`amount_for_in_person_${plan}`, parseFloat(amount).toFixed(2));
          } else {
            formData.append(`amount_for_in_person_${plan}`, "0.00");
          }
        });
      }

      // Determine API endpoint and method
      const endpoint = isEditMode 
        ? `admin/assign/course/${id}` 
        : "admin/assign/course";
      
      // For edit mode with FormData, use POST with _method=PUT
      // This handles file uploads correctly in PHP/Laravel backends
      let method = "post";
      
      if (isEditMode) {
        formData.append('_method', 'PUT');
      }

      // Don't set Content-Type for FormData - axios will set it automatically with boundary
      const response = await api[method](endpoint, formData);

      if (response.data.success) {
        toast.success(isEditMode ? "Course updated successfully!" : "Course created successfully!");
        
        if (isEditMode) {
          // Navigate back to course list after update
          navigate("/admin/course-list");
        } else {
          // Reset form for create mode
          reset();
          setFeatures([]);
          setOnlineFeatures([]);
          setInPersonFeatures([]);
          setSubjects([]);
          setLocationsSelected([]);
          setOnlineAmounts({ 1: "", 3: "", 6: "", 12: "" });
          setInPersonAmounts({ 1: "", 3: "", 6: "", 12: "" });
          setExistingImage(null);
        }
      } else {
        toast.error(isEditMode ? "Failed to update course, please try again." : "Failed to create course, please try again.");
      }
    } catch (err) {
      console.error("Course save error:", err.response || err);
      
      // Handle validation errors
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error(err.response.data.message || "Validation error occurred");
        }
      } else if (err.response?.status === 404) {
        toast.error("Course not found");
        if (isEditMode) {
          navigate("/admin/course-list");
        }
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error(isEditMode 
          ? "Failed to update course, please check your input and try again."
          : "Failed to create course, please check your input and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSelectChips = (list, selected, onDelete) => (
    <Box mt={1}>
      {selected.map((id) => (
        <Chip
          key={id}
          label={list.find((i) => i.id === id)?.name || id}
          onDelete={() => onDelete(id)}
          sx={{ mr: 1, mt: 1 }}
        />
      ))}
    </Box>
  );

  if (fetchingCourse) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 2 }, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading course data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Fancy gradient header */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #3B2A9F 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                background: "rgba(255,255,255,0.16)",
                borderRadius: "16px",
                p: 1.25,
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              }}
            >
              <Typography sx={{ fontSize: 28 }}>📘</Typography>
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                }}
              >
                {isEditMode ? "Edit Course" : "Create New Course"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.5 }}
              >
                {isEditMode 
                  ? "Update course details, modes, locations, features and pricing."
                  : "Configure academic details, modes, locations, features and pricing in one place."
                }
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Card container with scrollable body */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, #ffffff 0%, #f9fafc 60%, #f3f4f8 100%)",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <Box
            sx={{
              maxHeight: { xs: "none", md: "calc(100vh - 210px)" },
              overflowY: { xs: "visible", md: "auto" },
              p: { xs: 2, md: 3 },
              "&::-webkit-scrollbar": {
                width: 8,
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(148,163,184,0.15)",
                borderRadius: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 8,
              },
            }}
          >
            <Grid container spacing={2}>
              {/* Course Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  {...register("name", {
                    required: "Course Name is required",
                    maxLength: {
                      value: 100,
                      message:
                        "Course name must be less than 100 characters",
                    },
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              {/* Academic Year */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="acdemic_year_id"
                  control={control}
                  rules={{ required: "Academic Year is required" }}
                  render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label="Academic Year"
                      {...field}
                      value={field.value || ""}
                  error={!!errors.acdemic_year_id}
                  helperText={errors.acdemic_year_id?.message}
                >
                  {academicYears.map((y) => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.start_end_year}
                    </MenuItem>
                  ))}
                </TextField>
                  )}
                />
              </Grid>

              {/* Modes */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.type_of_modes}>
                  <InputLabel>Modes</InputLabel>
                  <Controller
                    name="type_of_modes"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: "Please select at least one mode" }}
                    render={({ field }) => (
                      <Select
                        multiple
                        input={<OutlinedInput label="Modes" />}
                        value={field.value || []}
                        onChange={field.onChange}
                        renderValue={(selected) => (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={getModeName(value)}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {modes.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.type_of_modes && (
                    <Typography variant="caption" color="error">
                      {errors.type_of_modes.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Subjects */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Subject"
                  value=""
                  onChange={(e) => handleAddSubject(e.target.value)}
                >
                  {subjectsList.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
                {renderSelectChips(
                  subjectsList,
                  subjects,
                  (id) => setSubjects(subjects.filter((s) => s !== id))
                )}
              </Grid>

              {/* Locations */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Location"
                  value=""
                  onChange={(e) => handleAddLocation(e.target.value)}
                >
                  {locations.map((l) => (
                    <MenuItem key={l.id} value={l.id}>
                      {l.name}
                    </MenuItem>
                  ))}
                </TextField>
                {renderSelectChips(
                  locations,
                  locationsSelected,
                  (id) =>
                    setLocationsSelected(
                      locationsSelected.filter((l) => l !== id)
                    )
                )}
              </Grid>

              {/* Features */}
              <Grid item xs={12} md={6}>
                <Box display="flex">
                  <TextField
                    fullWidth
                    label="Add Feature"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    helperText="Minimum 50 characters"
                  />
                  <IconButton onClick={handleAddFeature}>
                    <AddIcon />
                  </IconButton>
                </Box>
                {features.map((f, i) => (
                  <Chip
                    key={i}
                    label={
                      f.length > 30 ? `${f.substring(0, 30)}...` : f
                    }
                    onDelete={() =>
                      setFeatures(
                        features.filter((_, idx) => idx !== i)
                      )
                    }
                    sx={{ mr: 1, mt: 1 }}
                  />
                ))}
              </Grid>

              {/* Online Features */}
              {isModeSelected("online") && (
                <Grid item xs={12} md={6}>
                  <Box display="flex">
                    <TextField
                      fullWidth
                      label="Add Online Feature"
                      value={onlineFeatureInput}
                      onChange={(e) =>
                        setOnlineFeatureInput(e.target.value)
                      }
                      helperText="Minimum 50 characters"
                    />
                    <IconButton onClick={handleAddOnlineFeature}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  {onlineFeatures.map((f, i) => (
                    <Chip
                      key={i}
                      label={
                        f.length > 30
                          ? `${f.substring(0, 30)}...`
                          : f
                      }
                      onDelete={() =>
                        setOnlineFeatures(
                          onlineFeatures.filter((_, idx) => idx !== i)
                        )
                      }
                      sx={{ mr: 1, mt: 1 }}
                    />
                  ))}
                </Grid>
              )}

              {/* In-Person Features */}
              {isModeSelected("person") && (
                <Grid item xs={12} md={6}>
                  <Box display="flex">
                    <TextField
                      fullWidth
                      label="Add In-Person Feature"
                      value={inPersonFeatureInput}
                      onChange={(e) =>
                        setInPersonFeatureInput(e.target.value)
                      }
                      helperText="Minimum 50 characters"
                    />
                    <IconButton onClick={handleAddInPersonFeature}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  {inPersonFeatures.map((f, i) => (
                    <Chip
                      key={i}
                      label={
                        f.length > 30
                          ? `${f.substring(0, 30)}...`
                          : f
                      }
                      onDelete={() =>
                        setInPersonFeatures(
                          inPersonFeatures.filter((_, idx) => idx !== i)
                        )
                      }
                      sx={{ mr: 1, mt: 1 }}
                    />
                  ))}
                </Grid>
              )}

              {/* Online installment Plans */}
              {isModeSelected("online") && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Online installment Plans
                  </Typography>
                  <Grid container spacing={2}>
                    {subscriptionPlans.map((plan) => (
                      <Grid item xs={12} md={3} key={plan}>
                        <TextField
                          type="number"
                          fullWidth
                          label={`${plan} Month(s) Amount`}
                          value={onlineAmounts[plan]}
                          onChange={(e) =>
                            setOnlineAmounts((prev) => ({
                              ...prev,
                              [plan]: e.target.value,
                            }))
                          }
                          inputProps={{ step: "0.01", min: "0" }}
                          error={
                            onlineAmounts[plan] &&
                            parseFloat(onlineAmounts[plan]) <= 0
                          }
                          helperText={
                            onlineAmounts[plan] &&
                            parseFloat(onlineAmounts[plan]) <= 0
                              ? "Amount must be greater than 0"
                              : ""
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {/* In-Person installment Plans */}
              {isModeSelected("person") && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    In-Person installment Plans
                  </Typography>
                  <Grid container spacing={2}>
                    {subscriptionPlans.map((plan) => (
                      <Grid item xs={12} md={3} key={plan}>
                        <TextField
                          type="number"
                          fullWidth
                          label={`${plan} Month(s) Amount`}
                          value={inPersonAmounts[plan]}
                          onChange={(e) =>
                            setInPersonAmounts((prev) => ({
                              ...prev,
                              [plan]: e.target.value,
                            }))
                          }
                          inputProps={{ step: "0.01", min: "0" }}
                          error={
                            inPersonAmounts[plan] &&
                            parseFloat(inPersonAmounts[plan]) <= 0
                          }
                          helperText={
                            inPersonAmounts[plan] &&
                            parseFloat(inPersonAmounts[plan]) <= 0
                              ? "Amount must be greater than 0"
                              : ""
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={8}
                  label="Description"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 500,
                      message:
                        "Description must be at least 500 characters long",
                    },
                    maxLength: {
                      value: 10000,
                      message:
                        "Description must be less than 10000 characters",
                    },
                  })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Controller
                  name="course_image"
                  control={control}
                  rules={!isEditMode ? { required: "Course image is required" } : {}}
                  render={({ field }) => (
                    <Box>
                      {existingImage && !field.value && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                            Current Image:
                          </Typography>
                          <Box
                            component="img"
                            src={existingImage}
                            alt="Current course image"
                            sx={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            field.onChange(e.target.files[0]);
                            setExistingImage(null); // Clear existing image preview when new one selected
                          }
                        }}
                      />
                      {field.value && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                            New Image Selected:
                          </Typography>
                          <Box
                            component="img"
                            src={URL.createObjectURL(field.value)}
                            alt="Preview"
                            sx={{
                              maxWidth: "300px",
                              maxHeight: "200px",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                              objectFit: "cover",
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {field.value.name}
                          </Typography>
                        </Box>
                      )}
                      {isEditMode && (
                        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
                          Leave empty to keep existing image, or upload a new one to replace it.
                        </Typography>
                      )}
                    </Box>
                  )}
                />
                {errors.course_image && (
                  <Typography color="error">
                    {errors.course_image.message}
                  </Typography>
                )}
              </Grid>

              {/* Submit */}
              <Grid
                item
                xs={12}
                sx={{
                  position: { xs: "static", md: "sticky" },
                  bottom: 0,
                  zIndex: 1,
                  mt: 1,
                  pt: 2,
                  background:
                    "linear-gradient(180deg, rgba(249,250,252,0.96) 0%, rgba(241,245,249,0.98) 100%)",
                  borderTop: "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading || fetchingCourse}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow:
                        "0 10px 25px rgba(37,99,235,0.4)",
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #4f46e5 40%, #7c3aed 100%)",
                      "&:hover": {
                        boxShadow:
                          "0 12px 30px rgba(79,70,229,0.6)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        opacity: 0.6,
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: "white" }} />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </Box>
                    ) : (
                      isEditMode ? "Update Course" : "Submit"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </form>
    </Box>
  );
}