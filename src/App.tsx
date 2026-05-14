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

