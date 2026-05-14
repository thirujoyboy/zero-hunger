import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DonorDashboard from './pages/DonorDashboard.tsx';
import VolunteerDashboard from './pages/VolunteerDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { UserRole } from './types.ts';

const PrivateRoute = ({ children, role }: { children: ReactNode, role: UserRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  if (user) return <Navigate to="/" />;

  return <>{children}</>;
};

function AppRoutes() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin-dashboard';

  return (
    <>
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          
          <Route 
            path="/donor-dashboard" 
            element={
              <PrivateRoute role={UserRole.DONOR}>
                <DonorDashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/volunteer-dashboard" 
            element={
              <PrivateRoute role={UserRole.VOLUNTEER}>
                <VolunteerDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/admin-dashboard" 
            element={
              <PrivateRoute role={UserRole.ADMIN}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      {!isAdminPage && (
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500 text-sm">© 2024 Zero Hunger. Making the world better, one delivery at a time.</p>
          </div>
        </footer>
      )}
    </>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
