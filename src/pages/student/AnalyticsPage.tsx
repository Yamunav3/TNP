
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, Target, Award, Clock, Briefcase, XCircle } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Helper to format dates (e.g., "2024-01-15" -> "Jan")
const getMonthName = (dateString: string) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'short' });
};

const AnalyticsPage: React.FC = () => {
  const { applications } = useAppSelector((state) => state.applications);

  // --- 1. DYNAMIC STATUS DISTRIBUTION ---
  const statusData = useMemo(() => {
    const counts = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0
    };

    applications.forEach(app => {
      const status = app.status?.toLowerCase() || 'applied';
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });

    return [
      { name: 'Applied', value: counts.applied, color: '#3b82f6' },      // Blue
      { name: 'Shortlisted', value: counts.shortlisted, color: '#f59e0b' }, // Amber
      { name: 'Interview', value: counts.interview, color: '#8b5cf6' },  // Violet
      { name: 'Selected', value: counts.selected, color: '#22c55e' },   // Green
      { name: 'Rejected', value: counts.rejected, color: '#ef4444' },    // Red
    ].filter(item => item.value > 0); // Hide zero segments
  }, [applications]);

  // --- 2. DYNAMIC MONTHLY TRENDS ---
  const monthlyData = useMemo(() => {
    const groupedData: Record<string, { month: string, applications: number, interviews: number }> = {};
    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    applications.forEach(app => {
      const month = getMonthName(app.appliedDate || new Date().toISOString()); // Fallback to current date if missing
      
      if (!groupedData[month]) {
        groupedData[month] = { month, applications: 0, interviews: 0 };
      }

      groupedData[month].applications += 1;
      
      if (['interview', 'selected'].includes(app.status)) {
        groupedData[month].interviews += 1;
      }
    });

    // Convert object to array and sort by month index
    return Object.values(groupedData).sort(
      (a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month)
    );
  }, [applications]);

  // --- 3. DYNAMIC KPI STATS ---
  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter(a => ['interview', 'selected'].includes(a.status)).length;
    const selected = applications.filter(a => a.status === 'selected').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    // Calculate Rate (avoid divide by zero)
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
    const successRate = interviews > 0 ? Math.round((selected / interviews) * 100) : 0;

    return [
      { 
        title: 'Total Applications', 
        value: total, 
        icon: Target, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
      },
      { 
        title: 'Interview Rate', 
        value: `${interviewRate}%`, 
        subtext: `${interviews} interviews scheduled`,
        icon: TrendingUp, 
        color: 'text-violet-600', 
        bg: 'bg-violet-50' 
      },
      { 
        title: 'Offers Received', 
        value: selected, 
        subtext: `Conversion: ${successRate}%`,
        icon: Award, 
        color: 'text-green-600', 
        bg: 'bg-green-50' 
      },
      { 
        title: 'Rejections', 
        value: rejected, 
        icon: XCircle, 
        color: 'text-red-600', 
        bg: 'bg-red-50' 
      },
    ];
  }, [applications]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-10"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time insights into your placement journey.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{stat.value}</h3>
                {stat.subtext && <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>}
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* CHART 1: MONTHLY ACTIVITY */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>Applications sent vs Interviews received per month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="interviews" name="Interviews" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No application data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* CHART 2: STATUS DISTRIBUTION */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Breakdown of all your active applications</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={statusData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Start applying to see statistics here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;