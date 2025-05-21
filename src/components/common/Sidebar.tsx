import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Users,
  Building,
  LogOut,
  MessageCircleIcon,
  FileWarningIcon
} from 'lucide-react';
import { logout } from '../../services/authService';
const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
      pathname === path
        ? 'bg-white text-blue-600 shadow-sm font-semibold'
        : 'hover:bg-gray-100 text-gray-700'
    }`;

    const handleLogout = async () => {
      try {
        await logout(); // Gọi API để backend xử lý đăng xuất
      } catch (error) {
        console.error('Lỗi khi gọi logout service:', error);
        // Có thể toast.warning('Không thể kết nối máy chủ') nếu muốn
      } finally {
        localStorage.removeItem('token'); // Xóa token phía frontend
        navigate('/login'); // Điều hướng về trang đăng nhập
      }
    };
    
  return (
    <aside className="w-64 h-screen bg-[#f9fafb] border-r flex flex-col justify-between shadow-sm">
      <div>
        <div className="p-6 text-2xl font-bold border-b border-gray-200 text-gray-800">
          Quản trị công ty
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <Home size={20} /> <span>Dashboard</span>
          </Link>
          <Link to="/jobs" className={linkClass('/jobs')}>
            <Briefcase size={20} /> <span>Việc làm</span>
          </Link>
          <Link to="/applications" className={linkClass('/applications')}>
            <Users size={20} /> <span>Đơn ứng tuyển</span>
          </Link>
          <Link to="/conversations" className={linkClass('/conversations')}>
            <MessageCircleIcon size={20} /> <span>Tin nhắn</span>
          </Link>
          <Link to="/warning" className={linkClass('/warning')}>
            <FileWarningIcon size={20} /> <span>Cảnh báo</span>
          </Link>
          <Link to="/company-profile" className={linkClass('/company-profile')}>
            <Building size={20} /> <span>Công ty</span>
          </Link>
          
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full bg-sky-50 flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 font-medium transition-all duration-200"
          type="button"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
