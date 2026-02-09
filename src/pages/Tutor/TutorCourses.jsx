import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import { Link } from "react-router-dom";
import TutorListPage from "./TutorListPage";

export default function TutorCourses() {
  return (
    <TutorListPage
      title="My Courses"
      endpoint="tutor/courses"
      disablePagination
      columns={{ no: "#", name: "Course", status_label: "Status", slug: "Slug" }}
      renderActions={(row) =>
        row.has_online_mode ? (
          <Button
            size="small"
            variant="contained"
            component={Link}
            to={`/tutor/course/${row.id}/class`}
            startIcon={<VideocamIcon />}
            sx={{
              background: "linear-gradient(90deg, #3B2A9F 0%, #D62926 100%)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Start class
          </Button>
        ) : null
      }
    />
  );
}
