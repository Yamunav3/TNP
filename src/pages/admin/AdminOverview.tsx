
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Briefcase, TrendingUp, Calendar, DollarSign, ArrowUp, ArrowDown, Loader2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Redux
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchDashboardStats } from '@/store/slices/adminSlice';

const AdminOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboardData, isLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading || !dashboardData) {
    return <div className="flex h-96 justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const { stats, placementTrend, departmentData, recentActivity, upcomingDrives } = dashboardData;

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, change: `+${stats.studentTrend}%`, trend: 'up', icon: Users, color: 'text-primary' },
    { label: 'Companies', value: stats.companiesOnboarded, change: `+${stats.companyTrend}%`, trend: 'up', icon: Building2, color: 'text-blue-600' },
    { label: 'Active Drives', value: stats.activeDrives, change: `+${stats.drivesTrend}`, trend: 'up', icon: Briefcase, color: 'text-green-600' },
    { label: 'Avg Package', value: stats.avgPackage, change: `+${stats.packageTrend}%`, trend: 'up', icon: DollarSign, color: 'text-yellow-600' },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500">Real-time overview of placement activities</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-3 h-3 mr-1" />{stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Placement Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="placed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-6">Department Wise</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {departmentData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity & Drives */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium">{act.action}</p>
                  <p className="text-xs text-slate-500">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Upcoming Drives</h3>
          <div className="space-y-3">
            {upcomingDrives.map((drive, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg" />
                  <div>
                    <p className="font-medium text-sm">{drive.company}</p>
                    <p className="text-xs text-slate-500">{drive.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{drive.slots}</p>
                  <p className="text-[10px] text-slate-400">APPLICANTS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default AdminOverview;