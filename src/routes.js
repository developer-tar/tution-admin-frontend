// ================= IMPORTS =================
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

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
import TimeSlots from "./pages/Course/CourseTimeSlot";

import AdminLayout from "./pages/Layout/AdminLayout";
import Layout from "./pages/Layout/Layout";
import ParentLayout from "./pages/Layout/ParentLayout";
import StudentLayout from "./pages/Layout/StudentLayout";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Student/Dashboard";
import StudentDashboard from "./pages/Student/Dashboard";
import StudentAnnouncements from "./pages/Student/Announcements";
import StudentCertificates from "./pages/Student/Certificates";
import StudentTest from "./pages/Student/StudentTest";
import MyCourseTest from "./pages/Student/Homework/MyCourseTest";
import MyCourseVideo from "./pages/Student/Video/MyCourseVideo";
import MyCourseView from "./pages/Student/Video/MyCourseView";
import MyCourseVideoPage from "./pages/MyCourseVideoPage";
import VideoLessonsPage from "./pages/VideoLessonsPage";

import SubTopicContentView from "./pages/Student/SubTopicContentView";
import SubTopicTest from "./pages/Student/SubTopicTest";
import TopicTest from "./pages/Student/TopicTest";
import TopicContentView from "./pages/Student/TopicContentView";

import StudentPannel from "./pages/StudentPannel";

// Mock Exam
import MockExamCategory from "./pages/MockExam/MockExamCategory";
import MockExam from "./pages/MockExam/MockExam";
import PaperExtract from "./pages/MockExam/PaperExtract";

// Paper
import Paper from "./pages/Paper/Paper";

// Master Form
import MasterForm from "./pages/MasterForm/MasterForm";

// Admin
import ParentList from "./pages/Admin/ParentList";
import ParentBilling from "./pages/Admin/ParentBilling";
import AdminPaperPurchases from "./pages/Admin/PaperPurchases";
import Announcements from "./pages/Admin/Announcements";
import Awards from "./pages/Admin/Awards";
import Certificates from "./pages/Admin/Certificates";

// Admin Student
import StudentList from "./pages/Admin/Student/StudentList";
import StudentForm from "./pages/Admin/Student/StudentForm";
import StudentDetails from "./pages/Admin/Student/StudentDetails";

// Parent
import Billing from "./pages/Parent/Billing/Billing";
import ParentPaperPurchases from "./pages/Parent/PaperPurchases";
import BillingInformation from "./pages/Parent/BillingInformation";
import AddStudent from "./pages/Parent/Student/AddStudent";
import EditStudent from "./pages/Parent/Student/EditStudent";
import ChangePassword from "./pages/Parent/Student/ChangePassword";
import MyStudentList from "./pages/Parent/Student/MyStudentList";
import ParentDashboard from "./pages/Parent/Dashboard";
import ParentAnnouncements from "./pages/Parent/Announcements";
import ParentCertificates from "./pages/Parent/Certificates";
import EndOfReport from "./pages/Parent/Progress/EndOfReport";
import FinishedTest from "./pages/Parent/Progress/FinishedTest";
import Setting from "./pages/Parent/Setting";
import CourseTargetArea from "./pages/Parent/Progress/CourseTargetArea";
import TestScores from "./pages/Parent/Progress/TestScores";

import MyCurrentCourseAssignment from "./pages/Student/MyCurrentCourseAssignment";

// 404
import NotFound from "./pages/NotFound";


// ============ AUTH GUARDS ============

// Redirect via window.location to avoid "The operation is insecure" from history.push
const SafeRedirect = ({ to }) => {
  const location = useLocation();
  useEffect(() => {
    const targetPath = to.startsWith("/") ? to : `/${to}`;
    const currentPath = location.pathname.replace(/\/$/, "") || "/";
    const normalizedTarget = targetPath.replace(/\/$/, "") || "/";
    if (currentPath !== normalizedTarget) {
      window.location.replace(to);
    }
  }, [to, location.pathname]);
  return null;
};

// General Protected Route
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <SafeRedirect to="/login" />;
};

// Admin Protected Route
const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return token && role === "admin"
    ? children
    : <SafeRedirect to="/login" />;
};

// Role-Based Route (student, tutor, parent)
const RequireRole = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <SafeRedirect to="/login" />;
  return allowedRoles.includes(role)
    ? children
    : <SafeRedirect to="/login" />;
};

// Guest Route - blocks access if already logged in
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    switch (role) {
      case "student":
        return <SafeRedirect to="/student" />;
      case "parent":
        return <SafeRedirect to="/parent/" />;
      case "tutor":
        return <SafeRedirect to="/tutor" />;
      case "admin":
        return <SafeRedirect to="/admin/course-list" />;
      default:
        // Unknown/stale role: clear and show login to avoid redirect loop with "/"
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userData");
        return children;
    }
  }

  return children;
};


