import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { AppProvider } from './provider/AppProvider'
import Header from './components/Header'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import TutorDashboard from './pages/TutorDashboard'
import StudentDashboard from './pages/StudentDashboard'
import TutorList from './pages/TutorList'
import Booking from './pages/Booking'
import Profile from './pages/Profile'
import { Container } from 'react-bootstrap'

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (user) {
    // Redirect based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'tutor':
        return <Navigate to="/tutor-dashboard" replace />;
      case 'student':
        return <Navigate to="/student-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Container fluid>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/tutors" element={<TutorList />} />

            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Tutor Routes */}
            <Route path="/tutor-dashboard" element={
              <ProtectedRoute allowedRoles={['tutor']}>
                <TutorDashboard />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student-dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/booking/:tutorId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Booking />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}