import { Bell, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AvatarDropdown from './AvatarDropdown';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/dashboard" className="flex items-center ml-2">
              <span className="text-xl font-bold text-indigo-600">AdminPanel</span>
            </Link>
          </div>

          {/* Center - Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-4">
            {/* Mobile search button */}
            <button 
              className="md:hidden p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-6 w-6" />
            </button>

            {/* Notification bell */}
            <button className="hidden md:block p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Avatar Dropdown */}
            <AvatarDropdown />
          </div>
        </div>

        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="md:hidden p-4 border-t border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;