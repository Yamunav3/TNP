
import { io } from 'socket.io-client';
import toast from 'react-hot-toast'; // or use whatever toast library you prefer
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, ClipboardList, CheckCircle2, Clock, TrendingUp,
  Calendar, ArrowRight, Target, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch';

import { fetchProfile } from '@/store/slices/profileSlice';
import { fetchApplications } from '@/store/slices/applicationsSlice';
import { fetchDrives } from '@/store/slices/drivesSlice';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useNavigate } from "react-router-dom";

// --- Animations ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  return `${greeting}, ${name || 'Student'}! 👋`;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { profile, isLoading: profileLoading } = useAppSelector((state) => state.profile);
  const { applications, isLoading: appsLoading } = useAppSelector((state) => state.applications);
  const { drives, isLoading: drivesLoading } = useAppSelector((state) => state.drives);

  const isLoading = profileLoading || appsLoading || drivesLoading;

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchApplications());
    dispatch(fetchDrives());
  }, [dispatch]);


  useEffect(() => {
    if (!profile) return; // Wait until we know who the user is

    // 1. Connect to the backend
    const socket = io("http://localhost:5002", {
      query: { 
        userId: (profile as any)._id, 
        role: "student" 
      }
    });

    // Listen for application submission confirmation
    socket.on('notification', (data) => {
      console.log('📢 Notification received:', data);
      toast.success(data.message || 'New notification received!');
      
      // Refresh applications and drives when a new application is submitted
      if (data.title === 'Application Submitted') {
        dispatch(fetchApplications());
        dispatch(fetchDrives());
      }
    });

    // Listen for application status updates from admin
    socket.on('applicationStatusUpdate', (data) => {
      console.log('📝 Application status update:', data);
      toast.info(`Your application status: ${data.status}`);
      // Refresh applications to get latest status
      dispatch(fetchApplications());
    });

    socket.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });

    return () => {
      socket.off('notification');
      socket.off('applicationStatusUpdate');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [profile, dispatch]);

  // 1. Create a Set of Applied Drive IDs for O(1) lookup speed
  const appliedDriveIds = useMemo(() => {
    // Ensure applications is an array before mapping
    const appsArray = Array.isArray(applications) ? applications : [];
    return new Set(appsArray.map(app => app.driveId));
  }, [applications]);

  // 2. Stats Calculation with SAFE CGPA CHECK
  const stats = useMemo(() => {
    const safeDrives = Array.isArray(drives) ? drives : [];
    const safeApps = Array.isArray(applications) ? applications : [];

    // --- FIX 1: Robust Eligibility Check ---
    const eligibleDrives = safeDrives.filter(d => {
        // Check if already applied
        if (appliedDriveIds.has(d._id || d.id)) return false;

        // Check Eligibility
        if (profile) {
            // CAST TO ANY to avoid TypeScript errors regarding structure
            const p = profile as any;
            
            // Check both flat structure (p.cgpa) and nested structure (p.academicInfo.cgpa)
            const studentCGPA = p.cgpa || p.academicInfo?.cgpa || 0;
            const studentBacklogs = p.backlogs || p.academicInfo?.backlogs || 0;

            const hasCGPA = studentCGPA >= (d.eligibility?.minCGPA || 0);
            const hasBacklogs = studentBacklogs <= (d.eligibility?.maxBacklogs || 99);
            
            return hasCGPA && hasBacklogs;
        }
        return true; 
    });
    
    // Calculate new drives added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newDrivesCount = eligibleDrives.filter(d => new Date(d.createdAt || Date.now()) > oneWeekAgo).length;

    const pendingApps = safeApps.filter(a => ['applied', 'screening'].includes(a.status));
    const upcomingInterviews = safeApps.filter(a => ['shortlisted', 'interview'].includes(a.status));
    const offers = safeApps.filter(a => a.status === 'selected');

    return [
      {
        title: 'Active Drives',
        value: eligibleDrives.length,
        icon: Briefcase,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        change: newDrivesCount > 0 ? `+${newDrivesCount} new` : null,
      },
      {
        title: 'Applications',
        value: safeApps.length,
        icon: ClipboardList,
        color: 'text-info',
        bgColor: 'bg-info/10',
        change: pendingApps.length > 0 ? `${pendingApps.length} pending` : 'No pending apps',
      },
      {
        title: 'Interviews',
        value: upcomingInterviews.length,
        icon: Calendar,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        change: upcomingInterviews.length > 0 ? 'Check schedule' : 'No interviews',
      },
      {
        title: 'Offers',
        value: offers.length,
        icon: CheckCircle2,
        color: 'text-success',
        bgColor: 'bg-success/10',
        change: offers.length > 0 ? 'Congratulations!' : 'Keep applying!',
      },
    ];
  }, [drives, applications, appliedDriveIds, profile]); 

  // 3. Upcoming Drives List with SAFE CGPA CHECK
  const upcomingDrivesList = useMemo(() => 
    [...(Array.isArray(drives) ? drives : [])]
      .filter(d => {
          if (appliedDriveIds.has(d._id || d.id)) return false;
          
          // --- FIX 2: Apply the same safe check here ---
          if (profile) {
             const p = profile as any;
             const studentCGPA = p.cgpa || p.academicInfo?.cgpa || 0;
             const hasCGPA = studentCGPA >= (d.eligibility?.minCGPA || 0);
             return hasCGPA;
          }
          return true;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3), 
  [drives, appliedDriveIds, profile]);

  const recentApplicationsList = useMemo(() => 
    [...(Array.isArray(applications) ? applications : [])]
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 4), 
  [applications]);

  const statusColors: Record<string, string> = {
    applied: 'border-blue-200 bg-blue-50 text-blue-700',
    shortlisted: 'border-purple-200 bg-purple-50 text-purple-700',
    interview: 'border-orange-200 bg-orange-50 text-orange-700',
    selected: 'border-green-200 bg-green-50 text-green-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Safe check for personalInfo
  const firstName = (profile as any)?.personalInfo?.firstName || (profile as any)?.name || 'Student';
  const profileCompletion = (profile as any)?.profileCompletion || 0;

  if (!profile) {
     return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
           <AlertCircle className="w-12 h-12 text-destructive mb-4" />
           <h2 className="text-xl font-bold">Failed to load profile</h2>
           <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
     )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            {getGreeting(firstName)}
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your placement journey</p>
        </div>
      </motion.div>

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <motion.div variants={itemVariants}>
          <Card className="gradient-hero text-primary-foreground border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5" /> Complete your profile
                  </h3>
                  <p className="text-primary-foreground/90 text-sm max-w-xl">
                    You are <strong>{100 - profileCompletion}% away</strong> from a perfect score.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1 max-w-md">
                        <Progress value={profileCompletion} className="h-2 bg-black/20" />
                    </div>
                    <span className="text-lg font-bold">{profileCompletion}%</span>
                  </div>
                </div>
                <Link to="/profile">
                  <Button variant="secondary" className="whitespace-nowrap bg-white text-primary hover:bg-white/90 border-0">
                    Complete Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover border-border/50 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-xl transition-colors", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                {stat.change && (
                  <Badge variant="secondary" className="text-[10px] px-2 h-5 font-medium bg-secondary/50">
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold font-display tracking-tight text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Eligible Drives List */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-border/50 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Eligible Drives
              </CardTitle>
              <Link to="/dashboard/drives">
                <Button variant="ghost" size="sm" className="text-primary h-8 hover:bg-primary/5">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              {upcomingDrivesList.length > 0 ? (
                upcomingDrivesList.map((drive) => (
                  <Link key={drive._id || drive.id} to={`/drives/${drive._id || drive.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-white border border-border/50 flex items-center justify-center p-2 shadow-sm">
                      {drive.companyLogo ? <img src={drive.companyLogo} alt={drive.companyName} className="w-full h-full object-contain" /> : <span className="text-lg font-bold text-primary">{drive.companyName.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{drive.companyName}</h4>
                      <p className="text-xs text-muted-foreground truncate">{drive.role}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background font-normal">{drive.package}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(drive.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <Briefcase className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No new eligible drives.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Applications List */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-border/50 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display flex items-center gap-2"  onClick={() => navigate("/driversPage")}>
                <ClipboardList className="w-5 h-5 text-info" /> Recent Applications
              </CardTitle>
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm" className="text-info h-8 hover:bg-info/10">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              {recentApplicationsList.length > 0 ? (
                recentApplicationsList.map((app) => (
                  <Link key={app._id || app.id} to={`/applications/${app._id || app.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border/50 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-white border border-border/50 flex items-center justify-center p-2 shadow-sm">
                       {app.companyLogo ? <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-contain" /> : <span className="text-lg font-bold text-info">{app.companyName?.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-info transition-colors">{app.companyName}</h4>
                        <span className="text-[10px] text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={cn("text-[10px] h-5 font-medium border shadow-none", statusColors[app.status] || 'bg-secondary text-foreground')}>{(app.status || 'Applied').replace('-', ' ').toUpperCase()}</Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <ClipboardList className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No applications yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
      
      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Browse Drives', icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10', link: '/dashboard/drives' },
                { label: 'Track Applications', icon: ClipboardList, color: 'text-info', bg: 'bg-info/10', link: '/dashboard/applications' },
                { label: 'View Schedule', icon: Calendar, color: 'text-warning', bg: 'bg-warning/10', link: '/dashboard/schedule' },
                { label: 'View Analytics', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', link: '/dashboard/analytics' },
              ].map((action) => (
                <Link to={action.link} key={action.label} className="group">
                  <div className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/20 transition-all text-center h-full flex flex-col items-center justify-center">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300", action.bg)}>
                      <action.icon className={cn("w-6 h-6", action.color)} />
                    </div>
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Skeleton Component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" /></div><div className="flex gap-2"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div></div>
    <Skeleton className="h-32 w-full rounded-xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
    <div className="grid lg:grid-cols-2 gap-6"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>
  </div>
);

export default Dashboard;