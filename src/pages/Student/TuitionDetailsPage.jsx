import TuitionCompletionStats from "../StudentPannel/TuitionCompletionStats";
import DropdownField from "../../components/DropdownField";

import {
  Box,
  Typography,
  Skeleton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  TablePagination,
  Chip,
  Grid,
} from '@mui/material';

import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import api from '../../api';
import { useForm } from "react-hook-form";

const TuitionDetailsPage = () => {
  const { control, setValue } = useForm();

  const [filters, setFilters] = useState({ subject_id: '', choose_title: '' });
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const chooseTitle = [
    { id: 'TopicContent', name: 'Topic Content' },
    { id: 'SubTopicContent', name: 'SubTopic Content' },
    { id: 'TopicTest', name: 'Topic Test' },
    { id: 'SubTopicTest', name: 'SubTopic Test' }
  ];

  // Fetch Subjects directly
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('student/fetch/subjects');
        const data = res.data?.data || [];

        setSubjects(data);
        setDropdownLoading(false);

        // Set default subject
        if (!filters.subject_id && data.length > 0) {
          const defaultSubject = String(data[0].id);
          handleFilterChange('subject_id', defaultSubject);
          setValue('subject_id', defaultSubject);
        }
      } catch (error) {
        toast.error("Failed to fetch subjects");
        setDropdownLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Set default choose_title
  useEffect(() => {
    if (!filters.choose_title) {
      const defaultTitle = chooseTitle[0]?.id;
      handleFilterChange('choose_title', String(defaultTitle));
      setValue('choose_title', String(defaultTitle));
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // Fetch filtered assignments
  useEffect(() => {
    const { subject_id, choose_title } = filters;
    if (!subject_id || !choose_title) return;

    setLoading(true);
    api.get('student/current/assignment', {
      params: { subject_id, choose_title }
    })
      .then(res => {
        const list = res.data?.data?.data || [];
        setAssignments(list);
        if (!list.length) toast.info('No record found');
      })
      .catch(() => {
        setAssignments([]);
        toast.error('Failed to load data');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const isFilterSelected = filters.subject_id && filters.choose_title;

  return (
    <Box sx={{ py: 4 }}>
      <TuitionCompletionStats />

      <Box sx={{ mt: 4 }}>
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <DropdownField
            control={control}
            name="subject_id"
            label="Subject"
            options={subjects}
            loading={dropdownLoading}
            onChange={(value) => handleFilterChange('subject_id', String(value))}
            defaultValue={filters.subject_id}
          />
          <DropdownField
            control={control}
            name="choose_title"
            label="Title"
            options={chooseTitle}
            loading={dropdownLoading}
            onChange={(value) => handleFilterChange('choose_title', String(value))}
            defaultValue={filters.choose_title}
          />
        </Grid>

        {/* Table */}
        {loading ? (
          <Paper sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Week Number</strong></TableCell>
                    <TableCell><strong>Start–End Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : !isFilterSelected ? (
          <Typography>Select both filters to load data.</Typography>
        ) : assignments.length === 0 ? (
          <Typography>No data found for selected filters.</Typography>
        ) : (
          <Paper sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Week Number</strong></TableCell>
                    <TableCell><strong>Start–End Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.week_number || item.weeks?.week_number || 'N/A'}</TableCell>
                        <TableCell>{item.start_end_date || item.weeks?.start_end_date || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip label="Assigned" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={assignments.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TuitionDetailsPage;
