
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Users, Briefcase, 
  GraduationCap, Award, FileSpreadsheet, Printer, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { useToast } from '@/hooks/use-toast';
import { fetchAllStudents } from '@/store/slices/adminSlice'; // Import the fetch action

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // 1. SELECTORS
  // Fetch 'students' from the Redux store
  const { students, isLoading } = useAppSelector((state) => state.admin);

  // Safely access 'jobs' if it exists in admin slice, otherwise default to empty array
  // This prevents crashes since you mentioned you don't have a jobSlice yet
  const jobs = (useAppSelector((state) => state.admin) as { jobs: Record<string, any>[] }).jobs || [];

  // 2. FETCH REAL DATA ON MOUNT
  useEffect(() => {
    dispatch(fetchAllStudents())
      .unwrap()
      .catch((err) => console.error("Failed to fetch students for reports:", err));
  }, [dispatch]);

  // --- UTILITY: Download CSV ---
  const downloadCSV = (data: Record<string, any>[], filename: string) => {
    if (!data || data.length === 0) {
      toast({ title: "No Data", description: "No records found for this report.", variant: "destructive" });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), 
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName] ? String(row[fieldName]).replace(/,/g, ' ') : ''; 
        return `"${val}"`;
      }).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Success", description: `${filename} downloaded successfully.` });
  };

  // ==========================================
  // 1️⃣ STUDENT REPORTS (REAL DATA)
  // ==========================================
  const generateTotalStudentsReport = () => {
    // Maps actual student data from Redux to CSV format
    const data = students.map(s => ({
      Name: s.name,
      Email: s.email,
      Phone: (s as Record<string, any>).phone || 'N/A', // Handling optional fields safely
      Department: s.department,
      Year: s.year,
      CGPA: s.cgpa,
      Backlogs: (s as Record<string, any>).backlogs || 0,
      Status: s.placedCompany ? 'Placed' : 'Unplaced'
    }));
    downloadCSV(data, `Total_Students_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateDeptWiseReport = () => {
    // Calculates real-time statistics from the 'students' array
    const stats: Record<string, any> = {};
    students.forEach(s => {
      const dept = s.department || 'Unknown';
      if(!stats[dept]) stats[dept] = { Total: 0, Placed: 0, Unplaced: 0 };
      stats[dept].Total++;
      s.placedCompany ? stats[dept].Placed++ : stats[dept].Unplaced++;
    });

    const data = Object.keys(stats).map(dept => ({
      Department: dept,
      ...stats[dept],
      Placement_Rate: ((stats[dept].Placed / stats[dept].Total) * 100).toFixed(1) + '%'
    }));
    downloadCSV(data, `Dept_Wise_Stats.csv`);
  };

  const generateBacklogReport = () => {
      const data = students
        .filter(s => ((s as Record<string, any>).backlogs || 0) > 0)
        .map(s => ({
            Name: s.name,
            Department: s.department,
            Backlogs: (s as Record<string, any>).backlogs,
            CGPA: s.cgpa
        }));
      downloadCSV(data, 'Students_With_Backlogs.csv');
  };

  // ==========================================
  // 2️⃣ PLACEMENT REPORTS (REAL DATA)
  // ==========================================
  const generatePlacedStudentsReport = () => {
    const data = students
      .filter(s => s.placedCompany) // Only gets students with a value in 'placedCompany'
      .map(s => ({
        Name: s.name,
        Department: s.department,
        Company: s.placedCompany,
        Designation: (s as Record<string, any>).designation || 'Trainee',
        Package: (s as Record<string, any>).salary || 'N/A'
      }));
    downloadCSV(data, `Placed_Students_List.csv`);
  };

  const generateCompanyWiseStats = () => {
    const stats: Record<string, any> = {};
    students.filter(s => s.placedCompany).forEach(s => {
      const comp = s.placedCompany || 'Unknown';
      if(!stats[comp]) stats[comp] = { Count: 0, Depts: new Set() };
      stats[comp].Count++;
      stats[comp].Depts.add(s.department);
    });

    const data = Object.keys(stats).map(comp => ({
      Company: comp,
      Hired_Count: stats[comp].Count,
      Departments_Hired: Array.from(stats[comp].Depts).join(' & ')
    }));
    downloadCSV(data, `Company_Placement_Stats.csv`);
  };

  // ==========================================
  // 3️⃣ DRIVE REPORTS (REAL DATA)
  // ==========================================
  const generateDriveReport = () => {
    if (!jobs || jobs.length === 0) {
        toast({ title: "No Data", description: "No drives found in the system.", variant: "destructive" });
        return;
    }

    const data = jobs.map((j: any) => ({
      Company: j.companyName,
      Role: j.title,
      Date: j.deadline ? new Date(j.deadline).toLocaleDateString() : 'N/A',
      Type: j.type,
      Status: j.status,
      Applicants: j.applicants?.length || 0
    }));
    downloadCSV(data, `Drive_Report.csv`);
  };

  // ==========================================
  // 4️⃣ ELIGIBILITY REPORTS (REAL DATA)
  // ==========================================
  const generateEligibleStudents = () => {
    // Dynamic Filter: CGPA > 7.0 and No Backlogs
    const criteriaCGPA = 7.0;
    const data = students
      .filter(s => (s.cgpa || 0) >= criteriaCGPA && ((s as any).backlogs || 0) === 0)
      .map(s => ({
        Name: s.name,
        Dept: s.department,
        CGPA: s.cgpa,
        Backlogs: (s as any).backlogs || 0,
        Email: s.email
      }));
    
    downloadCSV(data, `Eligible_Students_CGPA_7+.csv`);
  };

  // --- UI COMPONENTS ---
  const ReportCard = ({ title, desc, icon: Icon, onClick, color }: any) => (
    <motion.div whileHover={{ y: -3 }} onClick={onClick} className="cursor-pointer h-full">
      <Card className="hover:border-primary transition-colors h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mt-2">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Report Center</h1>
          <p className="text-slate-500 mt-1">
             {isLoading ? "Fetching latest data..." : `Generating reports from ${students.length} student records.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => dispatch(fetchAllStudents())}>
             <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print View
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT TABS */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="drives">Drives</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
        </TabsList>

        {/* 1. STUDENT TAB */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ReportCard 
              title="Master Database" 
              desc="Export all registered students." 
              icon={Users} 
              color="text-primary"
              onClick={generateTotalStudentsReport}
            />
            <ReportCard 
              title="Department Analysis" 
              desc="Count breakdown by Dept." 
              icon={FileSpreadsheet} 
              color="text-green-500"
              onClick={generateDeptWiseReport}
            />
             <ReportCard 
              title="Backlog Report" 
              desc="Students with active backlogs." 
              icon={FileText} 
              color="text-red-500"
              onClick={generateBacklogReport}
            />
          </div>
        </TabsContent>

        {/* 2. PLACEMENT TAB */}
        <TabsContent value="placements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ReportCard 
              title="Placed Students" 
              desc="List of all placed students." 
              icon={Award} 
              color="text-yellow-500"
              onClick={generatePlacedStudentsReport}
            />
            <ReportCard 
              title="Company Statistics" 
              desc="Company-wise hiring numbers." 
              icon={Briefcase} 
              color="text-purple-500"
              onClick={generateCompanyWiseStats}
            />
            <ReportCard 
              title="Unplaced Students" 
              desc="Students yet to be placed." 
              icon={Users} 
              color="text-slate-500"
              onClick={() => {
                const data = students.filter(s => !s.placedCompany);
                downloadCSV(data, 'Unplaced_Students.csv');
              }}
            />
          </div>
        </TabsContent>

        {/* 3. DRIVES TAB */}
        <TabsContent value="drives" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReportCard 
              title="Drive Summary" 
              desc="Recruitment drives status." 
              icon={Briefcase} 
              color="text-primary"
              onClick={generateDriveReport}
            />
            <ReportCard 
              title="Internships" 
              desc="Internship drives data." 
              icon={FileText} 
              color="text-orange-600"
              onClick={() => {
                  if(!jobs || jobs.length === 0) {
                      toast({ title: "No Data", description: "No drives found.", variant: "destructive" });
                      return;
                  }
                  const data = jobs.filter((j: any) => j.type === 'Internship');
                  downloadCSV(data, 'Internship_Drives.csv');
              }}
            />
          </div>
        </TabsContent>

        {/* 4. ELIGIBILITY TAB */}
        <TabsContent value="eligibility" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReportCard 
              title="Elite Pool (CGPA > 7.0)" 
              desc="Eligible for premium companies." 
              icon={Award} 
              color="text-pink-500"
              onClick={generateEligibleStudents}
            />
            <ReportCard 
              title="Non-Eligible List" 
              desc="CGPA < 6.0 or Backlogs." 
              icon={FileText} 
              color="text-red-500"
              onClick={() => {
                const data = students.filter(s => (s.cgpa || 0) < 6.0 || ((s as any).backlogs || 0) > 0);
                downloadCSV(data, 'Non_Eligible_Students.csv');
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* RECENT REPORTS UI */}
      <Card>
        <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Select a category above to generate live reports based on current database.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-slate-500 italic">
               * All reports are generated in real-time using the {students.length} student records currently in the system.
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
