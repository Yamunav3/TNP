
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProfileCompletionModal from "./components/ProfileCompletionModal";
// --- PAGES: AUTH ---
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetPassword from "./pages/authentication/ResetPassword";
import { OAuthSuccess } from "./pages/OAuthSuccess";
import NotFound from "./pages/NotFound";

// --- LAYOUTS ---
import StudentLayout from "./components/layout/student/DashboardLayout"; 
import AdminLayout from "./pages/admin/AdminDashBoard"; // Assuming this is your Admin Layout wrapper

// --- PAGES: STUDENT ---
import StudentOverview from "./pages/student/Dashboard"; 
import DrivesPage from "./pages/student/DrivesPage";
import ApplicationsPage from "./pages/student/ApplicationsPage";
import AnalyticsPage from "./pages/student/AnalyticsPage";
import SchedulePage from "./pages/student/SchedulePage";
import InterviewPrepPage from "./pages/student/InterviewPrepPage";
import ProfilePage from "./pages/student/ProfilePage";
import SettingsPage from "./pages/student/SettingsPage";
import Resources from "./pages/student/Resources";
import AlumniCorner from "./pages/student/AlumniCorner";

// --- PAGES: ADMIN ---
import AdminOverview from "./pages/admin/AdminOverview";
import Students from "./pages/admin/Students";
import Companies from "./pages/admin/Companies";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import ManageResources from "./pages/admin/ManageResources";
import ManageAlumni from "./pages/admin/ManageAlumni";
import AdminProfile from "./pages/admin/Profile";
const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL;

const LoginRedirect = () => {
  const location = useLocation();

  return <Navigate to={`/login/student${location.search}`} replace />;
};

// --- PROTECTED ROUTE WRAPPER ---

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'student' | 'admin' }> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login/student" replace />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* --- AUTH ROUTES --- */}
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/login/student" element={
        isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />
      } />
      <Route path="/login/admin" element={
        isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/auth-success" element={<OAuthSuccess />} />
      
      {/* --- STUDENT ROUTES (Protected) --- */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="student">
          <StudentLayout /> 
        </ProtectedRoute>
      }>
        <Route index element={<StudentOverview />} />
        <Route path="drives" element={<DrivesPage />} />
        <Route path="drives/:id" element={<DrivesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/:id" element={<ApplicationsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="interview-prep" element={<InterviewPrepPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path='resources' element={<Resources />} />
        <Route path='alumni' element={<AlumniCorner />} />
      </Route>
      
      {/* --- ADMIN ROUTES (Protected) --- */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="students" element={<Students />} />
        <Route path="companies" element={<Companies />} />
        <Route path="alumni" element={<ManageAlumni />} />
        <Route path="reports" element={<Reports />} />
        <Route path="manage-resources" element={<ManageResources />} />
        <Route path="ManageResources" element={<Navigate to="/admin/manage-resources" replace />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* --- DEFAULT REDIRECTS --- */}
      <Route path="/" element={<Navigate to="/login/student" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {isAuthenticated && user?.role === 'student' && <ProfileCompletionModal />}
      <AppRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
