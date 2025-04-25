import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/dashboard';
import JobsPage from './pages/jobs';
import ApplicationsPage from './pages/applications';
import CompanyProfilePage from './pages/company';
import LoginPage from './pages/auth/login';
import RegisterCompanyPage from './pages/auth/register';
import CreateCompanyPage from './pages/company/CreateCompanyPage';
import RequireAuth from './components/RequireAuth';
import EditCompany from './pages/company/EditCompany';
import JobDetailPage from './pages/jobs/detailjob';
import CreateJobPage from './pages/jobs/createjob';
import AddSchedulePage from "./pages/jobs/[jobUuid]/schedules/add";
import AddJobSkillPage from "./pages/jobs/[jobUuid]/skills/add";
import { CompanyProvider } from './contexts/CompanyContext';

const App = () => {
  return (
    <Routes>
      {/* Trang đăng nhập không cần xác thực */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-company" element={<RegisterCompanyPage />} />
      
      {/* Chuyển hướng từ root đến dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* Tất cả các trang khác đều yêu cầu xác thực và bọc trong CompanyProvider */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <CompanyProvider>
              <DashboardLayout />
            </CompanyProvider>
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/create" element={<CreateJobPage />} />
        <Route path="/jobs/:uuid" element={<JobDetailPage />} />
        <Route path="/jobs/:jobUuid/schedules/add" element={<AddSchedulePage />} />
        <Route path="/jobs/:jobUuid/skills/add" element={<AddJobSkillPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/company-profile" element={<CompanyProfilePage />} />
        <Route path="/create-company" element={<CreateCompanyPage />} />
        <Route path="/company/edit-company/:uuuuid" element={<EditCompany />} />
      </Route>
    </Routes>
  );
};

export default App;