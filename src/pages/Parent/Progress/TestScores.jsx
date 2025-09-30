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
const students = [
  { id: "1", name: "Tarun" },
  { id: "2", name: "Anjali" },
];

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

// Dummy Results
const dummyResults = [
  {
    id: 1,
    student_id: "1",
    student_name: "Tarun",
    course_id: "1",
    subject_id: "1",
    subject: "Algebra",
    topic_id: "1",
    topic: "Quadratic Equations",
    subtopic_id: "1",
    subtopic: "Factoring",
    test_name: "Quiz 1",
    attempt_type: "last",
    score: "8",
    total_questions: 10,
    total_answered: 9,
  },
  {
    id: 2,
    student_id: "2",
    student_name: "Anjali",
    course_id: "2",
    subject_id: "2",
    subject: "Physics",
    topic_id: "2",
    topic: "Motion",
    subtopic_id: "2",
    subtopic: "Newton's Laws",
    test_name: "Test A",
    attempt_type: "first",
    score: "7",
    total_questions: 10,
    total_answered: 10,
  },
  {
    id: 3,
    student_id: "2",
    student_name: "Anjali",
    course_id: "2",
    subject_id: "2",
    subject: "Physics",
    topic_id: "2",
    topic: "Motion",
    subtopic_id: "2",
    subtopic: "Newton's Laws",
    test_name: "Test B",
    attempt_type: "last",
    score: "9",
    total_questions: 10,
    total_answered: 10,
  },
];

const TestScores = () => {
  const { control, setValue } = useForm();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [formFilters, setFormFilters] = useState({
    student_id: "",
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
        (!filters.student_id || item.student_id === filters.student_id) &&
        (!filters.course_id || item.course_id === filters.course_id) &&
        (!filters.subject_id || item.subject_id === filters.subject_id) &&
        (!filters.topic_id || item.topic_id === filters.topic_id) &&
        (!filters.subtopic_id || item.subtopic_id === filters.subtopic_id) &&
        (filters.attempt_type === "all" || item.attempt_type === filters.attempt_type)
      );
    });
  }, [filters]);

  const columns = [
    { key: "student_name", label: "Student" },
    { key: "subject", label: "Subject" },
    { key: "topic", label: "Topic" },
    { key: "subtopic", label: "SubTopic" },
    { key: "test_name", label: "Test Name" },
    { key: "score", label: "Score" },
    { key: "total_questions", label: "Total Q" },
    { key: "total_answered", label: "Total Answered" },
  ];

  const filterFields = [
    {
      name: "student_id",
      label: "Student",
      options: students,
      defaultValue: formFilters.student_id,
      onChange: (val) => handleFormFilterChange("student_id", val),
    },
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
        Student Attempt Report
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
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
          >
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

export default TestScores;
