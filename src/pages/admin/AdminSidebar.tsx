import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { toggleSidebarCollapsed } from '@/store/slices/uiSlice';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Your original Admin Nav Items
const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Companies', href: '/admin/companies', icon: Building2 },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  {name:'Resources',href:'/admin/ManageResources' ,icon:FileText}
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <div className="lg:hidden fixed inset-0 z-40 hidden" />
      
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-slate-900 text-white border-r border-slate-800", // Dark theme for Admin
          "hidden lg:flex flex-col"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg tracking-tight">Admin Portal</h1>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {sidebarCollapsed && (
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          <div className="mb-4">
            {!sidebarCollapsed && (
              <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Management
              </span>
            )}
            <div className="mt-2 space-y-1">
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/admin'}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-slate-800 group",
                      isActive && "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )} />
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
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-slate-800/50",
            sidebarCollapsed && "justify-center"
          )}>
            <div className="w-9 h-9 rounded-full bg-indigo-900 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-200">
              AD
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-white truncate">Administrator</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!sidebarCollapsed && (
                <button 
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-md transition-colors"
                    title="Sign Out"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;