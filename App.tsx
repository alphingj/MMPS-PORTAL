import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './types';

// Public Pages
import HomePage from './pages/public/HomePage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import TransportPage from './pages/public/TransportPage';

// Auth Page
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageEvents from './pages/admin/ManageEvents';
import ManageExams from './pages/admin/ManageExams';
import ManageAttendance from './pages/admin/ManageAttendance';
import ManageTransport from './pages/admin/ManageTransport';
import ViewResults from './pages/admin/ViewResults';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherResults from './pages/teacher/TeacherResults';

// Student Page
import StudentDashboard from './pages/student/StudentDashboard';


const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/login/:role" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[Role.Admin]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/teachers" element={<ManageTeachers />} />
            <Route path="/admin/announcements" element={<ManageAnnouncements />} />
            <Route path="/admin/events" element={<ManageEvents />} />
            <Route path="/admin/exams" element={<ManageExams />} />
            <Route path="/admin/attendance" element={<ManageAttendance />} />
            <Route path="/admin/transport" element={<ManageTransport />} />
            <Route path="/admin/results" element={<ViewResults />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={[Role.Teacher]} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/exams" element={<TeacherExams />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/teacher/results" element={<TeacherResults />} />
        </Route>

        {/* Student Routes */}
         <Route element={<ProtectedRoute allowedRoles={[Role.Student]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

      </Route>
    </Routes>
  );
};

export default App;