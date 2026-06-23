
// import React, { useState, useMemo, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { io } from 'socket.io-client'; // 1. Import Socket.io
// import {
//   Bell,
//   Search,
//   Menu,
//   X,
//   CheckCheck,
//   Info,
//   AlertTriangle,
//   CheckCircle2,
//   XCircle,
//   Mail,
//   Link, // New Icon for email
// } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
// // 2. Import addNotification action (You need to add this to your slice)
// import { markNotificationRead, markAllNotificationsRead, setSidebarOpen, addNotification } from '@/store/slices/uiSlice';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useToast } from '@/hooks/use-toast'; // Assuming you use Shadcn toast
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from '@/components/ui/dropdown-menu';
// // global search removed
// import { cn } from '@/lib/utils';
// import { formatDistanceToNow } from 'date-fns';
// import { ModeToggle } from "@/components/mode-toggle";

// // --- CONFIG ---
// // Replace with your actual Backend URL
// const SOCKET_URL = import.meta.env.VITE_API_URL;

// const notificationIcons = {
//   info: Info,
//   success: CheckCircle2,
//   warning: AlertTriangle,
//   error: XCircle,
//   email: Mail, // Added Email Icon
// };

// const notificationColors = {
//   info: 'text-info bg-info/10',
//   success: 'text-success bg-success/10',
//   warning: 'text-warning bg-warning/10',
//   error: 'text-destructive bg-destructive/10',
//   email: 'text-blue-600 bg-blue-100', // Added Email Color
// };

// const DashboardHeader: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { toast } = useToast(); // For popup notifications
//   const { user } = useAuth();
  
//   const { notifications, unreadCount, sidebarOpen } = useAppSelector((state) => state.ui);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [profilePrompted, setProfilePrompted] = useState(false);
//   const prevCompletionRef = useRef<number | null>(null);
//   // notifications are shown as-is; global search removed
//   // --- 3. REAL-TIME SOCKET CONNECTION ---
//   useEffect(() => {
//     if (!user) return;

//     // Initialize Socket connection
//     const socket = io(SOCKET_URL, {
//       query: { userId: user._id } // Pass User ID so backend knows who to send to
//     });

//     socket.on('connect', () => {
//       console.log('Connected to notification service');
//     });

//     // Listen for 'notification' event from backend
//     socket.on('notification', (newNotification) => {
//       // 1. Add to Redux Store
//       dispatch(addNotification(newNotification));

//       // 2. Play Notification Sound (Optional)
//       const audio = new Audio('/notification-sound.mp3'); // Place file in public folder
//       audio.play().catch(e => console.log("Audio play failed", e));

//       // 3. Show Toast Popup
//       toast({
//         title: newNotification.title,
//         description: newNotification.message,
//         variant: newNotification.type === 'error' ? 'destructive' : 'default',
//       });
//     });

//     // Cleanup on unmount
//     return () => {
//       socket.disconnect();
//     };
//   }, [user, dispatch, toast]);

//   // Profile Completion Logic
//   const completionPercentage = useMemo(() => {
//     if (!user) return 0;
//     let filled = 0;
//     const totalFields = 6;
    
//     if (user.name) filled++;
//     if (user.email) filled++;
//     if (user.department) filled++;
//     if (user.year) filled++;
//     if (user.cgpa && user.cgpa > 0) filled++;
//     if (user.skills && user.skills.length > 0) filled++;

//     return Math.round((filled / totalFields) * 100);
//   }, [user]);

//   // Prompt user after sign-in if profile incomplete, and notify on completion
//   useEffect(() => {
//     if (!user) return;

//     const prev = prevCompletionRef.current;

//     // On first render after sign-in, prompt if incomplete
//     if (prev === null && completionPercentage < 100 && !profilePrompted) {
//       toast({
//         title: 'Complete your profile',
//         description: 'Please complete your profile to be eligible for upcoming drives.',
//         action: (
//           <Button size="sm" onClick={() => navigate('/dashboard/profile')}>Complete Profile</Button>
//         ),
//       });
//       setProfilePrompted(true);
//     }

//     // If profile just reached 100%, celebrate
//     if (prev !== null && prev < 100 && completionPercentage === 100) {
//       toast({
//         title: 'Profile Completed',
//         description: 'Great! Your profile is 100% complete and ready for upcoming drives.',
//       });
//     }

//     prevCompletionRef.current = completionPercentage;
//   }, [user, completionPercentage, profilePrompted, toast, navigate]);

//   return (
//     <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
//       <div className="flex items-center justify-between h-16 px-4 lg:px-6">
//         {/* Left side */}
//         <div className="flex items-center gap-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             className="lg:hidden"
//             onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
//           >
//             {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//           </Button>

//           {/* Search removed from header */}
//         </div>

//         {/* Right side */}
//         <div className="flex items-center gap-3">
        
//           <ModeToggle />

