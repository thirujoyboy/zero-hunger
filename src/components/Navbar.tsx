import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { LogOut, User, Leaf, LayoutDashboard, Sun, Moon } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
          if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                  setIsDark(true);
          }
    }, []);

    const toggleTheme = () => {
          if (isDark) {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
          } else {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
          }
          setIsDark(!isDark);
    };

    const handleLogout = () => {
          logout();
          navigate('/');
    };

    return (
          <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                                  <div className="flex">
                                              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                                            <Leaf className="h-8 w-8 text-emerald-600" />
                                                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                                            Zero Hunger
                                                            </span>span>
                                              </Link>Link>
                                  </div>div>
                        
                                  <div className="flex items-center gap-2 sm:gap-4">
                                              <button
                                                              onClick={toggleTheme}
                                                              className="p-1 sm:p-2 text-gray-500 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all dark:hover:bg-emerald-900/30"
                                                              aria-label="Toggle theme"
                                                            >
                                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                              </button>button>
                                    {user ? (
                          <>
                                          <Link
                                                              to={user.role === 'donor' ? '/donor-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/volunteer-dashboard'}
                                                              className="flex items-center gap-1 p-1 sm:p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                                                            >
                                                            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4" />
                                                            <span className="hidden md:inline">Dashboard</span>span>
                                          </Link>Link>
                                          <Link
                                                              to="/profile"
                                                              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                                            >
                                                            <User className="h-4 w-4 text-emerald-600" />
                                                            <span className="hidden sm:block text-sm font-medium text-emerald-800 truncate max-w-[80px] lg:max-w-[150px]">{user.name}</span>span>
                                                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-500 font-bold">{user.role}</span>span>
                                          </Link>Link>
                                          <button
                                                              onClick={handleLogout}
                                                              className="flex items-center gap-1 p-1 sm:p-2 text-gray-600 hover:text-red-600 transition-colors"
                                                            >
                                                            <LogOut className="h-5 w-5 sm:h-4 sm:w-4" />
                                                            <span className="hidden md:inline">Logout</span>span>
                                          </button>button>
                          </>>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-2">
                                          <Link
                                                              to="/login"
                                                              className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                                                            >
                                                            Login
                                          </Link>Link>
                                          <Link
                                                              to="/register"
                                                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
                                                            >
                                                            Get Started
                                          </Link>Link>
                          </div>div>
                                              )}
                                  </div>div>
                        </div>div>
                </div>div>
          </nav>nav>
        );
};

export default Navbar;</></nav>
