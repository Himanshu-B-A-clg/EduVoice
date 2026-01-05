import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BookOpen, BarChart3, Users, LogOut, Settings } from 'lucide-react';

const Navigation = () => {
  const { user, logout, isParent } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/reader', label: 'Reader', icon: BookOpen },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  if (isParent) {
    navItems.push({ path: '/parent-dashboard', label: 'Children', icon: Users });
  }

  return (
    <nav className="bg-white shadow-lg border-b-4 border-primary-200" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-10 w-10 text-primary-500" aria-hidden="true" />
              <span className="ml-3 text-2xl font-bold text-primary-600 font-dyslexic">
                EduVoice
              </span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-6 py-2 text-lg font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary-100 hover:text-primary-700'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role} Account
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-xl ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-primary-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
