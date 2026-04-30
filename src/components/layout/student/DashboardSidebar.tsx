import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  Calendar,
  User,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BarChart,
  LogOut,
  FileText,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { toggleSidebarCollapsed, setSidebarOpen } from '@/store/slices/uiSlice';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// --- NAVIGATION LINKS ---
const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Drives', href: '/dashboard/drives', icon: Briefcase },
  { name: 'Applications', href: '/dashboard/applications', icon: ClipboardList },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Interview Prep', href: '/dashboard/interview-prep', icon: BarChart },
  { name: 'Resources', href: '/dashboard/resources', icon: FileText }
];

// const accountNavigation = [
//   { name: 'Profile', href: '/dashboard/profile', icon: User },
//   { name: 'Settings', href: '/dashboard/settings', icon: Settings },
// ];

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, sidebarOpen } = useAppSelector((state) => state.ui);
  const { profile } = useAppSelector((state) => state.profile);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      {/* Mobile overlay (visible when sidebarOpen on small screens) */}
      <div
        className={cn(
          sidebarOpen ? 'fixed inset-0 z-40 bg-black/40 lg:hidden' : 'hidden'
        )}
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 h-screen w-64 bg-slate-900 text-white border-r border-slate-800 lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg tracking-tight">TNP Portal</h1>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-300 hover:text-white"
                onClick={() => dispatch(setSidebarOpen(false))}
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* reuse nav content */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
              <div className="mb-4">
                <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</span>
                <div className="mt-2 space-y-1">
                  {mainNavigation.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/dashboard'}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          "hover:bg-slate-800 group text-slate-400 hover:text-white",
                          isActive && "bg-violet-600 text-white hover:bg-violet-700 shadow-md"
                        )}
                        onClick={() => dispatch(setSidebarOpen(false))}
                      >
                        <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                        <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-red-900/20 group text-slate-400 hover:text-red-400 mt-2"
                  )}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>
                </button>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop / large sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-slate-900 text-white border-r border-slate-800",
          "hidden lg:flex flex-col"
        )}
      >
        {/* --- LOGO AREA --- */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                {/* Violet Accent for Student */}
                <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg tracking-tight">TNP Portal</h1>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {sidebarCollapsed && (
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center mx-auto">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* --- NAVIGATION --- */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          
          {/* Main Section */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Main
              </span>
            )}
            <div className="mt-2 space-y-1">
              {mainNavigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/dashboard'}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-slate-800 group text-slate-400 hover:text-white",
                      isActive && "bg-violet-600 text-white hover:bg-violet-700 shadow-md"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                    <AnimatePresence mode="wait">
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium text-sm whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Account Section */}
          <div className="pt-4 border-t border-slate-800">
            {!sidebarCollapsed && (
              <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Account
              </span>
            )}
            

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-red-900/20 group text-slate-400 hover:text-red-400 mt-2"
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
       
        </nav>

        {/* --- USER PROFILE FOOTER --- */}
        {/* <div className="p-3 border-t border-slate-800">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-slate-800/50",
            sidebarCollapsed && "justify-center"
          )}>
            <img
              src={profile?.personalInfo?.avatar || "https://github.com/shadcn.png"}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-slate-600"
            />
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.personalInfo?.firstName || "User"} {profile?.personalInfo?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {profile?.academicInfo?.rollNumber || "Student ID"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div> */}

        {/* --- COLLAPSE BUTTON --- */}
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;