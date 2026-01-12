

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Menu, LogOut, User as UserIcon, Settings, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';
import { io } from 'socket.io-client'; // Import socket.io

// Hooks & Contexts
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/contexts/AuthContext';
import { toggleSidebar, setGlobalSearch } from '@/store/slices/uiSlice';
import { addAdminNotification } from '@/store/slices/adminSlice'; // Action we will create
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminSidebar from './AdminSidebar';

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Redux State
  const { sidebarCollapsed, globalSearch } = useAppSelector((state) => state.ui);
  // Get real notifications from Redux
  const { notifications } = useAppSelector((state) => state.admin || { notifications: [] });

  // Local State
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- 1. REAL-TIME NOTIFICATION LISTENER ---
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // Connect to Backend Socket
    const socket = io('http://localhost:5000', {
      query: { 
        userId: user._id,
        role: user.role // Important: Tells server to add us to 'admins' room
      }
    });

    // Listen for 'adminNotification' event from server
    socket.on('adminNotification', (notification) => {
      // 1. Add to Redux Store
      dispatch(addAdminNotification(notification));
      
      // 2. Play Sound (Optional)
      const audio = new Audio('/notification.mp3'); 
      audio.play().catch(() => {});

      // 3. Show Toast Popup
      toast({
        title: notification.title,
        description: notification.message,
        className: "bg-white border-l-4 border-blue-500"
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, dispatch, toast]);

  // --- 2. DYNAMIC TITLE LOGIC ---
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titleMap: Record<string, string> = {
      'admin': 'Dashboard Overview',
      'students': 'Student Management',
      'drives': 'Recruitment Drives',
      'analytics': 'Placement Analytics',
      'settings': 'System Settings'
    };
    return titleMap[path || ''] || (path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard');
  };

  // --- 3. HANDLERS ---
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setGlobalSearch(e.target.value)); 
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
      <AdminSidebar />

      <motion.div 
        className="flex-1 flex flex-col h-full transition-all duration-300"
        animate={{ marginLeft: sidebarCollapsed ? 80 : 256 }} 
        initial={false}
      >
        {/* --- HEADER --- */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          
          <div className="flex items-center gap-6 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(toggleSidebar())}>
              <Menu className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex flex-col">
              <h2 className="text-lg font-bold text-slate-800">{getPageTitle()}</h2>
              <span className="text-xs text-slate-500">Welcome, {user?.name}</span>
            </div>

            {/* <div className={`relative w-full max-w-md hidden md:block transition-all ${isSearchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={globalSearch}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search..." 
                className="pl-10 bg-slate-100/50 border-transparent focus:bg-white"
              />
            </div> */}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications ({unreadCount} New)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map((n: any, i: number) => (
                      <DropdownMenuItem key={i} className="cursor-pointer p-3 flex flex-col items-start">
                         <span className="font-medium text-sm">{n.title}</span>
                         <span className="text-xs text-slate-500">{n.message}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 rounded-full pl-1 pr-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/admin/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50/50 relative">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
               <Outlet />
             </motion.div>
           </AnimatePresence>
        </main>

      </motion.div>
    </div>
  );
};

export default AdminDashboard;