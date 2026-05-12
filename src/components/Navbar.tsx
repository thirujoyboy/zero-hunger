            <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Zero Hunger
              </span>
            </Link>
          </div>


          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all dark:hover:bg-emerald-900/30"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <>
                <Link
                  to={user.role === 'donor' ? '/donor-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/volunteer-dashboard'}
                  className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  <User className="h-4 w-4 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="hidden sm:block text-xs font-medium text-emerald-900 leading-none truncate max-w-[80px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">
                      {user.role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
                >
                  Get Started
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

