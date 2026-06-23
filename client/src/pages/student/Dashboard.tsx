
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, ClipboardList, CheckCircle2, Clock, TrendingUp,
  Calendar, ArrowRight, Target, AlertCircle, Users, Building2
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
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { profile, isLoading: profileLoading } = useAppSelector((state) => state.profile);
  const { applications, isLoading: appsLoading } = useAppSelector((state) => state.applications);
  const { drives, isLoading: drivesLoading } = useAppSelector((state) => state.drives);

  const isLoading = profileLoading || appsLoading || drivesLoading;

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchApplications(undefined));
    dispatch(fetchDrives());
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;

    const socket = io(API_URL, {
      query: { 
        userId: (profile as any)._id, 
        role: "student" 
      }
    });

    socket.on('notification', (data) => {
      console.log('📢 Notification received:', data);
      toast.success(data.message || 'New notification received!');
      
      if (data.title === 'Application Submitted') {
        dispatch(fetchApplications((profile as any)._id));
        dispatch(fetchDrives());
      }
    });

    socket.on('applicationStatusUpdate', (data) => {
      console.log('📝 Application status update:', data);
      toast(`Your application status: ${data.status}`);
      dispatch(fetchApplications(undefined));
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

  const appliedDriveIds = useMemo(() => {
    const appsArray = Array.isArray(applications) ? applications : [];
    return new Set(appsArray.map(app => app.driveId));
  }, [applications]);

  const stats = useMemo(() => {
    const safeDrives = Array.isArray(drives) ? drives : [];
    const safeApps = Array.isArray(applications) ? applications : [];

    const eligibleDrives = safeDrives.filter(d => {
      if (appliedDriveIds.has(d._id || d.id)) return false;
      if (profile) {
        const p = profile as any;
        const studentCGPA = p.cgpa || p.academicInfo?.cgpa || 0;
        const studentBacklogs = p.backlogs || p.academicInfo?.backlogs || 0;
        const hasCGPA = studentCGPA >= (d.eligibility?.minCGPA || 0);
        const hasBacklogs = studentBacklogs <= (d.eligibility?.maxBacklogs || 99);
        return hasCGPA && hasBacklogs;
      }
      return true; 
    });
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newDrivesCount = eligibleDrives.filter(d => new Date(d.createdAt || Date.now()) > oneWeekAgo).length;

    const pendingApps = safeApps.filter(a => ['applied', 'screening'].includes(a.status));
    const upcomingInterviews = [];
    const offers = safeApps.filter(a => a.status === 'selected');

    return [
      {
        title: 'Active Drives',
        value: eligibleDrives.length,
        icon: Briefcase,
        color: 'from-primary to-primary-dark',
        bgColor: 'bg-primary/5 dark:bg-primary/10',
        textColor: 'text-primary',
        change: newDrivesCount > 0 ? `+${newDrivesCount} new` : null,
      },
      {
        title: 'Applications',
        value: safeApps.length,
        icon: ClipboardList,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        textColor: 'text-purple-600 dark:text-purple-400',
        change: pendingApps.length > 0 ? `${pendingApps.length} pending` : 'No pending apps',
      },
      {
        title: 'Interviews',
        value: upcomingInterviews.length,
        icon: Calendar,
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        textColor: 'text-amber-600 dark:text-amber-400',
        change: upcomingInterviews.length > 0 ? 'Check schedule' : 'No interviews',
      },
      {
        title: 'Offers',
        value: offers.length,
        icon: CheckCircle2,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        textColor: 'text-green-600 dark:text-green-400',
        change: offers.length > 0 ? 'Congratulations!' : 'Keep applying!',
      },
    ];
  }, [drives, applications, appliedDriveIds, profile]);

  const upcomingDrivesList = useMemo(() => 
    [...(Array.isArray(drives) ? drives : [])]
      .filter(d => {
        if (appliedDriveIds.has(d._id || d.id)) return false;
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
    applied: 'border-primary/20 bg-primary/5 text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-primary',
    shortlisted: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-400',
    interview: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400',
    selected: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400',
    rejected: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400',
  };

  const firstName = (profile as any)?.personalInfo?.firstName || (profile as any)?.name || 'Student';
  const profileCompletion = (profile as any)?.profileCompletion || 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
     return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
           <AlertCircle className="w-16 h-16 text-destructive mb-4" />
           <h2 className="text-2xl font-bold mb-2">Failed to load profile</h2>
           <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
     );
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-8 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-primary/5 to-accent/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 min-h-screen"
    >
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {getGreeting(firstName)}
          </h1>
          <p className="text-muted-foreground text-lg">Here's what's happening with your placement journey</p>
        </div>
      </motion.div>

      {profileCompletion < 100 && (
        <motion.div variants={itemVariants}>
          <Card className="gradient-hero text-primary-foreground border-none overflow-hidden relative bg-gradient-to-r from-primary to-primary-dark">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Target className="w-6 h-6" /> Complete your profile
                  </h3>
                  <p className="text-white/90">
                    You are <strong className="text-white">{100 - profileCompletion}% away</strong> from a perfect score.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1 max-w-md">
                        <Progress value={profileCompletion} className="h-3 bg-white/20" />
                    </div>
                    <span className="text-2xl font-bold">{profileCompletion}%</span>
                  </div>
                </div>
                <Link to="/dashboard/profile">
                  <Button variant="secondary" className="whitespace-nowrap bg-white text-primary hover:bg-white/90 border-none px-6 py-6 rounded-xl font-semibold">
                    Complete Now <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <motion.div key={stat.title} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className={cn("h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm", stat.bgColor)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-xl bg-gradient-to-br", stat.color, "text-white shadow-lg")}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className="text-xs font-medium bg-white/80 dark:bg-slate-800/80">
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-2">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" /> Eligible Drives
              </CardTitle>
              <Link to="/dashboard/drives">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark hover:bg-primary/5 dark:hover:bg-primary/10 h-9">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDrivesList.length > 0 ? (
                upcomingDrivesList.map((drive) => (
                  <Link key={drive._id || drive.id} to={`/dashboard/drives/${drive._id || drive.id}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all group">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                      {drive.companyName?.charAt(0) || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{drive.companyName}</h4>
                      <p className="text-sm text-muted-foreground truncate">{drive.role}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="outline" className="text-xs h-6">{drive.package}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(drive.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <Briefcase className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No new eligible drives.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2" onClick={() => navigate("/driversPage")}>
                <ClipboardList className="w-6 h-6 text-purple-600" /> Recent Applications
              </CardTitle>
              <Link to="/dashboard/applications">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 h-9">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplicationsList.length > 0 ? (
                recentApplicationsList.map((app) => (
                  <div key={app._id || app.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                      {app.companyName?.charAt(0) || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{app.companyName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{app.role}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={cn("text-xs h-6 px-2.5 font-medium", statusColors[app.status] || 'bg-slate-100 text-slate-700')}>
                          {(app.status || 'Applied').replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No applications yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Browse Drives', icon: Briefcase, color: 'text-primary bg-primary/10 dark:bg-primary/20', link: '/dashboard/drives' },
                { label: 'Track Applications', icon: ClipboardList, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', link: '/dashboard/applications' },
                { label: 'View Schedule', icon: Calendar, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', link: '/dashboard/schedule' },
                { label: 'View Analytics', icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-900/30', link: '/dashboard/analytics' },
              ].map((action) => (
                <Link to={action.link} key={action.label} className="group">
                  <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all text-center h-full flex flex-col items-center justify-center gap-3">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300", action.color)}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">{action.label}</p>
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

export default Dashboard;