// Redirect users to their main dashboard
const RedirectByRole = () => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  // No token: go to login (no redirect loop; /login will show Login)
  if (!token) return <SafeRedirect to="/login" />;
  switch (role) {
    case "student":
      return <SafeRedirect to="/student" />;
    case "parent":
      return <SafeRedirect to="/parent" />;
    case "tutor":
      return <SafeRedirect to="/tutor" />;
    case "admin":
    case "Admin":
      return <SafeRedirect to="/admin/course-list" />;
    default:
      return <SafeRedirect to="/login" />;
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
        <Route path="course/:id?" element={<Course />} />
        <Route path="course-assignment/:id?" element={<CourseAssignment />} />
        <Route path="course-content/:type?/:id?" element={<CourseContent />} />
        <Route path="course-test/:id?" element={<CourseTest />} />
        <Route path="course-list" element={<CourseList />} />
        <Route path="timeslot" element={<TimeSlots />} />
        <Route path="assignment-list" element={<CourseAssignmentList />} />
        <Route path="topic/subtopic-list" element={<TopicSubtopicList />} />
        <Route path="test-list" element={<TestList />} />
        <Route path="course-report" element={<CourseReport />} />
        <Route path="mock-exam-categories" element={<MockExamCategory />} />
        <Route path="mock-exams" element={<MockExam />} />
        <Route path="mock-exams/billing" element={<ParentList />} />
        <Route path="mock-exams/paper-extract" element={<PaperExtract />} />
        {/* <Route path="paper-categories" element={<PaperCategory />} /> */}
        <Route path="papers" element={<Paper />} />
        <Route path="papers/billing" element={<AdminPaperPurchases />} />
        <Route path="master-forms" element={<MasterForm />} />
        
        {/* Admin Student Management Routes */}
        <Route path="students" element={<StudentList />} />
        <Route path="student/add" element={<StudentForm />} />
        <Route path="student/:id/edit" element={<StudentForm />} />
        <Route path="student/:id" element={<StudentDetails />} />
        
        {/* Admin Parent Management Routes */}
        <Route path="parents" element={<ParentList />} />
        <Route path="billing" element={<ParentList />} /> {/* Reusing ParentList as entry point for Billing */}
        <Route path="course/billing" element={<ParentList />} /> {/* Course Billing submenu */}
        <Route path="parent/:parentId/billing" element={<ParentBilling />} />
        
        {/* Admin Announcements Routes */}
        <Route path="announcements" element={<Announcements />} />
        
        {/* Admin Awards Routes */}
        <Route path="awards" element={<Awards />} />
        
        {/* Admin Certificates Routes */}
        <Route path="certificates" element={<Certificates />} />
      </Route>

      {/* STUDENT ROUTES */}
      <Route path="student" element={
        <RequireRole allowedRoles={["student"]}>
          <StudentLayout />
        </RequireRole>
      }>
        <Route index element={<StudentDashboard />} />  
        { /*student announcements route */}
        <Route path="announcements" element={<StudentAnnouncements />} />
        { /*student certificates route */}
        <Route path="certificates" element={<StudentCertificates />} />
        { /*student homework routes */}
        <Route path="my-course-test" element={<MyCourseTest />} />
        <Route path="course-target-area" element={<MyStudentList />} />
        <Route path="test-scores" element={<TestScores />} />
        <Route path="finished-test" element={<FinishedTest />} />
       
        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="topic/content/view/:topic_id" element={<TopicContentView />} />
        <Route path="topic/test/:test_id" element={<TopicTest />} />
        <Route path="subtopic/content/view/:sub_topic_id" element={<SubTopicContentView />} />
        <Route path="subtopic/test/:sub_topic_test_id" element={<SubTopicTest />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
        
        <Route path="add-student" element={<AddStudent />} />
        <Route path="my-current-assignment" element={<MyCurrentCourseAssignment />} />
        <Route path="test" element={<StudentTest />} />
        { /*student video routes */}
        <Route path="my-course-video" element={<MyCourseVideo />} />
        <Route path="my-course-view" element={<MyCourseView />} />
      </Route>

      {/* PARENT ROUTES */}
      <Route path="/parent" element={
        <RequireRole allowedRoles={["parent"]}>
          <ParentLayout />
        </RequireRole>
      }>
       <Route index element={<ParentDashboard />} /> 
        { /* parent announcements route */}
        <Route path="announcements" element={<ParentAnnouncements />} />
        { /* parent certificates route */}
        <Route path="certificates" element={<ParentCertificates />} />
        { /* parent student routes */}
        <Route path="add-student" element={<AddStudent />} />
        <Route path="edit-student/:studentId" element={<EditStudent />} />
        <Route path="my-student-list" element={<MyStudentList />} />
        <Route path="change-password" element={<ChangePassword />} />

        {/* Billing Routes */}
        <Route path="billing" element={<SafeRedirect to="/parent/billing/course" />} />
        <Route path="billing/course" element={<Billing />} />
        <Route path="billing/mock" element={<Billing />} />
        <Route path="billing/paper" element={<Billing />} />
        <Route path="billing-information" element={<BillingInformation />} />

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

      {/* ROOT ROUTE - REDIRECT BY ROLE */}
      <Route path="/" element={<RedirectByRole />} />

      {/* GENERAL AUTH ROUTES (DEFAULT LAYOUT) - FOR BACKWARD COMPATIBILITY */}
      <Route path="/general" element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="student-pannel" element={<StudentPannel />} />
        <Route path="videos" element={<VideoLessonsPage />} />
        <Route path="my-course-video-page" element={<MyCourseVideoPage />} />
      </Route>

      {/* FALLBACK - 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
