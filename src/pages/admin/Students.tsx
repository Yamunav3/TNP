
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MoreVertical, Mail, Eye, Download, ChevronLeft, ChevronRight,
  UserCheck, Briefcase, GraduationCap, Users, FileSpreadsheet, Trash2,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { fetchAllStudents, deleteStudent, fetchStudentById, clearSelectedStudent } from '@/store/slices/adminSlice';
import { useToast } from '@/hooks/use-toast';

const Students: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Refs for File Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { students, selectedStudent, isLoading } = useAppSelector((state) => state.admin);

  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  // Reset pagination when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deptFilter, sortBy]);

  // --- FILTERING & SORTING LOGIC ---
  const filteredStudents = useMemo(() => {
      // 1. Filter
      let result = students.filter(student => {
        const sName = student.name?.toLowerCase() || '';
        const sEmail = student.email?.toLowerCase() || '';
        const sDept = student.department || 'Unknown';
        
        const matchesSearch = sName.includes(searchQuery.toLowerCase()) || sEmail.includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === 'all' || sDept === deptFilter;
        
        return matchesSearch && matchesDept;
      });

      // 2. Sort
      if (sortBy === 'cgpa') {
          result.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
      } 
      else if (sortBy === 'name') {
          result.sort((a, b) => a.name.localeCompare(b.name));
      } 
      else if (sortBy === 'company') {
          result.sort((a, b) => {
              const companyA = a.placedCompany || 'zzz'; 
              const companyB = b.placedCompany || 'zzz';
              return companyA.localeCompare(companyB);
          });
      }
      else if (sortBy === 'applications') {
          result.sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0));
      }

      return result;
  }, [students, searchQuery, deptFilter, sortBy]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => [
    { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Placed', value: students.filter(s => s.placedCompany).length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active', value: students.filter(s => !s.placedCompany).length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg CGPA', value: (students.reduce((acc, curr) => acc + (curr.cgpa || 0), 0) / (students.length || 1)).toFixed(2), icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-50' },
  ], [students]);

  // --- HANDLERS ---

  // 1. Export Handler (CSV)
  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast({ title: "No Data", description: "There are no students to export.", variant: "destructive" });
      return;
    }

    const headers = ["Name", "Email", "Phone", "Department", "Year", "CGPA", "Status", "Placed Company"];
    
    const rows = filteredStudents.map(s => [
      `"${s.name}"`, 
      `"${s.email}"`, 
      `"${(s as any).phone || ''}"`, 
      `"${s.department}"`, 
      `"${s.year}"`, 
      `"${s.cgpa}"`, 
      `"${s.placedCompany ? 'Placed' : 'Active'}"`, 
      `"${s.placedCompany || '-'}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Successful", description: `${filteredStudents.length} records exported.` });
  };

  // 2. Import Handler (Trigger)
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 3. Import File Processing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      const parseCSVLine = (str: string) => {
          const arr = [];
          let quote = false;
          let col = "";
          for (let c of str) {
              if (c === '"') { quote = !quote; continue; }
              if (c === ',' && !quote) { arr.push(col); col = ""; continue; }
              col += c;
          }
          arr.push(col);
          return arr;
      };

      const data = lines.slice(1).map(line => {
        if (!line.trim()) return null;
        const columns = parseCSVLine(line);
        return { 
          name: columns[0]?.trim(), 
          email: columns[1]?.trim(), 
          department: columns[2]?.trim(), 
          year: columns[3]?.trim(), 
          cgpa: parseFloat(columns[4]?.trim() || '0') 
        };
      }).filter(Boolean);

      console.log("Parsed CSV Data:", data);
      
      toast({ 
        title: "Import Simulated", 
        description: `Parsed ${data.length} students from CSV. (Backend integration required to save)` 
      });
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleViewProfile = (id: string) => {
      dispatch(fetchStudentById(id));
      setIsProfileOpen(true);
  };

  const closeProfile = () => {
      setIsProfileOpen(false);
      setTimeout(() => dispatch(clearSelectedStudent()), 300);
  };

  const handleDelete = async (id: string) => {
      if(window.confirm("Are you sure you want to delete this student?")) {
          await dispatch(deleteStudent(id));
          toast({ title: "Student Deleted", description: "The student record has been removed." });
      }
  }

  const getStatusBadge = (status: string = 'active') => {
    const variants: any = {
      placed: { label: 'Placed', className: 'bg-green-100 text-green-700 border-green-200' },
      active: { label: 'Active', className: 'text-slate-600' },
    };
    return variants[status] || variants.active;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedStudents(paginatedStudents.map(s => s._id));
    else setSelectedStudents([]);
  };

  const handleSelectOne = (id: string) => {
    if (selectedStudents.includes(id)) setSelectedStudents(prev => prev.filter(sid => sid !== id));
    else setSelectedStudents(prev => [...prev, id]);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Students Directory</h1>
          <p className="text-slate-500 mt-1">Manage {students.length} registered students.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".csv" 
          />
          
          <Button variant="outline" className="gap-2" onClick={handleImportClick}>
            <FileSpreadsheet className="w-4 h-4" /> Import CSV
          </Button>
          
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTERS & TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                <SelectItem value="Computer Science and Engineering">CSE</SelectItem>
                <SelectItem value="CSE - Artificial Intelligence and Machine Learning">CSE (AIML)</SelectItem>
                <SelectItem value="CSE - Artificial Intelligence and Data Science">CSE (AIDS)</SelectItem>
                <SelectItem value="Information Technology">IT</SelectItem>
                <SelectItem value="Electronics and Communication Engineering">ECE</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort Students</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setSortBy('cgpa')} className="cursor-pointer">
                    Sort by CGPA (High - Low)
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setSortBy('company')} className="cursor-pointer">
                    Sort by Company (Placed)
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setSortBy('applications')} className="cursor-pointer">
                    Sort by Application Count
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setSortBy('name')} className="cursor-pointer">
                    Sort by Name (A - Z)
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('default')} className="cursor-pointer text-muted-foreground">
                    Reset Sort
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Selected Actions Bar */}
        <AnimatePresence>
          {selectedStudents.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 flex items-center justify-between border-b border-indigo-100 dark:border-indigo-800">
              <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{selectedStudents.length} selected</span>
              <Button size="sm" variant="destructive" className="h-8"><Trash2 className="w-3 h-3 mr-2" /> Delete Selected</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 w-[40px]"><Checkbox checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0} onCheckedChange={handleSelectAll} /></th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Dept & Year</th>
                <th className="px-4 py-3">CGPA</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && paginatedStudents.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading students...</td></tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => {
                  const isPlaced = !!student.placedCompany;
                  const statusInfo = getStatusBadge(isPlaced ? 'placed' : 'active');
                  
                  return (
                    /* FIXED: ADDED "group" CLASS HERE so children can use group-hover */
                    <motion.tr key={student._id} className="group hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3"><Checkbox checked={selectedStudents.includes(student._id)} onCheckedChange={() => handleSelectOne(student._id)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{student.name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{student.department || 'N/A'}</span> <span className="text-slate-400">•</span> {student.year || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{student.cgpa || '0.00'}</td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${student.applicationCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <span className={`font-medium ${student.applicationCount > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                {student.applicationCount} Applied
                            </span>
                         </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`font-normal ${statusInfo.className}`}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* Icons use group-hover:opacity-100, so parent TR needs 'group' class */}
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" onClick={() => handleViewProfile(student._id)}><Eye className="w-4 h-4" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewProfile(student._id)}>View Profile</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(student._id)}>Delete Student</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{paginatedStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> students
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- STUDENT PROFILE DIALOG --- */}
      <Dialog open={isProfileOpen} onOpenChange={closeProfile}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b">
             <DialogTitle>Student Profile</DialogTitle>
             <DialogDescription>Detailed view of academic performance and applications.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
             {isLoading && !selectedStudent ? (
                 <div className="flex justify-center py-10 text-slate-500">Loading details...</div>
             ) : selectedStudent ? (
                 <div className="space-y-8">
                     {/* 1. Header Info */}
                     <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-lg">
                            {selectedStudent.name?.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {selectedStudent.email}</span>
                                <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {selectedStudent.phone || 'N/A'}</span>
                                <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4"/> {selectedStudent.department} ({selectedStudent.year})</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-sm text-slate-500">CGPA</div>
                             <div className="text-3xl font-bold text-indigo-600">{selectedStudent.cgpa}</div>
                        </div>
                     </div>

                     {/* 2. Academic Details Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-semibold">Roll Number</p>
                             <p className="font-medium">{selectedStudent.rollNumber || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-semibold">Backlogs</p>
                             <p className={`font-medium ${selectedStudent.backlogs && selectedStudent.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>{selectedStudent.backlogs || 0}</p>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
                             <Badge>Active</Badge>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-semibold">Applications</p>
                             <p className="font-medium">{(selectedStudent.applications || []).length}</p>
                         </div>
                     </div>

                     {/* 3. Applications Table */}
                     <div>
                         <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                             <Briefcase className="w-5 h-5 text-indigo-600" /> Applied Companies
                         </h3>
                         <div className="border rounded-lg overflow-hidden">
                             <table className="w-full text-sm">
                                 <thead className="bg-slate-50 text-slate-500">
                                      <tr>
                                          <th className="px-4 py-2 text-left">Company</th>
                                          <th className="px-4 py-2 text-left">Role</th>
                                          <th className="px-4 py-2 text-left">Applied Date</th>
                                          <th className="px-4 py-2 text-left">Status</th>
                                      </tr>
                                 </thead>
                                 <tbody className="divide-y">
                                     {(selectedStudent.applications || []).length > 0 ? (
                                         selectedStudent.applications.map((app: any, idx: number) => (
                                              <tr key={idx}>
                                                  <td className="px-4 py-3 font-medium">{app.companyName}</td>
                                                  <td className="px-4 py-3 text-slate-500">{app.role || '-'}</td>
                                                  <td className="px-4 py-3 text-slate-500">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                                  <td className="px-4 py-3">
                                                      <Badge variant="outline" className={app.status === 'selected' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                                                           {app.status}
                                                      </Badge>
                                                  </td>
                                              </tr>
                                         ))
                                     ) : (
                                         <tr>
                                             <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                                  No applications found.
                                             </td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="text-center py-10">Student details unavailable.</div>
             )}
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t">
              <Button onClick={closeProfile}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Students;