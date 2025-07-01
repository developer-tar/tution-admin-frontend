import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Grid,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import DropdownField from "../../components/DropdownField";
import TuitionCompletionStats from "../StudentPannel/TuitionCompletionStats";
import DataTable from "../../components/DataTable";

const MyCourseAssignment = () => {
  const prefix = process.env.REACT_APP_STUDENT_PREFIX;

  const { control, setValue } = useForm();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ subject_id: "", choose_title: "" });
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const chooseTitle = [
    { id: "TopicContent", name: "Topic Content" },
    { id: "SubTopicContent", name: "SubTopic Content" },
    { id: "TopicTest", name: "Topic Test" },
    { id: "SubTopicTest", name: "SubTopic Test" },
  ];

  // Fetch Subjects
  useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const { data } = await api.get(`${prefix}/fetch/subjects`);
      

      const dataList = data?.data || [];
      setSubjects(dataList);
      

      if (!filters.subject_id && dataList.length > 0) {
        const defaultSubject = String(dataList[0].id);
      
        handleFilterChange("subject_id", defaultSubject);
        setValue("subject_id", defaultSubject);
      }
      setDropdownLoading(false);
    } catch {
      toast.error("Failed to fetch subjects");
      setDropdownLoading(false);
    }
  };

  fetchSubjects();
}, []);


  // Set default title
  useEffect(() => {
    if (!filters.choose_title) {
      const defaultTitle = chooseTitle[0]?.id;
      handleFilterChange("choose_title", defaultTitle);
      setValue("choose_title", defaultTitle);
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // Fetch Assignments
  useEffect(() => {
    const { subject_id, choose_title } = filters;
    if (!subject_id || !choose_title) return;

    setLoading(true);
    api
      .get(`${prefix}/current/assignment`, {
        params: { subject_id, choose_title },
      })
      .then((res) => {
        const list = res.data?.data?.data || [];
        setAssignments(list);
        if (!list.length) toast.info("No record found");
      })
      .catch(() => {
        setAssignments([]);
        toast.error("Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const isFilterSelected = filters.subject_id && filters.choose_title;

  const columns = useMemo(() => {
  const title = filters.choose_title;
  const baseColumns = [{ key: "id", label: "Order Id" }];
  let viewPathPrefix = "";


  var columns = [
    {
      'title': 'TopicContent',
      'columns': [
        { key: "name", label: "Topic" },
        { key: "completed", label: "Is Completed" },
        { key: "completed_at", label: "Completed At" }  
      ],
      "viewPathPrefix": `/${prefix}/topic/content/view`
    },
    {
      "title": 'SubTopicContent',
      "columns": [
        { key: "sub_topic_name", label: "Sub-Topic" },
        { key: "course_name", label: "Topic" },
        { key: "completed", label: "Is Completed" },
        { key: "completed_at", label: "Completed At" }
      ],
      "viewPathPrefix": `/${prefix}/subtopic/content/view`
    },
    {
      "title": 'TopicTest',
      "columns": [    
        { key: "test_name", label: "Topic Test" },
        { key: "course_name", label: "Topic" },
        { key: "completed", label: "Is Completed" },
        { key: "completed_at", label: "Completed At" }
      ],
      "viewPathPrefix": `/${prefix}/topic/test`
    },
    {
      "title": 'SubTopicTest',
      "columns": [
        { key: "test_name", label: "Sub-Topic Test" },
        { key: "sub_topic_name", label: "Topic" },
        { key: "topic_name", label: "Topic" },
        { key: "completed", label: "Is Completed" },
        { key: "completed_at", label: "Completed At" }
      ],
      "viewPathPrefix": `/${prefix}/subtopic/test`
    },
  ]
  columns.map((col) => {
    if (col.title === title) {
      baseColumns.push(...col.columns);
      viewPathPrefix = col.viewPathPrefix;
    }
  });

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
}, [filters.choose_title, navigate]);

  const fields = [
    {
      "name":"subject_id",
      "label":"Subject",
      "options": subjects,
      "loading": dropdownLoading,
      "onChange": (value) => handleFilterChange("subject_id", String(value)),
      "defaultValue": filters.subject_id

  },
  {
      "name":"choose_title",
      "label":"Title",
      "options": chooseTitle,
      "loading": dropdownLoading,
      "onChange": (value) => handleFilterChange("choose_title", String(value)),
      "defaultValue": filters.choose_title
  },

];//render the fields 

  return (
    <Box sx={{ py: 4 }}>
      <TuitionCompletionStats />

      <Box sx={{ mt: 4 }}>
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>

          {fields.map((field) => (
              <DropdownField
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

        {/* Data Table */}
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

export default MyCourseAssignment;
