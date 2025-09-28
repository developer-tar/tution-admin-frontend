import { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
} from "@mui/material";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";
import { useForm } from "react-hook-form";

// Dummy Options
const courses = [
  { id: "1", name: "Mathematics" },
  { id: "2", name: "Science" },
];

const subjects = [
  { id: "1", name: "Algebra" },
  { id: "2", name: "Physics" },
];

const topics = [
  { id: "1", name: "Quadratic Equations" },
  { id: "2", name: "Motion" },
];

const subtopics = [
  { id: "1", name: "Factoring" },
  { id: "2", name: "Newton's Laws" },
];

const attemptTypes = [
  { id: "last", name: "Last Attempt" },
  { id: "first", name: "First Attempt" },
  { id: "all", name: "All Attempt" },
];

// Updated Dummy Results
const dummyResults = [
  {
    id: 1,
    course_id: "1",
    course: "Mathematics",
    subject_id: "1",
    subject: "Algebra",
    topic_id: "1",
    topic: "Quadratic Equations",
    subtopic_id: "1",
    subtopic: "Factoring",
    type: "MCQ",
    name: "Quiz 1",
    style: "Timed",
    completed_at: "2025-07-01",
    assignment_week: "Week 1",
    review: "80%",
  },
  {
    id: 2,
    course_id: "2",
    course: "Science",
    subject_id: "2",
    subject: "Physics",
    topic_id: "2",
    topic: "Motion",
    subtopic_id: "2",
    subtopic: "Newton's Laws",
    type: "Written",
    name: "Test A",
    style: "Open",
    completed_at: "2025-07-03",
    assignment_week: "Week 2",
    review: "50%",
  },
  {
    id: 3,
    course_id: "2",
    course: "Science",
    subject_id: "2",
    subject: "Physics",
    topic_id: "2",
    topic: "Motion",
    subtopic_id: "2",
    subtopic: "Newton's Laws",
    type: "MCQ",
    name: "Test B",
    style: "Timed",
    completed_at: "2025-07-07",
    assignment_week: "Week 3",
    review: "30%",
  },
];

const MyCourseTest = () => {
  const { control, setValue } = useForm();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [formFilters, setFormFilters] = useState({
    course_id: "",
    subject_id: "",
    topic_id: "",
    subtopic_id: "",
    attempt_type: "all",
  });

  const [filters, setFilters] = useState(formFilters);

  const handleFormFilterChange = (key, value) => {
    setFormFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleSearch = () => {
    setFilters({ ...formFilters });
    setPage(0);
  };

  const filteredData = useMemo(() => {
    return dummyResults.filter((item) => {
      return (
        (!filters.course_id || item.course_id === filters.course_id) &&
        (!filters.subject_id || item.subject_id === filters.subject_id) &&
        (!filters.topic_id || item.topic_id === filters.topic_id) &&
        (!filters.subtopic_id || item.subtopic_id === filters.subtopic_id) &&
        (filters.attempt_type === "all" || item.attempt_type === filters.attempt_type)
      );
    });
  }, [filters]);

  const columns = [
    { key: "id", label: "ID" },
    { key: "type", label: "Type" },
    { key: "name", label: "Name" },
    { key: "assignment_week", label: "Assignment Week" },
    { key: "style", label: "Style" },
    { key: "completed_at", label: "Completed At" },
    { key: "review", label: "Review" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => alert(`Taking test: ${row.name}`)}
        >
          Take Test
        </Button>
      ),
    },
  ];

  const filterFields = [
    {
      name: "course_id",
      label: "Course",
      options: courses,
      defaultValue: formFilters.course_id,
      onChange: (val) => handleFormFilterChange("course_id", val),
    },
    {
      name: "subject_id",
      label: "Subject",
      options: subjects,
      defaultValue: formFilters.subject_id,
      onChange: (val) => handleFormFilterChange("subject_id", val),
    },
    {
      name: "topic_id",
      label: "Topic",
      options: topics,
      defaultValue: formFilters.topic_id,
      onChange: (val) => handleFormFilterChange("topic_id", val),
    },
    {
      name: "subtopic_id",
      label: "SubTopic",
      options: subtopics,
      defaultValue: formFilters.subtopic_id,
      onChange: (val) => handleFormFilterChange("subtopic_id", val),
    },
    {
      name: "attempt_type",
      label: "Attempt Type",
      options: attemptTypes,
      defaultValue: formFilters.attempt_type,
      onChange: (val) => handleFormFilterChange("attempt_type", val),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        My Course Test
      </Typography>

      <Grid container spacing={2} mb={2}>
        {filterFields.map((field, idx) => (
          <DropdownField
            key={idx}
            control={control}
            name={field.name}
            label={field.label}
            options={field.options}
            defaultValue={field.defaultValue}
            onChange={field.onChange}
          />
        ))}
        <Grid item xs={12} sm={2} mt="auto">
          <Button fullWidth variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Grid>
      </Grid>

      <DataTable
        loading={false}
        data={filteredData}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        columns={columns}
        isFilterSelected={true}
      />
    </Box>
  );
};

export default MyCourseTest;
