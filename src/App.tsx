import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { BrowseDrives } from './pages/student/BrowseDrives';
import { MyApplications } from './pages/student/MyApplications';
import { StudentProfile } from './pages/student/StudentProfile';

// Coordinator Pages
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { ManageDrives } from './pages/coordinator/ManageDrives';
import { ManageCompanies } from './pages/coordinator/ManageCompanies';
import { ManageStudents } from './pages/coordinator/ManageStudents';
import { ApplicationsReview } from './pages/coordinator/ApplicationsReview';
import { PlacementAnalytics } from './pages/coordinator/PlacementAnalytics';

// 404
import { NotFound } from './pages/NotFound';

// Home Redirection Component based on active user role
const HomeRedirect: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return role === 'placement_officer' 
    ? <Navigate to="/coordinator/dashboard" replace />
    : <Navigate to="/student/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Role-Based Landing Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Student Protected Portal Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="drives" element={<BrowseDrives />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Placement In-Charge / Coordinator Protected Portal Routes */}
          <Route
            path="/coordinator"
            element={
              <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/coordinator/dashboard" replace />} />
            <Route path="dashboard" element={<CoordinatorDashboard />} />
            <Route path="drives" element={<ManageDrives />} />
            <Route path="companies" element={<ManageCompanies />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="applications" element={<ApplicationsReview />} />
            <Route path="analytics" element={<PlacementAnalytics />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