//           {/* Notifications Dropdown */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="relative">
//                 <motion.div
//                   // Animate bell when unread count changes
//                   key={unreadCount}
//                   initial={{ rotate: 0 }}
//                   animate={unreadCount > 0 ? { rotate: [0, -20, 20, -20, 20, 0] } : {}}
//                   transition={{ duration: 0.5 }}
//                 >
//                   <Bell className="w-5 h-5" />
//                 </motion.div>
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
//                     {unreadCount}
//                   </span>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-80 p-0">
//               <div className="flex items-center justify-between px-4 py-3 border-b border-border">
//                 <h3 className="font-semibold">Notifications</h3>
//                 {unreadCount > 0 && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="text-xs h-7"
//                     onClick={() => dispatch(markAllNotificationsRead())}
//                   >
//                     <CheckCheck className="w-3 h-3 mr-1" />
//                     Mark all read
//                   </Button>
//                 )}
//               </div>
//               <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
//                 {notifications.length === 0 ? (
//                   <div className="py-8 text-center text-muted-foreground">No notifications</div>
//                 ) : (
//                   notifications.map((notification) => {
//                     const Icon = notificationIcons[notification.type] || Info;
//                     const colorClass = notificationColors[notification.type] || notificationColors.info;
//                     return (
//                       <DropdownMenuItem
//                         key={notification.id}
//                         className={cn(
//                           "flex items-start gap-3 p-4 cursor-pointer focus:bg-secondary",
//                           !notification.read && "bg-primary/5"
//                         )}
//                         onClick={() => dispatch(markNotificationRead(notification.id))}
//                       >
//                         <div className={cn(
//                           "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
//                           colorClass
//                         )}>
//                           <Icon className="w-4 h-4" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium">{notification.title}</p>
//                           <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
//                           <p className="text-xs text-muted-foreground/70 mt-1">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</p>
//                         </div>
//                         {!notification.read && (<div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />)}
//                       </DropdownMenuItem>
//                     );
//                   })
//                 )}
//               </div>
//               {notifications.length > 0 && (
//                 <>
//                   <DropdownMenuSeparator />
//                   <div className="p-2">
//                     <Button variant="ghost" className="w-full text-sm">View all notifications</Button>
//                   </div>
//                 </>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* User Avatar */}
        
//   {/* <div className="flex items-center gap-3">
//     <div className="text-right">
//       <p className="text-sm font-medium">{user?.name}</p>
//     </div>
//     <img
//       // Fallback to UI-Avatars if the user hasn't uploaded an image
//       src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}`}
//       alt="Profile"
//       onError={(event) => {
//         event.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
//       }}
//       className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
//     />
//   </div> */}

  

// // ... inside your component

// <Link 
//   to="/profile" 
//   className="flex items-center gap-3 group transition-opacity hover:opacity-80"
// >
//   <div className="text-right hidden sm:block">
//     <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
//       {user?.name}
//     </p>
//   </div>

//   <motion.div
//     whileHover={{ scale: 1.05 }}
//     whileTap={{ scale: 0.95 }}
//     className="relative"
//   >
//     <img
//       src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
//       alt="Profile"
//       onError={(event) => {
//         event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
//       }}
//       className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all shadow-sm"
//     />
    
//     {/* Optional: Online status indicator to make it look more premium */}
//     <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
//   </motion.div>
// </Link>
//         </div>
//       </div>
      


//       {/* mobile search removed */}
//     </header>
//   );
// };




// export default DashboardHeader;

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom'; // Merged imports
import { io } from 'socket.io-client';
import {
  Bell,
  Menu,
  X,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { markNotificationRead, markAllNotificationsRead, setSidebarOpen, addNotification } from '@/store/slices/uiSlice';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

const SOCKET_URL = import.meta.env.VITE_API_URL;

const notificationIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  email: Mail,
};

const notificationColors = {
  info: 'text-info bg-info/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  error: 'text-destructive bg-destructive/10',
  email: 'text-blue-600 bg-blue-100',
};

const DashboardHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { notifications, unreadCount, sidebarOpen } = useAppSelector((state) => state.ui);
  const [profilePrompted, setProfilePrompted] = useState(false);
  const prevCompletionRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { query: { userId: user._id } });

    socket.on('notification', (newNotification) => {
      dispatch(addNotification(newNotification));
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log("Audio play failed", e));

      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: newNotification.type === 'error' ? 'destructive' : 'default',
      });
    });

    return () => { socket.disconnect(); };
  }, [user, dispatch, toast]);

  const completionPercentage = useMemo(() => {
    if (!user) return 0;
    let filled = 0;
    const fields = [user.name, user.email, user.department, user.year, (user.cgpa && user.cgpa > 0), (user.skills?.length > 0)];
    fields.forEach(field => { if (field) filled++; });
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <motion.div
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
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => dispatch(markAllNotificationsRead())}>
                    <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map((n) => {
                    const Icon = notificationIcons[n.type] || Info;
                    return (
                      <DropdownMenuItem key={n.id} className={cn("flex items-start gap-3 p-4 cursor-pointer", !n.read && "bg-primary/5")} onClick={() => dispatch(markNotificationRead(n.id))}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", notificationColors[n.type])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Navigation Link */}
          <Link 
            to="/dashboard/profile" 
            className="flex items-center gap-3 group transition-opacity hover:opacity-90 ml-2"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {user?.name || 'Guest'}
              </p>
              <p className="text-[10px] text-muted-foreground leading-none">
                {completionPercentage}% Profile
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <img
                src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
                }}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"></span>
            </motion.div>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
