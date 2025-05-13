import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/Profile";
import NotFound from "./pages/NotFound";
import User from "./pages/users/User";
import RoleManagement from "./pages/role/RoleManagement";
import ResourceManagement from "./pages/resource-management/ResourceManagement";
import AccessLog from "./pages/access-logs/AccessLog";
import FAQ from "./pages/faq/FAQ";
import UserProfile from "./pages/user-profile/UserProfile";
import ProjectManagement from "./pages/project-management/ProjectManagement";
import TeamManagement from "./pages/team-management/TeamManagement";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to /dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users-management" element={<User />} />
          <Route path="/roles-management" element={<RoleManagement />} />
          <Route path="/resource-management" element={<ResourceManagement />} />
          <Route path="/project-management" element={<ProjectManagement />} />
          <Route path="/team-management" element={<TeamManagement />} />
          <Route path="/access-log" element={<AccessLog />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user-profile" element={<UserProfile />} />


        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
