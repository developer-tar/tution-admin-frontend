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

// Dummy Filters
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

// Dummy Data
const dummyResults = [
  {
    id: 1,
    video_id: "VID001",
    course_id: "1",
    course: "Mathematics",
    subject_id: "1",
    subject: "Algebra",
    topic_id: "1",
    topic: "Quadratic Equations",
    subtopic_id: "1",
    subtopic: "Factoring",
    title: "Intro to Quadratics",
    video_type: "Lecture",
    assignment_week: "Week 1",
  },
  {
    id: 2,
    video_id: "VID002",
    course_id: "2",
    course: "Science",
    subject_id: "2",
    subject: "Physics",
    topic_id: "2",
    topic: "Motion",
    subtopic_id: "2",
    subtopic: "Newton's Laws",
    title: "Understanding Motion",
    video_type: "Concept",
    assignment_week: "Week 2",
  },
];

const MyCourseVideo = () => {
  const { control, setValue } = useForm();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [formFilters, setFormFilters] = useState({
    course_id: "",
    subject_id: "",
    topic_id: "",
    subtopic_id: "",
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
        (!filters.subtopic_id || item.subtopic_id === filters.subtopic_id)
      );
    });
  }, [filters]);

  const columns = [
    { key: "title", label: "Title" },
    { key: "video_type", label: "Video Type" },
    { key: "subject", label: "Subject" },
    { key: "topic", label: "Topic" },
    { key: "subtopic", label: "SubTopic" },
    { key: "assignment_week", label: "Assignment" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => alert(`Viewing video ID: ${row.video_id}`)}
        >
          View Video
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
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        My Course Video
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
      <Typography variant="subtitle1" mb={1}>
        Total Videos: 20
      </Typography>
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

export default MyCourseVideo;
