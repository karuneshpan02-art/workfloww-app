import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import Employees from './pages/Employees.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <Router>
      <AppNavbar />

      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Employees Page (FIXED ROUTE) */}
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute role="Admin">
              <Employees />
            </ProtectedRoute>
          }
        />

        {/* User Dashboard */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="Employee">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}