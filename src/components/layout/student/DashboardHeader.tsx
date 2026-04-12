
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'; // 1. Import Socket.io
import {
  Bell,
  Search,
  Menu,
  X,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail, // New Icon for email
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
// 2. Import addNotification action (You need to add this to your slice)
import { markNotificationRead, markAllNotificationsRead, setSidebarOpen, addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast'; // Assuming you use Shadcn toast
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ModeToggle } from "@/components/mode-toggle";

// --- CONFIG ---
// Replace with your actual Backend URL
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const notificationIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  email: Mail, // Added Email Icon
};

const notificationColors = {
  info: 'text-info bg-info/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  error: 'text-destructive bg-destructive/10',
  email: 'text-blue-600 bg-blue-100', // Added Email Color
};

const DashboardHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast(); // For popup notifications
  const { user } = useAuth();
  
  const { notifications, unreadCount, sidebarOpen } = useAppSelector((state) => state.ui);
  const [searchOpen, setSearchOpen] = useState(false);

  // --- 3. REAL-TIME SOCKET CONNECTION ---
  useEffect(() => {
    if (!user) return;

    // Initialize Socket connection
    const socket = io(SOCKET_URL, {
      query: { userId: user._id } // Pass User ID so backend knows who to send to
    });

    socket.on('connect', () => {
      console.log('Connected to notification service');
    });

    // Listen for 'notification' event from backend
    socket.on('notification', (newNotification) => {
      // 1. Add to Redux Store
      dispatch(addNotification(newNotification));

      // 2. Play Notification Sound (Optional)
      const audio = new Audio('/notification-sound.mp3'); // Place file in public folder
      audio.play().catch(e => console.log("Audio play failed", e));

      // 3. Show Toast Popup
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: newNotification.type === 'error' ? 'destructive' : 'default',
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user, dispatch, toast]);

  // Profile Completion Logic
  const completionPercentage = useMemo(() => {
    if (!user) return 0;
    let filled = 0;
    const totalFields = 6;
    
    if (user.name) filled++;
    if (user.email) filled++;
    if (user.department) filled++;
    if (user.year) filled++;
    if (user.cgpa && user.cgpa > 0) filled++;
    if (user.skills && user.skills.length > 0) filled++;

    return Math.round((filled / totalFields) * 100);
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search drives, companies..."
                className="w-64 lg:w-80 pl-9 bg-secondary/50 border-transparent focus:border-primary focus:bg-background"
              />
            </div>
          </div>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4 mr-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Profile Completion</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full gradient-primary rounded-full"
                  />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>

          <ModeToggle />

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <motion.div
                  // Animate bell when unread count changes
                  key={unreadCount}
                  initial={{ rotate: 0 }}
                  animate={unreadCount > 0 ? { rotate: [0, -20, 20, -20, 20, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.div>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => dispatch(markAllNotificationsRead())}
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Info;
                    // Safe access to color, default to info if type not found
                    const colorClass = notificationColors[notification.type] || notificationColors.info;
                    
                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-3 p-4 cursor-pointer focus:bg-secondary",
                          !notification.read && "bg-primary/5"
                        )}
                        onClick={() => dispatch(markNotificationRead(notification.id))}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          colorClass
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="ghost" className="w-full text-sm">
                      View all notifications
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <div 
            className="flex items-center gap-3 pl-3 border-l border-border cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
            onClick={() => navigate('/dashboard/profile')}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user ? user.name : "Guest User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.department || "Student"}
              </p>
            </div>
            <img
              src={user ? `https://ui-avatars.com/api/?name=${user.name}&background=random` : "https://github.com/shadcn.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search drives, companies..."
                  className="w-full pl-9"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default DashboardHeader;