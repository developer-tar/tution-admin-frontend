import {
  Box,
  Button,
  Grid,
  Typography,
  Skeleton,
  Paper,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";

const students = [
  { id: "1", name: "Tarun" },
  { id: "2", name: "Priya" },
  { id: "3", name: "Shyam" },
];

const courses = [
  { id: "1", name: "Mathematics" },
  { id: "2", name: "Science" },
];

const dummyData = [
  {
    id: 1,
    student_id: "1",
    student_name: "Tarun",
    course_id: "1",
    course_name: "Mathematics",
    topic: "Algebra",
    subtopic: "Quadratic Equations",
    test: "Quiz 1",
    rank: "Low",
  },
  {
    id: 2,
    student_id: "2",
    student_name: "Priya",
    course_id: "2",
    course_name: "Science",
    topic: "Physics",
    subtopic: "Motion",
    test: "Test A",
    rank: "Medium",
  },
  {
    id: 3,
    student_id: "3",
    student_name: "Shyam",
    course_id: "1",
    course_name: "Mathematics",
    topic: "Geometry",
    subtopic: "Triangles",
    test: "Quiz B",
    rank: "High",
  },
];

const CourseTargetArea = () => {
  const { control, setValue } = useForm();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    student_id: "",
    course_id: "",
    threshold: "",
  });

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [data, setData] = useState([]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleRecalculate = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate filtering logic
      const result = dummyData.filter((item) => {
        return (
          (!filters.student_id || item.student_id === filters.student_id) &&
          (!filters.course_id || item.course_id === filters.course_id)
        );
      });
      setData(result);
      setLoading(false);
    }, 1000);
  };

  const fields = [
    {
      name: "student_id",
      label: "Student Name",
      options: students,
      defaultValue: filters.student_id,
      onChange: (value) => handleFilterChange("student_id", value),
    },
    {
      name: "course_id",
      label: "Course Name",
      options: courses,
      defaultValue: filters.course_id,
      onChange: (value) => handleFilterChange("course_id", value),
    },
  ];

  const columns = useMemo(() => [
    { key: "topic", label: "Topic" },
    { key: "subtopic", label: "Subtopic" },
    { key: "test", label: "Tests" },
    { key: "rank", label: "Rank" },
  ], []);

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" mb={2}>
        This report will show your student topic and subtopic where their test attempt scores
        are below a certain <b>threshold</b>. The <b>recommended</b> threshold for a topic to be
        displayed in the list is a first attempt score of less than 80%.
        <br />
        You can change the percentage threshold as needed — just click <b>RECALCULATE</b> after adjusting your selections.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {fields.map((field, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <DropdownField
                control={control}
                name={field.name}
                label={field.label}
                options={field.options}
                onChange={field.onChange}
                defaultValue={field.defaultValue}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <input
                type="number"
                value={filters.threshold}
                placeholder="Threshold %"
                onChange={(e) => handleFilterChange("threshold", e.target.value)}
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
          </Grid>

          <Grid item xs={12} sm={2} mt="auto">
            <Button
              fullWidth
              variant="contained"
              onClick={handleRecalculate}
              disabled={loading}
            >
              RECALCULATE
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <Paper sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} />
            ))}
          </Paper>
        ) : (
          <DataTable
            loading={false}
            data={data}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            isFilterSelected={true}
            columns={columns}
            onRowClick={(row) => navigate(`/topic/details/${row.id}`)}
          />
        )}
      </Box>
    </Box>
  );
};

export default CourseTargetArea;
