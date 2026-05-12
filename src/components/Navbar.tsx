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
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
              <Leaf className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                Zero Hunger
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all dark:hover:bg-emerald-900/30"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                <div className="hidden xs:flex flex-col items-end mr-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-1.5 sm:p-2 text-gray-500 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all dark:hover:bg-emerald-900/30"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}

                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <User className="h-5 w-5" />
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-1 p-1.5 sm:p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-all dark:hover:bg-red-900/30"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm hover:shadow-emerald-200 dark:hover:shadow-none"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
