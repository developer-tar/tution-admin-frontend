<<<<<<< HEAD
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
    </Routes>
  );
};

export default AppRoutes;
=======
import { Navigate, Route, Routes } from "react-router-dom";

// Pages
import AdminLogin from "./pages/Adminlogin";
import Course from "./pages/Course/Course";
import CourseAssignment from "./pages/Course/CourseAssignment";
import CourseAssignmentList from "./pages/Course/CourseAssignmentList";
import CourseContent from "./pages/Course/CourseContent";
import CourseList from "./pages/Course/CourseList";
import CourseReport from "./pages/Course/CourseReport";
import CourseTest from "./pages/Course/CourseTest";
import TestList from "./pages/Course/TestList";
import TopicSubtopicList from "./pages/Course/TopicList";
import AdminLayout from "./pages/Layout/AdminLayout";
import Layout from "./pages/Layout/Layout";
import ParentLayout from "./pages/Layout/ParentLayout";
import StudentLayout from "./pages/Layout/StudentLayout";
import Login from "./pages/Login";
import MyCourseVideoPage from "./pages/MyCourseVideoPage";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Student/Dashboard";
import MyCurrentCourseAssignment from "./pages/Student/MyCurrentCourseAssignment";
import StudentTest from "./pages/Student/StudentTest";
import SubTopicContentView from "./pages/Student/SubTopicContentView";
import TopicContentView from "./pages/Student/TopicContentView";
import StudentPannel from "./pages/StudentPannel";
import VideoLessonsPage from "./pages/VideoLessonsPage";
import TimeSlots from "./pages/Course/CourseTimeSlot";

//============ START PARENT ROUTING ============
// student routes
import AddStudent from "./pages/Parent/Student/AddStudent";
import ChangePassword from "./pages/Parent/Student/ChangePassword";
import MyStudentList from "./pages/Parent/Student/MyStudentList";

import TestScores from "./pages/Parent/Progress/TestScores";
//setting route
import ParentDashboard from "./pages/Parent/Dashboard";
import EndOfReport from "./pages/Parent/Progress/EndOfReport";
import FinishedTest from "./pages/Parent/Progress/FinishedTest";
import Setting from "./pages/Parent/Setting";
import CourseTargetArea from "./pages/Parent/Progress/CourseTargetArea";
//============ END PARENT ROUTING ============

//============ STUDENT ============
//dashboard route
import StudentDashboard from "./pages/Student/Dashboard";
//homework route
import MyCourseTest from "./pages/Student/Homework/MyCourseTest";

//videos route
import MyCourseVideo from "./pages/Student/Video/MyCourseVideo";
import MyCourseView from "./pages/Student/Video/MyCourseView";
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
        return <Navigate to="/parent/" />;
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
      return <Navigate to="/parent/" />;
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
        <Route path="timeslot" element={<TimeSlots />} />
        <Route path="assignment-list" element={<CourseAssignmentList />} />
        <Route path="topicsubtopic-list" element={<TopicSubtopicList />} />
        <Route path="test-list" element={<TestList />} />
        <Route path="course-report" element={<CourseReport />} />
      </Route>

      {/* STUDENT ROUTES */}
      <Route path="student" element={
        <RequireRole allowedRoles={["student"]}>
          <StudentLayout />
        </RequireRole>
      }>
        <Route index element={<StudentDashboard />} />  
        { /*student homework routes */}
        <Route path="my-course-test" element={<MyCourseTest />} />
        <Route path="course-target-area" element={<MyStudentList />} />
        <Route path="test-scores" element={<TestScores />} />
        <Route path="finished-test" element={<FinishedTest />} />
       
        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="topic/content/view/:topic_id" element={<TopicContentView />} />
        <Route path="subtopic/content/view/:sub_topic_id" element={<SubTopicContentView />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
        
        <Route path="add-student" element={<AddStudent />} />
        <Route path="my-current-assignment" element={<MyCurrentCourseAssignment />} />
        <Route path="test" element={<StudentTest />} />
        { /*student video routes */}
        <Route path="my-course-video" element={<MyCourseVideo />} />
        <Route path="my-course-view" element={<MyCourseView />} />
      </Route>

      {/* PARENT ROUTES */}
      <Route path="/parent/" element={
        <RequireRole allowedRoles={["parent"]}>
          <ParentLayout />
        </RequireRole>
      }>
       <Route index element={<ParentDashboard />} /> 
        { /* parent student routes */}
        <Route path="add-student" element={<AddStudent />} />
        <Route path="my-student-list" element={<MyStudentList />} />
        <Route path="change-password" element={<ChangePassword />} />

        { /* parent student progress routes */}
        <Route path="end-of-report" element={<EndOfReport />} />
        <Route path="test-scores" element={<TestScores />} />
        <Route path="finished-test" element={<FinishedTest />} />
        <Route path="course-target-area" element={<CourseTargetArea />} />


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
>>>>>>> master
