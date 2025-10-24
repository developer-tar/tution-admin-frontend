import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Paper,
} from "@mui/material";
import {
  Assignment,
  Quiz,
  VideoLibrary,
  School,
  TrendingUp,
  FilterList,
  Visibility,
  PlayArrow,
} from "@mui/icons-material";
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
    id: "TopicContent", 
    name: "📚 Topic Content",
    icon: VideoLibrary,
    color: "#2196f3",
    gradient: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
    columns: [
      { key: "name", label: "📖 Topic" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" }
    ],
    viewPathPrefix: `/${prefix}/topic/content/view`
  },
  {
    id: "SubTopicContent", 
    name: "📑 SubTopic Content",
    icon: School,
    color: "#4caf50",
    gradient: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    columns: [
      { key: "sub_topic_name", label: "📝 Sub-Topic" },
      { key: "course_name", label: "📖 Topic" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" }
    ],
    viewPathPrefix: `/${prefix}/subtopic/content/view`
  },
  {
    id: "TopicTest", 
    name: "🎯 Topic Test",
    icon: Quiz,
    color: "#ff9800",
    gradient: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    columns: [
      { key: "test_name", label: "🎯 Topic Test" },
      { key: "course_name", label: "📖 Topic" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" }
    ],
    viewPathPrefix: `/${prefix}/topic/test`
  },
  {
    id: "SubTopicTest", 
    name: "🧪 SubTopic Test",
    icon: Assignment,
    color: "#e91e63",
    gradient: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
    columns: [
      { key: "test_name", label: "🧪 Sub-Topic Test" },
      { key: "sub_topic_name", label: "📝 Sub-Topic" },
      { key: "topic_name", label: "📖 Topic" },
      { key: "completed", label: "✅ Is Completed" },
      { key: "completed_at", label: "📅 Completed At" }
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
      label: "🔧 Action",
      render: (row) => {
        const selectedType = chooseTitle.find((col) => col.id === filters.choose_title);
        return (
          <Tooltip title="View Details" arrow>
            <IconButton
              onClick={() => navigate(`${viewPathPrefix}/${row.id}`)}
              sx={{
                background: selectedType?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: 36,
                height: 36,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {selectedType?.id.includes('Test') ? <Quiz sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        );
      },
    });

    return baseColumns;
  }, [filters, navigate]);

  const fields = [
    {
      name: "choose_title",
      label: "Title",
      options: chooseTitle,
      loading: dropdownLoading,
      onChange: (value) => handleFilterChange("choose_title", String(value)),
      defaultValue: filters.choose_title,
    },
    {
      name: "subject_id",
      label: "Subject",
      options: filters.subjects,
      loading: dropdownLoading,
      onChange: (value) => handleFilterChange("subject_id", String(value)),
      defaultValue: filters.subject_id,
    },
  ];

  const selectedType = chooseTitle.find((col) => col.id === filters.choose_title);
  const IconComponent = selectedType?.icon || Assignment;

  return (
    <Box sx={{ 
      py: 4,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Card sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{
                background: 'rgba(255,255,255,0.2)',
                width: 60,
                height: 60,
                backdropFilter: 'blur(10px)'
              }}>
                <TrendingUp sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  📚 My Course Assignments
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Track your learning progress across all subjects and topics
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Stats Section */}
      <Fade in timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <TuitionCompletionStats />
        </Box>
      </Fade>

      {/* Filters Section */}
      <Fade in timeout={1200}>
        <Card sx={{
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                width: 40,
                height: 40
              }}>
                <FilterList sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                🎯 Filter Your Content
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {fields.map((field) => (
                <Grid item xs={12} md={12} key={field.name}>
                  <DropdownField
                    control={control}
                    name={field.name}
                    label={field.label}
                    options={field.options}
                    loading={field.loading}
                    onChange={field.onChange}
                    defaultValue={field.defaultValue}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Selected Type Display */}
            {selectedType && (
              <Box sx={{ mt: 3, p: 2, borderRadius: '12px', background: 'rgba(102, 126, 234, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{
                    background: selectedType.gradient,
                    width: 32,
                    height: 32
                  }}>
                    <IconComponent sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Currently viewing: {selectedType.name}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Content Type Cards */}
      <Fade in timeout={1400}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
            📋 Available Content Types
          </Typography>
          <Grid container spacing={2}>
            {chooseTitle.map((type, index) => {
              const TypeIcon = type.icon;
              const isSelected = filters.choose_title === type.id;
              return (
                <Grid item xs={12} sm={6} md={3} key={type.id}>
                  <Card sx={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    background: isSelected ? type.gradient : 'rgba(255,255,255,0.9)',
                    color: isSelected ? 'white' : '#2c3e50',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }
                  }}
                  onClick={() => handleFilterChange('choose_title', type.id)}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Avatar sx={{
                        background: isSelected ? 'rgba(255,255,255,0.2)' : type.gradient,
                        color: isSelected ? 'white' : 'white',
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2
                      }}>
                        <TypeIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {type.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Fade>

      {/* Data Table Section */}
      <Fade in timeout={1600}>
        <Card sx={{
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            background: selectedType?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                background: 'rgba(255,255,255,0.2)',
                width: 40,
                height: 40
              }}>
                <IconComponent sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedType?.name || '📊 Assignment Data'}
                </Typography>
               
              </Box>
            </Box>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            <DataTable
              loading={loading}
              data={assignments}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              isFilterSelected={isFilterSelected}
              columns={columns}
            />
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default MyCurrentCourseAssignment;
