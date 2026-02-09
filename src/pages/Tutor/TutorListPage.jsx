import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../../api";

const defaultColumns = { id: "ID", name: "Name" };

const TutorListPage = ({
  title,
  endpoint,
  columns = defaultColumns,
  transformRow = (row) => row,
  perPageKey = "per_page",
  courseIdFilter = false,
  renderActions,
  disablePagination = false,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (!disablePagination) {
        params[perPageKey] = perPage;
        params.page = page + 1;
      }
      if (courseIdFilter && courseId) params.course_id = courseId;
      const res = await api.get(endpoint, { params });
      if (res.data?.success) {
        const d = res.data.data;
        if (Array.isArray(d)) {
          setData(d);
          setTotal(d.length);
        } else if (d?.data !== undefined) {
          setData(Array.isArray(d.data) ? d.data : []);
          setTotal(Number(d.total) ?? 0);
        } else {
          setData(Array.isArray(d) ? d : []);
          setTotal(Array.isArray(d) ? d.length : 0);
        }
      } else {
        setError("Failed to load data");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseIdFilter && endpoint === "tutor/students") {
      api.get("tutor/courses").then((r) => {
        if (r.data?.success) setCourses(r.data.data || []);
      });
    }
    fetchData();
  }, [endpoint, page, perPage, courseId, disablePagination]);

  if (loading && !data.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  const colEntries = Object.entries(columns);
  const hasRenderActions = typeof renderActions === "function";
  const hasAnyActions = hasRenderActions && data.some((row) => {
    const content = renderActions(row);
    return content != null && content !== "";
  });
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {courseIdFilter && (
        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>Course</InputLabel>
          <Select value={courseId} label="Course" onChange={(e) => setCourseId(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {colEntries.map(([key, label]) => (
                <TableCell key={key} sx={{ fontWeight: 600 }}>
                  {label}
                </TableCell>
              ))}
              {hasAnyActions && (
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => {
              const r = transformRow(row);
              return (
                <TableRow key={r.id ?? row.id ?? idx}>
                  {colEntries.map(([key]) => (
                    <TableCell key={key}>
                      {key === "no" ? idx + 1 : (r[key] ?? row[key] ?? "-")}
                    </TableCell>
                  ))}
                  {hasAnyActions && (
                    <TableCell>{renderActions(row)}</TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!disablePagination && total > perPage && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={perPage}
          onRowsPerPageChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 15, 25]}
        />
      )}
    </Box>
  );
};

export default TutorListPage;
