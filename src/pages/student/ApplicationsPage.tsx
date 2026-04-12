
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  List,
  LayoutGrid,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Sparkles,
  Eye,
  X,
  Plus,
  RefreshCw,
  MapPin,
  Clock
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchApplications, ApplicationStatus } from '@/store/slices/applicationsSlice';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// --- CONFIGURATION ---

const STATUS_CONFIG: Record<string, { 
  label: string; 
  color: string; 
  bg: string; 
  border: string;
  icon: React.ElementType; 
  gradient: string;
}> = {
  applied: { 
    label: 'Applied', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: Briefcase,
    gradient: 'from-blue-400 to-blue-600'
  },
  screening: { 
    label: 'Screening', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    icon: Search,
    gradient: 'from-purple-400 to-purple-600'
  },
  shortlisted: { 
    label: 'Shortlisted', 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200',
    icon: Filter,
    gradient: 'from-amber-400 to-amber-600'
  },
  interview: { 
    label: 'Interview', 
    color: 'text-orange-600', 
    bg: 'bg-orange-50', 
    border: 'border-orange-200',
    icon: Calendar,
    gradient: 'from-orange-400 to-orange-600'
  },
  selected: { 
    label: 'Selected', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    icon: CheckCircle2,
    gradient: 'from-emerald-400 to-emerald-600'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: XCircle,
    gradient: 'from-red-400 to-red-600'
  },
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, duration: 0.5 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ApplicationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 1. Redux State
  const { applications, isLoading, error } = useAppSelector((state) => state.applications);
  const { profile } = useAppSelector((state) => state.profile);

  // 2. Local State
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'package' | 'company'>('date');
  const [dateRange, setDateRange] = useState('all');

  // 3. Fetch Data
  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  // 3.5 Setup Socket Listeners for Real-time Updates
  useEffect(() => {
    if (!profile) return;

    const socket = io("http://localhost:5002", {
      query: { 
        userId: (profile as any)._id, 
        role: "student" 
      }
    });

    // Listen for application status updates
    socket.on('applicationStatusUpdate', (data) => {
      console.log('📝 Application status updated:', data);
      toast.success(`Application status updated to: ${data.status}`);
      dispatch(fetchApplications());
    });

    // Listen for new application confirmations
    socket.on('notification', (data) => {
      if (data.title === 'Application Submitted') {
        console.log('✅ New application submitted:', data);
        dispatch(fetchApplications());
      }
    });

    return () => {
      socket.off('applicationStatusUpdate');
      socket.off('notification');
      socket.disconnect();
    };
  }, [profile, dispatch]);

  // 4. Stats Calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const selected = applications.filter(app => app.status === 'selected').length;
    const interview = applications.filter(app => app.status === 'interview').length;
    const successRate = total > 0 ? Math.round((selected / total) * 100) : 0;
    
    // Helper to extract numbers from "12 LPA" string safely
    const getPackageValue = (pkg: string | number) => {
        if (!pkg) return 0;
        const strVal = String(pkg).replace(/[^0-9.]/g, '');
        return parseFloat(strVal) || 0;
    };

    const totalPackage = applications.reduce((sum, app) => sum + getPackageValue(app.package), 0);
    const avgPackage = total > 0 ? (totalPackage / total).toFixed(1) : "0";

    return {
      total,
      selected,
      interview,
      successRate,
      avgPackage,
      trending: selected > 0 ? 'up' : 'down'
    };
  }, [applications]);

  // 5. Process Applications (Filter & Sort)
  const processedApplications = useMemo(() => {
    let filtered = [...applications];

    // Search (Safe null check)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.companyName?.toLowerCase().includes(q) || 
        app.role?.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q)
      );
    }

    // Tab Filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(app => app.status === activeTab);
    }

    // Date Filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch(dateRange) {
        case 'week': cutoff.setDate(now.getDate() - 7); break;
        case 'month': cutoff.setMonth(now.getMonth() - 1); break;
        case 'quarter': cutoff.setMonth(now.getMonth() - 3); break;
      }
      filtered = filtered.filter(app => new Date(app.appliedDate) >= cutoff);
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'package') {
        const valA = parseFloat(String(a.package).replace(/[^0-9.]/g, '')) || 0;
        const valB = parseFloat(String(b.package).replace(/[^0-9.]/g, '')) || 0;
        return valB - valA;
      }
      if (sortBy === 'company') {
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      // Default: Date
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });
  }, [applications, searchQuery, activeTab, sortBy, dateRange]);

  // Group for Kanban
  const statuses = ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'rejected'];
  
  const groupedApplications = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = processedApplications.filter((app) => (app.status || 'applied') === status);
      return acc;
    }, {} as Record<string, typeof processedApplications>);
  }, [processedApplications]);

  if (isLoading) return <ApplicationsSkeleton />;
  
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-red-50 rounded-full"><AlertCircle className="w-10 h-10 text-red-500"/></div>
        <h2 className="text-xl font-bold">Failed to load applications</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => dispatch(fetchApplications())}><RefreshCw className="w-4 h-4 mr-2"/> Retry</Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10 max-w-[1800px] mx-auto px-4 sm:px-6">
      
      {/* HEADER WITH STATS */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 border border-indigo-500/20 shadow-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <div className="absolute inset-0 bg-grid-white/5 mask-gradient" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Applications Dashboard</h1>
              </div>
              <p className="text-slate-300 max-w-2xl text-lg">
                Tracking <span className="font-semibold text-white">{stats.total}</span> opportunities. 
                {stats.selected > 0 && <span className="text-emerald-300"> {stats.selected} offers received! 🎉</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => dispatch(fetchApplications())} className="bg-white/10 text-white hover:bg-white/20 border-0">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <Link to="/drives">
                <Button className="bg-white text-indigo-950 hover:bg-indigo-50"><Plus className="w-4 h-4 mr-2" /> New Application</Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <StatCard label="Total Applications" value={stats.total} icon={Briefcase} />
            <StatCard label="Success Rate" value={`${stats.successRate}%`} icon={Target} trend={stats.trending} />
            <StatCard label="Avg. Package" value={`${stats.avgPackage} LPA`} icon={TrendingUp} />
            <StatCard label="Interviews" value={stats.interview} icon={Users} />
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search companies, roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-10 border-dashed"><Filter className="w-4 h-4" /> Filter & Sort</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setSortBy('date')}>Sort by Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('package')}>Sort by Package</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDateRange('all')}>All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange('month')}>Last Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
           <span className="text-sm text-slate-500 font-medium">{processedApplications.length} results</span>
           <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('kanban')} className={cn("p-2 rounded-md transition-all flex gap-2", viewMode === 'kanban' ? "bg-white shadow text-primary font-medium" : "text-slate-500")}>
                <LayoutGrid className="w-4 h-4" /><span className="text-xs hidden sm:block">Board</span>
            </button>
            <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-md transition-all flex gap-2", viewMode === 'list' ? "bg-white shadow text-primary font-medium" : "text-slate-500")}>
                <List className="w-4 h-4" /><span className="text-xs hidden sm:block">List</span>
            </button>
           </div>
        </div>
      </div>

      {/* TABS & CONTENT */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="h-auto bg-transparent gap-2 p-0 min-w-max">
                <TabsTrigger value="all" className="flex-col items-start gap-1 p-3 min-w-[120px] rounded-xl border bg-white data-[state=active]:border-primary data-[state=active]:ring-1">
                    <span className="text-2xl font-bold">{applications.length}</span>
                    <span className="text-xs text-muted-foreground uppercase">All</span>
                </TabsTrigger>
                {statuses.map(status => {
                    const config = STATUS_CONFIG[status];
                    const count = applications.filter(a => (a.status || 'applied') === status).length;
                    return (
                        <TabsTrigger key={status} value={status} className="flex-col items-start gap-1 p-3 min-w-[120px] rounded-xl border bg-white data-[state=active]:border-primary data-[state=active]:ring-1">
                            <div className="flex justify-between w-full">
                                <config.icon className={cn("w-5 h-5", config.color)} />
                                <Badge variant="secondary">{count}</Badge>
                            </div>
                            <span className={cn("text-xs font-medium mt-1", config.color)}>{config.label}</span>
                        </TabsTrigger>
                    )
                })}
            </TabsList>
        </div>
      </Tabs>

      <AnimatePresence mode="wait">
        {processedApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Search className="w-8 h-8 text-slate-300" /></div>
                <h3 className="text-xl font-bold">No applications found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search query.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Clear Filters</Button>
            </div>
        ) : viewMode === 'kanban' ? (
            <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {statuses.map(status => {
                    const apps = groupedApplications[status];
                    if(activeTab !== 'all' && activeTab !== status) return null;
                    return (
                        <div key={status} className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/60 p-2">
                            <div className="flex items-center justify-between p-3 mb-2">
                                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{STATUS_CONFIG[status].label}</h3>
                                <Badge variant="secondary" className="bg-white">{apps?.length || 0}</Badge>
                            </div>
                            <div className="flex-1 space-y-3">
                                {apps?.map(app => <ApplicationCard key={app._id || app.id} app={app} config={STATUS_CONFIG[status]} />)}
                            </div>
                        </div>
                    )
                })}
            </motion.div>
        ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <ListView applications={processedApplications} />
            </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-white">
        <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-white/10"><Icon className="w-5 h-5" /></div>
        </div>
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm text-slate-300">{label}</p>
        </div>
    </div>
);

const ApplicationCard = ({ app, config }: any) => {
    const progress = app.totalRounds ? (app.currentRound / app.totalRounds) * 100 : 0;
    return (
        <Link to={`/applications/${app._id || app.id}`}>
            <Card className="border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden bg-white group">
                <div className={cn("h-1 w-full bg-gradient-to-r", config.gradient)} />
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center p-1.5 shrink-0">
                                {app.companyLogo ? <img src={app.companyLogo} className="w-full h-full object-contain" /> : <Building2 className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 truncate text-sm">{app.companyName}</h4>
                                <p className="text-xs text-slate-500 truncate">{app.role}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="font-medium bg-slate-100">{app.package || 'N/A'}</Badge>
                        <div className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border"><Clock className="w-3 h-3" /> {new Date(app.appliedDate).toLocaleDateString()}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-slate-500 uppercase"><span>Progress</span><span>{Math.round(progress)}%</span></div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full bg-gradient-to-r", config.gradient)} style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

const ListView = ({ applications }: any) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50 border-b">
                <tr><th className="p-4 pl-6 font-semibold text-sm">Company</th><th className="p-4 font-semibold text-sm">Role</th><th className="p-4 font-semibold text-sm">Package</th><th className="p-4 font-semibold text-sm">Status</th><th className="p-4 font-semibold text-sm text-right pr-6">Action</th></tr>
            </thead>
            <tbody className="divide-y">
                {applications.map((app: any) => {
                    const config = STATUS_CONFIG[app.status as string] || STATUS_CONFIG.applied;
                    return (
                        <tr key={app._id || app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6 font-medium">{app.companyName}</td>
                            <td className="p-4 text-slate-600">{app.role}</td>
                            <td className="p-4 font-medium">{app.package || 'N/A'}</td>
                            <td className="p-4"><Badge variant="outline" className={cn("border-0", config.bg, config.color)}>{config.label}</Badge></td>
                            <td className="p-4 text-right pr-6"><Link to={`/applications/${app._id || app.id}`}><Button variant="ghost" size="sm">View</Button></Link></td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
);

const ApplicationsSkeleton = () => (
    <div className="space-y-8 max-w-[1800px] mx-auto px-4 pb-10">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
    </div>
);

export default ApplicationsPage;