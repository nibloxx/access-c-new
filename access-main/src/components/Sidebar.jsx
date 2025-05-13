import {
  ChevronLeft,
  ChevronRight,
  Database,
  HelpCircleIcon,
  Laptop,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  UsersIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  //   useEffect(() => {
  //     const handleResize = () => {
  //       setIsMobile(window.innerWidth < 768);
  //       if (window.innerWidth >= 768) {
  //         onClose(); // Close mobile sidebar when resizing to desktop
  //       }
  //     };

  //     handleResize();
  //     window.addEventListener('resize', handleResize);
  //     return () => window.removeEventListener('resize', handleResize);
  //   }, [onClose]);

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/users-management", icon: Users, label: "Users Management" },
    { path: "/roles-management", icon: ShieldCheck, label: "Role Management" },
    {
      path: "/resource-management",
      icon: Database,
      label: "Resource Management",
    },
    {
      path: "/project-management",
      icon: Laptop,
      label: "Project Management",
    },
    {
      path: "/team-management",
      icon: UsersIcon,
      label: "Team Management",
    },
    { path: "/access-log", icon: Database, label: "Access-log" },
    { path: "/faq", icon: HelpCircleIcon, label: "FAQ" },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside
      className={`bg-indigo-700 text-white h-screen fixed md:sticky top-0 z-20 transition-all duration-300 
        ${isMobile ? (isOpen ? "w-64 translate-x-0" : "-translate-x-full") : ""}
        ${!isMobile && (collapsed ? "w-20" : "w-64")}
      `}
    >
      <div className="p-4 flex items-center justify-between border-b border-indigo-600">
        {(!collapsed || isMobile) && (
          <h2 className="text-xl font-bold">AdminPanel</h2>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-indigo-600"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-indigo-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="p-4 h-[calc(100%-120px)] overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={`flex items-center p-3 rounded-lg hover:bg-indigo-600 transition-colors 
                  ${location.pathname === item.path ? "bg-indigo-800" : ""}
                `}
              >
                <item.icon className="w-5 h-5" />
                {(!collapsed || isMobile) && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-indigo-600">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 w-full rounded-lg hover:bg-indigo-600"
        >
          <LogOut className="w-5 h-5" />
          {(!collapsed || isMobile) && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
