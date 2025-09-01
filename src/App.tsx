import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import Header from './components/layout/Header';
import LandingPage from './components/public/LandingPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AdminLogin from './components/auth/AdminLogin';
import Dashboard from './components/dashboard/Dashboard';
import IssuerDashboard from './components/issuer/IssuerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import VerifyDocument from './components/verifier/VerifyDocument';
import UnauthorizedPage from './components/common/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/verify" element={<VerifyDocument />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Header />
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/issuer/*"
              element={
                <AuthGuard requiredRole="issuer">
                  <Header />
                  <IssuerDashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AuthGuard requiredRole="admin">
                  <AdminDashboard />
                </AuthGuard>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;