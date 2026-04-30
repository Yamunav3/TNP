
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { io } from 'socket.io-client';
// --- PAGES: AUTH ---
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetPassword from "./pages/authentication/ResetPassword";
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

// --- PAGES: ADMIN ---
import AdminOverview from "./pages/admin/AdminOverview";
import Students from "./pages/admin/Students";
import Companies from "./pages/admin/Companies";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import ManageResources from "./pages/admin/ManageResources";
const queryClient = new QueryClient();

// --- PROTECTED ROUTE WRAPPER ---

// Typical path: src/context/SocketContext.tsx


// You would replace the existing connection logic with your specific config:
const socket = io('http://localhost:5002', {
  query: {
    userId: 'admin-static-id', 
    role: 'admin'
  },
  transports: ['websocket'], 
  reconnectionAttempts: 5
});


const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'student' | 'admin' }> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
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
        <Route path="reports" element={<Reports />} />
        <Route path="ManageResources" element={<ManageResources />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* --- DEFAULT REDIRECTS --- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;