import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white shadow h-16 flex items-center px-4">
      <button
        onClick={toggleSidebar}
        className="text-gray-500 focus:outline-none"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4">
        <h2 className="text-lg font-medium">Trang quản trị</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          title="abc"
        >
          <BellIcon className="h-6 w-6" />
        </button>
        
        {/* More actions can be added here */}
      </div>
    </header>
  );
};

export default Header;