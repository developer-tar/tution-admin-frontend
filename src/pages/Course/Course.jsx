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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../api";

export default function Course() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const [academicYears, setAcademicYears] = useState([]);
  const [locations, setLocations] = useState([]);
  const [modes, setModes] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [months, setMonths] = useState([]);

  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");

  const [onlineFeatures, setOnlineFeatures] = useState([]);
  const [onlineFeatureInput, setOnlineFeatureInput] = useState("");

  const [inPersonFeatures, setInPersonFeatures] = useState([]);
  const [inPersonFeatureInput, setInPersonFeatureInput] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [locationsSelected, setLocationsSelected] = useState([]);
  const [monthsSelected, setMonthsSelected] = useState([]);

  const [onlineAmounts, setOnlineAmounts] = useState({ 1: "", 3: "", 6: "", 12: "" });
  const [inPersonAmounts, setInPersonAmounts] = useState({ 1: "", 3: "", 6: "", 12: "" });

  const data = watch();
  const subscriptionPlans = [1, 3, 6, 12]; // months

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [years, locs, modeList, subs, monthsResp] = await Promise.all([
          api.get("common/data?param=AcdemicYears"),
          api.get("common/data?param=Locations"),
          api.get("common/data?param=Modes"),
          api.get("common/data?param=Subjects"),
          api.get("common/data?param=Months"),
        ]);
        setAcademicYears(years.data.data);
        setLocations(locs.data.data);
        setModes(modeList.data.data);
        setSubjectsList(subs.data.data);
        setMonths(monthsResp.data.data);
        
        // Log modes to see what IDs correspond to what modes
        console.log("Available modes:", modeList.data.data);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        toast.error("Failed to load dropdown data.");
      }
    };
    fetchData();
  }, []);

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
  const handleAddMonth = (id) => {
    if (!monthsSelected.includes(id))
      setMonthsSelected([...monthsSelected, id]);
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
    try {
      // Validate features
      if (features.length === 0) {
        toast.error("Please provide at least one feature");
        return;
      }

      // Validate course image
      if (!(formValues.course_image instanceof File)) {
        toast.error("Please select a valid image file.");
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
      formData.append("course_image", formValues.course_image);

      // Append multi-selects
      if (formValues.type_of_modes) {
        formValues.type_of_modes.forEach((val, i) => {
          formData.append(`type_of_modes[${i}]`, val);
        });
      }

      subjects.forEach((val, i) => {
        formData.append(`subject_ids[${i}]`, val);
      });

      locationsSelected.forEach((val, i) => {
        formData.append(`location_ids[${i}]`, val);
      });

      monthsSelected.forEach((val, i) => {
        formData.append(`months[${i}]`, val);
      });

      // Append features
      features.forEach((f, i) => {
        formData.append(`features_names[${i}]`, f);
      });

      onlineFeatures.forEach((f, i) => {
        formData.append(`online_features_names[${i}]`, f);
      });

      inPersonFeatures.forEach((f, i) => {
        formData.append(`in_person_features_names[${i}]`, f);
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

      // Log form data for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await api.post("admin/assign/course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Course created successfully!");
        reset();
        setFeatures([]);
        setOnlineFeatures([]);
        setInPersonFeatures([]);
        setSubjects([]);
        setLocationsSelected([]);
        setMonthsSelected([]);
        setOnlineAmounts({ 1: "", 3: "", 6: "", 12: "" });
        setInPersonAmounts({ 1: "", 3: "", 6: "", 12: "" });
      } else {
        toast.error(response.data.message || "Failed to create course.");
      }
    } catch (err) {
      console.error("Course create error:", err.response || err);
      if (err.response?.data?.errors) {
        // Display all validation errors
        Object.values(err.response.data.errors).forEach(errorArray => {
          errorArray.forEach(error => toast.error(error));
        });
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to create course. Please check your input.");
      }
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                message: "Course name must be less than 100 characters"
              }
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>

        {/* Academic Year */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Academic Year"
            {...register("acdemic_year_id", {
              required: "Academic Year is required",
            })}
            defaultValue=""
            error={!!errors.acdemic_year_id}
            helperText={errors.acdemic_year_id?.message}
          >
            {academicYears.map((y) => (
              <MenuItem key={y.id} value={y.id}>
                {y.start_end_year}
              </MenuItem>
            ))}
          </TextField>
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getModeName(value)} />
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
          {renderSelectChips(subjectsList, subjects, (id) =>
            setSubjects(subjects.filter((s) => s !== id))
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
          {renderSelectChips(locations, locationsSelected, (id) =>
            setLocationsSelected(locationsSelected.filter((l) => l !== id))
          )}
        </Grid>

        {/* Months */}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Select Months"
            value=""
            onChange={(e) => handleAddMonth(e.target.value)}
          >
            {months.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </TextField>
          {renderSelectChips(months, monthsSelected, (id) =>
            setMonthsSelected(monthsSelected.filter((m) => m !== id))
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
              label={f.length > 30 ? `${f.substring(0, 30)}...` : f}
              onDelete={() => setFeatures(features.filter((_, idx) => idx !== i))}
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
                onChange={(e) => setOnlineFeatureInput(e.target.value)}
                helperText="Minimum 50 characters"
              />
              <IconButton onClick={handleAddOnlineFeature}>
                <AddIcon />
              </IconButton>
            </Box>
            {onlineFeatures.map((f, i) => (
              <Chip
                key={i}
                label={f.length > 30 ? `${f.substring(0, 30)}...` : f}
                onDelete={() =>
                  setOnlineFeatures(onlineFeatures.filter((_, idx) => idx !== i))
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
                onChange={(e) => setInPersonFeatureInput(e.target.value)}
                helperText="Minimum 50 characters"
              />
              <IconButton onClick={handleAddInPersonFeature}>
                <AddIcon />
              </IconButton>
            </Box>
            {inPersonFeatures.map((f, i) => (
              <Chip
                key={i}
                label={f.length > 30 ? `${f.substring(0, 30)}...` : f}
                onDelete={() =>
                  setInPersonFeatures(inPersonFeatures.filter((_, idx) => idx !== i))
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
                    error={onlineAmounts[plan] && parseFloat(onlineAmounts[plan]) <= 0}
                    helperText={onlineAmounts[plan] && parseFloat(onlineAmounts[plan]) <= 0 ? "Amount must be greater than 0" : ""}
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
                    error={inPersonAmounts[plan] && parseFloat(inPersonAmounts[plan]) <= 0}
                    helperText={inPersonAmounts[plan] && parseFloat(inPersonAmounts[plan]) <= 0 ? "Amount must be greater than 0" : ""}
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
            rows={4}
            label="Description"
            {...register("description", {
              required: "Description is required",
              minLength: {
                value: 500,
                message: "Description must be at least 500 characters long",
              },
              maxLength: {
                value: 10000,
                message: "Description must be less than 10000 characters",
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
            rules={{ required: "Course image is required" }}
            render={({ field }) => (
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      field.onChange(e.target.files[0]);
                    }
                  }}
                />
                {field.value && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {field.value.name}
                  </Typography>
                )}
              </Box>
            )}
          />
          {errors.course_image && (
            <Typography color="error">{errors.course_image.message}</Typography>
          )}
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" size="large">
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}