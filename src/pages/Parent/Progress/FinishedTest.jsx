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
    score: 8,
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
    score: 7,
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
    score: 9,
    total_questions: 10,
    total_answered: 10,
  },
];

const FinishedTest = () => {
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
  const [scoreFilterType, setScoreFilterType] = useState("");
  const [scoreFilterValue, setScoreFilterValue] = useState("");

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
      const score = item.score;
      let scoreMatch = true;

      if (scoreFilterType && scoreFilterValue !== "") {
        const value = Number(scoreFilterValue);
        if (scoreFilterType === "gt") scoreMatch = score > value;
        else if (scoreFilterType === "lt") scoreMatch = score < value;
        else if (scoreFilterType === "eq") scoreMatch = score === value;
      }

      return (
        (!filters.student_id || item.student_id === filters.student_id) &&
        (!filters.course_id || item.course_id === filters.course_id) &&
        (!filters.subject_id || item.subject_id === filters.subject_id) &&
        (!filters.topic_id || item.topic_id === filters.topic_id) &&
        (!filters.subtopic_id || item.subtopic_id === filters.subtopic_id) &&
        (filters.attempt_type === "all" || item.attempt_type === filters.attempt_type) &&
        scoreMatch
      );
    });
  }, [filters, scoreFilterType, scoreFilterValue]);

  const enhancedData = filteredData.map((item) => ({
    ...item,
    skipped: item.total_questions - item.total_answered,
    incorrect: item.total_answered - item.score,
  }));

  const columns = [
    { key: "student_name", label: "Student" },
    { key: "subject", label: "Subject" },
    { key: "topic", label: "Topic" },
    { key: "subtopic", label: "SubTopic" },
    { key: "test_name", label: "Test Name" },
    { key: "score", label: "Correct" },
    { key: "total_answered", label: "Answered" },
    { key: "skipped", label: "Skipped" },
    { key: "incorrect", label: "Incorrect" },
    { key: "total_questions", label: "Total Q" },
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
        Student Finished Test
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

        {/* Score Filter Dropdown */}
        <Grid item xs={12} sm={4}>
          <Box display="flex" gap={1} alignItems="center">
            <Box flex={1}>
              <DropdownField
                control={control}
                name="score_filter_type"
                label="Score Type"
                options={[
                  { id: "gt", name: "Greater than" },
                  { id: "lt", name: "Less than" },
                  { id: "eq", name: "Equal to" },
                ]}
                defaultValue={scoreFilterType}
                onChange={(val) => setScoreFilterType(val)}
              />
            </Box>
            <Box flex={1} display="flex" alignItems="center">
              <input
                type="number"
                value={scoreFilterValue}
                onChange={(e) => setScoreFilterValue(e.target.value)}
                placeholder="Score"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
              <Typography ml={1}>%</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={2} mt="auto">
          <Button fullWidth variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Grid>
      </Grid>

      <DataTable
        loading={false}
        data={enhancedData}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        columns={columns}
        isFilterSelected={true}
      />
    </Box>
  );
};

export default FinishedTest;
