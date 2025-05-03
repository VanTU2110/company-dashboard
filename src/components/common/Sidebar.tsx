import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Users, Building, LogOut,MessageCircleIcon } from 'lucide-react';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const linkClass = (path: string) =>
    `flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition ${
      pathname === path ? 'bg-gray-200 font-semibold' : ''
    }`;

  const handleLogout = () => {
    localStorage.removeItem('useruuid');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white border-r h-full flex flex-col justify-between">
      <div>
        <div className="p-6 font-bold text-2xl border-b border-gray-200">Company Panel</div>
        <nav className="flex flex-col p-4 space-y-3">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/jobs" className={linkClass('/jobs')}>
            <Briefcase size={20} /> Việc làm
          </Link>
          <Link to="/applications" className={linkClass('/applications')}>
            <Users size={20} /> Đơn ứng tuyển
          </Link>
          <Link to="/company-profile" className={linkClass('/company-profile')}>
            <Building size={20} /> Công ty
          </Link>
          <Link to="/conversations" className={linkClass('/conversations')}>
            <MessageCircleIcon size={20} /> Tin nhắn
          </Link>

        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-red-100 text-red-600 font-semibold transition"
          type="button"
        >
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
