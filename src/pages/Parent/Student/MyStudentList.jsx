import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import DropdownField from "../../../components/DropdownField";
import DataTable from "../../../components/DataTable";

// Dummy student list
const dummyStudents = [
  {
    id: 1,
    first_name: "Tarun",
    last_name: "Singh",
    email: "tarun@example.com",
    status: "Active",
  },
  {
    id: 2,
    first_name: "Anjali",
    last_name: "Verma",
    email: "anjali@example.com",
    status: "Inactive",
  },
  {
    id: 3,
    first_name: "Rohan",
    last_name: "Sharma",
    email: "rohan@example.com",
    status: "Active",
  },
];

const MyCurrentCourseAssignment = () => {
  const { control, setValue } = useForm();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ status: "" });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Optional: Filter by status (Active / Inactive)
  const filteredStudents = useMemo(() => {
    if (!filters.status) return dummyStudents;
    return dummyStudents.filter(student => student.status === filters.status);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
    setPage(0);
  };

  const fields = [
    {
      name: "status",
      label: "Status",
      options: [
        { id: "", name: "All" },
        { id: "Active", name: "Active" },
        { id: "Inactive", name: "Inactive" },
      ],
      loading: false,
      onChange: (value) => handleFilterChange("status", String(value)),
      defaultValue: filters.status,
    },
  ];

  const columns = useMemo(() => [
    { key: "id", label: "ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/student/view/${row.id}`)}
        >
          View
        </Button>
      ),
    }
  ], [navigate]);

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" mb={2}>
        My Student List
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {fields.map((field, index) => (
            <DropdownField
              key={index}
              control={control}
              name={field.name}
              label={field.label}
              options={field.options}
              loading={field.loading}
              onChange={field.onChange}
              defaultValue={field.defaultValue}
            />
          ))}
        </Grid>

        <DataTable
          loading={false}
          data={filteredStudents}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          isFilterSelected={true}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default MyCurrentCourseAssignment;
