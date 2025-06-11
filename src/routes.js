import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import AdminLogin from "./pages/Adminlogin";
import Dashboard from "./pages/Dashboard";
import Course from "./pages/Course/Course";
import CourseAssignment from "./pages/Course/CourseAssignment";
import CourseContent from "./pages/Course/CourseContent";
import CourseTest from "./pages/Course/CourseTest";
import CourseList from "./pages/Course/CourseList";
import CourseAssignmentList from "./pages/Course/CourseAssignmentList";
import TopicSubtopicList from "./pages/Course/TopicList";
import TestList from "./pages/Course/TestList";
import CourseReport from "./pages/Course/CourseReport";
import Layout from "./pages/Layout";
import AdminLayout from "./pages/AdminLayout";
import StudentLayout from "./pages/StudentLayout";
import ParentLayout from "./pages/ParentLayout";
import StudentPannel from "./pages/StudentPannel";
import TuitionDetailsPage from "./pages/TuitionDetailsPage";
import VideoLessonsPage from "./pages/VideoLessonsPage";
import MyCourseVideoPage from "./pages/MyCourseVideoPage";

//  General User Auth Check
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

//  Admin Auth Check
const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token && role === "Admin" ? children : <Navigate to="/admin-login" />;
};
//Parent Auth Check
const RequireRole = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  return allowedRoles.includes(role) ? children : <Navigate to="/login" />;
};
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
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

      {/*  General User Protected Routes (if needed) */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="student-pannel" element={<StudentPannel />} />
        <Route path="tuition-details" element={<TuitionDetailsPage />} />
        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
        {/* You can add more general user routes here if needed */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin-login" />} />

      <Route
        path="/student"
        element={
          <RequireRole allowedRoles={["Student"]}>
            <StudentLayout />
          </RequireRole>
        }
      >
        <Route index element={<StudentPannel />} />
        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
      </Route>

      <Route
        path="/parent"
        element={
          <RequireRole allowedRoles={["Parent"]}>
            <ParentLayout />
          </RequireRole>
        }
      >
        <Route index element={<TuitionDetailsPage />} />
      </Route>

      <Route
        path="/tutor"
        element={
          <RequireRole allowedRoles={["Tutor"]}>
            <Layout />
          </RequireRole>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
