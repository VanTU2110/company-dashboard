import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Home,
  Briefcase,
  Users,
  Building,
  LogOut,
  MessageCircleIcon,
  FileWarningIcon,
  Menu,
  X
} from 'lucide-react';
import { logout } from '../../services/authService';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
      pathname === path
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
        : 'hover:bg-white hover:shadow-md text-gray-700 hover:text-blue-600'
    }`;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Lỗi khi gọi logout service:', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/jobs', icon: Briefcase, label: 'Việc làm' },
    { path: '/applications', icon: Users, label: 'Đơn ứng tuyển' },
    { path: '/conversations', icon: MessageCircleIcon, label: 'Tin nhắn' },
    { path: '/warning', icon: FileWarningIcon, label: 'Cảnh báo' },
    { path: '/company-profile', icon: Building, label: 'Công ty' }
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col justify-between shadow-xl transition-all duration-300 ease-in-out relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-10 group"
        type="button"
      >
        <div className="relative">
          {isCollapsed ? (
            <Menu size={16} className="text-white transition-transform duration-300 group-hover:rotate-180" />
          ) : (
            <X size={16} className="text-white transition-transform duration-300 group-hover:rotate-90" />
          )}
        </div>
      </button>

      <div>
        {/* Header */}
        <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-200 transition-all duration-300`}>
          {isCollapsed ? (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building size={20} className="text-white" />
            </div>
          ) : (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Quản trị công ty
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex flex-col ${isCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.path} className="relative">
                <Link to={item.path} className={linkClass(item.path)}>
                  <IconComponent size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
        <div className="relative group">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 ${
              isCollapsed ? 'px-4 py-3 justify-center' : 'px-4 py-3'
            } rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-all duration-300 hover:shadow-md border border-red-200 hover:border-red-300`}
            type="button"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
          
          {/* Tooltip for logout button when collapsed */}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Đăng xuất
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;