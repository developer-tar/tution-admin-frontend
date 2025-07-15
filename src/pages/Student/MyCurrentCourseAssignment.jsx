import {
  Box,
  Button,
  Grid,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import DataTable from "../../components/DataTable";
import DropdownField from "../../components/DropdownField";
import TuitionCompletionStats from "../StudentPannel/TuitionCompletionStats";
import usePaginatedData from "../../hooks/usePaginatedData";

const prefix = process.env.REACT_APP_STUDENT_PREFIX;

const chooseTitle = [
  {
    id: "TopicContent", name: "Topic Content",
    columns: [
      { key: "name", label: "Topic" },
      { key: "completed", label: "Is Completed" },
      { key: "completed_at", label: "Completed At" }
    ],
    viewPathPrefix: `/${prefix}/topic/content/view`
  },
  {
    id: "SubTopicContent", name: "SubTopic Content",
    columns: [
      { key: "sub_topic_name", label: "Sub-Topic" },
      { key: "course_name", label: "Topic" },
      { key: "completed", label: "Is Completed" },
      { key: "completed_at", label: "Completed At" }
    ],
    viewPathPrefix: `/${prefix}/subtopic/content/view`
  },
  {
    id: "TopicTest", name: "Topic Test",
    columns: [
      { key: "test_name", label: "Topic Test" },
      { key: "course_name", label: "Topic" },
      { key: "completed", label: "Is Completed" },
      { key: "completed_at", label: "Completed At" }
    ],
    viewPathPrefix: `/${prefix}/topic/test`
  },
  {
    id: "SubTopicTest", name: "SubTopic Test",
    columns: [
      { key: "test_name", label: "Sub-Topic Test" },
      { key: "sub_topic_name", label: "Topic" },
      { key: "topic_name", label: "Topic" },
      { key: "completed", label: "Is Completed" },
      { key: "completed_at", label: "Completed At" }
    ],
    viewPathPrefix: `/${prefix}/subtopic/test`
  },
];

const MyCurrentCourseAssignment = () => {
  const { control, setValue } = useForm();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    subject_id: "",
    choose_title: chooseTitle[0]?.id || "",
    subjects: [],
  });

  const [dropdownLoading, setDropdownLoading] = useState(true);

  // Only fetch when both filters have values
  const shouldFetch = !!filters.subject_id && !!filters.choose_title;

  // Prepare queryParams only if both filters are present
  const queryParams = useMemo(() => {
    if (!shouldFetch) return {};
    return {
      subject_id: filters.subject_id,
      choose_title: filters.choose_title,
    };
  }, [filters.subject_id, filters.choose_title, shouldFetch]);

  const {
    data: assignments,
    loading,
    page,
    setPage,
    rowsPerPage,
  } = usePaginatedData({
    endpoint: `${prefix}/current/assignment`,
    queryParams,
    enabled: shouldFetch,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
    setPage(0);
  };

  // Fetch subjects on mount
  useEffect(() => {
    const fetching = async () => {
      try {
        const { data } = await api.get(`${prefix}/fetch/subjects`);
        const dataList = data?.data || [];

        if (dataList.length > 0) {
          setFilters((prev) => ({
            ...prev,
            subjects: dataList,
            // Only set subject_id if empty
            subject_id: prev.subject_id || String(dataList[0].id),
          }));
          setValue("subject_id", String(dataList[0].id));
        }

        setValue("choose_title", filters.choose_title);
        setDropdownLoading(false);
      } catch {
        toast.error("Failed to fetch subjects");
        setDropdownLoading(false);
      }
    };

    fetching();
  }, []); // empty deps - run once on mount

  const isFilterSelected = filters.subject_id && filters.choose_title;

  const columns = useMemo(() => {
    const baseColumns = [{ key: "id", label: "Order Id" }];
    let viewPathPrefix = "";

    const selected = chooseTitle.find((col) => col.id === filters.choose_title);

    if (selected) {
      baseColumns.push(...selected.columns);
      viewPathPrefix = selected.viewPathPrefix;
    }

    baseColumns.push({
      key: "action",
      label: "Action",
      render: (row) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`${viewPathPrefix}/${row.id}`)}
        >
          View
        </Button>
      ),
    });

    return baseColumns;
  }, [filters, navigate]);

  const fields = [
    {
      name: "subject_id",
      label: "Subject",
      options: filters.subjects,
      loading: dropdownLoading,
      onChange: (value) => handleFilterChange("subject_id", String(value)),
      defaultValue: filters.subject_id,
    },
    {
      name: "choose_title",
      label: "Title",
      options: chooseTitle,
      loading: dropdownLoading,
      onChange: (value) => handleFilterChange("choose_title", String(value)),
      defaultValue: filters.choose_title,
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <TuitionCompletionStats />

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {fields.map((field) => (
            <DropdownField
              key={field.name}
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
          loading={loading}
          data={assignments}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          isFilterSelected={isFilterSelected}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default MyCurrentCourseAssignment;
