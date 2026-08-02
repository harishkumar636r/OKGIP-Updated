import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { EmployeeManagement } from '../pages/EmployeeManagement';
import { EmployeeProfile } from '../pages/EmployeeProfile';
import { DepartmentManagement } from '../pages/DepartmentManagement';
import { SkillsManagement } from '../pages/SkillsManagement';
import { KnowledgeGapModule } from '../pages/KnowledgeGapModule';
import { TrainingModule } from '../pages/TrainingModule';
import { ReportsModule } from '../pages/ReportsModule';
import { NotificationsPage } from '../pages/NotificationsPage';
import { UserManagement } from '../pages/UserManagement';
import { Settings } from '../pages/Settings';
import { Profile } from '../pages/Profile';
import { AccessDenied } from '../pages/AccessDenied';
import { AiRecommendations } from '../pages/AiRecommendations';
import { Leaderboard } from '../pages/Leaderboard';
import { Messaging } from '../pages/Messaging';
import { LeaveManagement } from '../pages/LeaveManagement';
import { TaskAssignment } from '../pages/TaskAssignment';
import { Assessments } from '../pages/Assessments';
import { Certificates } from '../pages/Certificates';
import { AuditLogs } from '../pages/AuditLogs';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-medium">
        Validating OKGIP JWT Credentials...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <DepartmentManagement />
            </ProtectedRoute>
          }
        />
        <Route path="skills" element={<SkillsManagement />} />
        <Route path="gaps" element={<KnowledgeGapModule />} />
        <Route path="ai-recommendations" element={<AiRecommendations />} />
        <Route path="training" element={<TrainingModule />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="tasks" element={<TaskAssignment />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="messages" element={<Messaging />} />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
              <ReportsModule />
            </ProtectedRoute>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<Profile />} />
        <Route path="access-denied" element={<AccessDenied />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
