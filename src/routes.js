import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import AdminLogin from "./pages/Adminlogin";
import Dashboard from "./pages/Student/Dashboard";
import Course from "./pages/Course/Course";
import CourseAssignment from "./pages/Course/CourseAssignment";
import CourseContent from "./pages/Course/CourseContent";
import CourseTest from "./pages/Course/CourseTest";
import CourseList from "./pages/Course/CourseList";
import CourseAssignmentList from "./pages/Course/CourseAssignmentList";
import TopicSubtopicList from "./pages/Course/TopicList";
import TestList from "./pages/Course/TestList";
import CourseReport from "./pages/Course/CourseReport";
import Layout from "./pages/Layout/Layout";
import AdminLayout from "./pages/Layout/AdminLayout";
import StudentLayout from "./pages/Layout/StudentLayout";
import ParentLayout from "./pages/Layout/ParentLayout";
import StudentPannel from "./pages/StudentPannel";
import MyCurrentCourseAssignment from "./pages/Student/MyCurrentCourseAssignment";
import VideoLessonsPage from "./pages/VideoLessonsPage";
import MyCourseVideoPage from "./pages/MyCourseVideoPage";
import TopicContentView from "./pages/Student/TopicContentView";
import SubTopicContentView from "./pages/Student/SubTopicContentView";
import StudentTest from "./pages/Student/StudentTest";

//============ PARENT ============
// student routes
import MyStudentList from "./pages/Parent/Student/MyStudentList";
import AddStudent from "./pages/Parent/Student/AddStudent";
import ChangePassword from "./pages/Parent/Student/ChangePassword";

import TestScores from "./pages/Parent/Progress/TestScores";
//setting route
import Setting from "./pages/Parent/Setting";
import EndOfReport from "./pages/Parent/Progress/EndOfReport";
// ============ AUTH GUARDS ============

// General Protected Route
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

// Admin Protected Route
const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("admin-token");
  const role = localStorage.getItem("admin-role");

  return token && role?.toLowerCase() === "admin"
    ? children
    : <Navigate to="/admin-login" />;
};

// Role-Based Route (student, tutor, parent)
const RequireRole = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" />;
  return allowedRoles.includes(role?.toLowerCase())
    ? children
    : <Navigate to="/login" />;
};

// Guest Route - blocks access if already logged in
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (token) {
    switch (role) {
      case "student":
        return <Navigate to="/student" />;
      case "parent":
        return <Navigate to="/parent" />;
      case "tutor":
        return <Navigate to="/tutor" />;
      case "admin":
        return <Navigate to="/admin/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};


// Redirect users to their main dashboard
const RedirectByRole = () => {
  const role = localStorage.getItem("role");
  switch (role?.toLowerCase()) {
    case "student":
      return <Navigate to="/student" />;
    case "parent":
      return <Navigate to="/parent" />;
    case "tutor":
      return <Navigate to="/tutor" />;
    case "admin":
      return <Navigate to="/admin/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/sign-up" element={
        <GuestRoute>
          <SignUp />
        </GuestRoute>
      } />
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />
      <Route path="/admin-login" element={
        <GuestRoute>
          <AdminLogin />
        </GuestRoute>
      } />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="course" element={<Course />} />
        <Route path="course-assignment" element={<CourseAssignment />} />
        <Route path="course-content" element={<CourseContent />} />
        <Route path="course-test" element={<CourseTest />} />
        <Route path="course-list" element={<CourseList />} />
        <Route path="assignment-list" element={<CourseAssignmentList />} />
        <Route path="topicsubtopic-list" element={<TopicSubtopicList />} />
        <Route path="test-list" element={<TestList />} />
        <Route path="course-report" element={<CourseReport />} />
      </Route>

      {/* STUDENT ROUTES */}
      <Route path="/student/" element={
        <RequireRole allowedRoles={["student"]}>
          <StudentLayout />
        </RequireRole>
      }>

        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="topic/content/view/:topic_id" element={<TopicContentView />} />
        <Route path="subtopic/content/view/:sub_topic_id" element={<SubTopicContentView />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
        <Route index element={<Dashboard />} />
        <Route path="add-student" element={<AddStudent />} />
        <Route path="my-current-assignment" element={<MyCurrentCourseAssignment />} />
        <Route path="test" element={<StudentTest />} />
      </Route>

      {/* PARENT ROUTES */}
      <Route path="/parent/" element={
        <RequireRole allowedRoles={["parent"]}>
          <ParentLayout />
        </RequireRole>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        { /* parent student routes */}
        <Route path="add-student" element={<AddStudent />} />
        <Route path="my-student-list" element={<MyStudentList />} />
        <Route path="change-password" element={<ChangePassword />} />

        { /* parent student progress routes */}
        <Route path="end-of-report" element={<EndOfReport />} />
        <Route path="course-target-area" element={<MyStudentList />} />
        <Route path="cohort-analysis" element={<ChangePassword />} />
        <Route path="finished-test" element={<ChangePassword />} />
        <Route path="test-scores" element={<TestScores />} />

        { /* parent setting routes */}
        <Route path="settings" element={<Setting />} />
      </Route>

      {/* TUTOR ROUTES */}
      <Route path="/tutor/" element={
        <RequireRole allowedRoles={["tutor"]}>
          <Layout />
        </RequireRole>
      }>
        <Route index element={<Dashboard />} />
      </Route>

      {/* GENERAL AUTH ROUTES (DEFAULT LAYOUT) */}
      <Route path="/" element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="student-pannel" element={<StudentPannel />} />
        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
      </Route>

      {/* FALLBACK - unknown route */}
      <Route path="*" element={<RedirectByRole />} />
    </Routes>
  );
};

export default AppRoutes;
