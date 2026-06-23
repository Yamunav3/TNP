import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import defaultToast from 'react-hot-toast';
import {
  Search, MapPin, Clock, Users, ChevronDown, Briefcase, Check, X,
  SlidersHorizontal, Bookmark, AlertCircle, TrendingUp,
  FileText, GraduationCap, ListChecks, ExternalLink
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';

// --- IMPORTS ---
import { setFilters, applyFilters, applyToDrive, fetchDrives } from '@/store/slices/drivesSlice';
// Use submitApplication instead of addApplication for dynamic handling
import { submitApplication } from '@/store/slices/applicationsSlice'; 

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DrivesPage: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useAppDispatch();
  const { user, isProfileComplete } = useAuth();

  const { filteredDrives, filters, drives, loading } = useAppSelector((state) => state.drives);
  const { profile } = useAppSelector((state) => state.profile);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [savedDrives, setSavedDrives] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null); // Track which drive is applying

  // --- EFFECT: FETCH DRIVES ---
  useEffect(() => {
    dispatch(fetchDrives());
  }, [dispatch]);

  // --- EFFECT: SOCKET LISTENERS FOR REAL-TIME UPDATES ---
  useEffect(() => {
    if (!profile) return;

    const socket = io(API_URL, {
      query: { 
        userId: (profile as any)._id, 
        role: "student" 
      }
    });

    // Listen for application submission (to refresh drive counts)
    socket.on('notification', (data) => {
      if (data.title === 'Application Submitted') {
        console.log('📢 Application submitted, refreshing drives...', data);
        dispatch(fetchDrives()); // Refresh to update totalApplicants count
      }
    });

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, [profile, dispatch]);

  // --- EFFECT: FILTER & SEARCH ---
  useEffect(() => {
    dispatch(applyFilters());
  }, [dispatch, filters, drives]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchValue }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, dispatch]);

  // (No global search sync — drive search is independent)

  // --- ELIGIBILITY LOGIC ---
    const checkEligibility = (eligibility: Record<string, any>) => {
    const reasons = [];
    
    // First check if profile is complete
    if (!isProfileComplete()) {
        reasons.push("Profile is incomplete. Complete your profile first!");
        return { isEligible: false, reasons };
    }
    
    if (!user || !eligibility) return { isEligible: true, reasons: [] };
    
    if ((user.cgpa || 0) < eligibility.minCGPA) {
        reasons.push(`Required CGPA: ${eligibility.minCGPA} (Yours: ${user.cgpa})`);
    }
    
    if ((user.backlogs || 0) > eligibility.maxBacklogs) {
        reasons.push(`Max Backlogs Allowed: ${eligibility.maxBacklogs} (Yours: ${user.backlogs})`);
    }

    return { isEligible: reasons.length === 0, reasons };
  };

  // --- HANDLERS ---
  const handleApply = async (driveId: string, drive: Record<string, any>) => {
    // 1. Eligibility Check
    const { isEligible, reasons } = checkEligibility(drive.eligibility);
    if (!isEligible) {
      toast({ variant: "destructive", title: "Not Eligible", description: `Issues: ${reasons.join(', ')}` });
      return;
    }

    // 2. Auth Check
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to apply.", variant: "destructive" });
        return;
    }

    setApplyingId(driveId);

    try {
        // --- CRITICAL FIX: CONSTRUCT THE PAYLOAD ---
        // We must extract the IDs explicitly so the backend understands who is applying.
        const applicationPayload = {
            driveId: drive._id || drive.id,           // Handle MongoDB _id
            studentId: user._id || user.id,           // Get Student ID from Auth Context
            studentName: user.name || user.firstName || "Student" // Get Name for notification
        };

        console.log("📤 Sending Application:", applicationPayload); // Debug Log

        // 3. Submit the constructed payload (NOT the raw drive object)
        await dispatch(submitApplication(applicationPayload)).unwrap();

        // 4. Update UI
        dispatch(applyToDrive(driveId));

        if (drive.applicationLink && drive.applicationLink.startsWith('http')) {
            toast({ 
                title: "Application Recorded", 
                description: "Opening external application form..." 
            });
            setTimeout(() => window.open(drive.applicationLink, '_blank'), 1000);
        } else {
            toast({ 
                title: "Applied Successfully! 🎉", 
                description: `You have successfully applied for ${drive.role} at ${drive.companyName}.` 
            });
        }
    } catch (error: unknown) {
      console.error("❌ Application Failed:", error);
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: "Application Failed",
        description: msg || "Could not submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingId(null);
    }
  };

  const toggleSaveDrive = (id: string) => {
    if (savedDrives.includes(id)) {
      setSavedDrives(prev => prev.filter(d => d !== id));
      toast({ description: "Removed from bookmarks." });
    } else {
      setSavedDrives(prev => [...prev, id]);
      toast({ description: "Saved to bookmarks!" });
    }
  };

  const isUrgent = (dateString: string) => {
    if (!dateString) return false;
    const diffDays = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const jobTypes = ['Full-time', 'Internship', 'Part-time'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10">
      {/* Profile Incompletion Warning */}
      <AnimatePresence>
        {!isProfileComplete() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                  Profile Incomplete
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-0">
                  You need to complete your profile to be eligible for any placement drives. Please fill in your academic details and contact information!
                </p>
              </div>
              <div className="w-full md:w-auto">
                <Button
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
                  onClick={() => window.location.href = '/dashboard/profile'}
                >
                  Complete Profile Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Placement Drives</h1>
          <p className="text-muted-foreground mt-1">
             {loading ? "Loading opportunities..." : `Browse ${drives.length} active opportunities`}
          </p>
        </div>
        <div className="hidden md:flex gap-4 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg border">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4"/> CGPA: <b className="text-primary">{user?.cgpa || "N/A"}</b>
          </span>
          <span className="w-px bg-border h-4 self-center"/>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4"/> Backlogs: <b className="text-primary">{user?.backlogs || 0}</b>
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="pl-9" />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px]"><Briefcase className="w-4 h-4 mr-2" /> Job Type <ChevronDown className="w-4 h-4 ml-2" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {jobTypes.map((type) => (
                    <DropdownMenuCheckboxItem key={type} checked={filters.jobType.includes(type)} onCheckedChange={(checked) => {
                        const newTypes = checked ? [...filters.jobType, type] : filters.jobType.filter((t) => t !== type);
                        dispatch(setFilters({ jobType: newTypes }));
                    }}>
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={filters.sortBy} onValueChange={(value: any) => dispatch(setFilters({ sortBy: value }))}>
                <SelectTrigger className="w-[180px]"><SlidersHorizontal className="w-4 h-4 mr-2" /><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Deadline (Earliest)</SelectItem>
                  <SelectItem value="package">Package (Highest)</SelectItem>
                  <SelectItem value="posted">Recently Posted</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-secondary/50 transition-colors">
                <Switch id="eligible-only" checked={filters.eligibleOnly} onCheckedChange={(checked) => dispatch(setFilters({ eligibleOnly: checked }))} />
                <Label htmlFor="eligible-only" className="text-sm cursor-pointer">Eligible only</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* DRIVES GRID */}
      <motion.div variants={containerVariants} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDrives.map((drive) => {
            const eligibilityCheck = checkEligibility(drive.eligibility);
            const isClosingSoon = isUrgent(drive.deadline);
            const isApplying = applyingId === (drive.id || drive._id);
            
            return (
              <motion.div key={drive.id || drive._id} variants={itemVariants} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className={cn("card-hover h-full flex flex-col relative group transition-all duration-300", !eligibilityCheck.isEligible && "opacity-75 bg-secondary/20", drive.applied && "border-green-200 dark:border-green-900")}>
                  <CardContent className="p-5 flex flex-col h-full">
                    {isClosingSoon && !drive.applied && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-xl" />}
                    <button onClick={() => toggleSaveDrive(drive.id || drive._id)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors z-10">
                      <Bookmark className={cn("w-5 h-5", savedDrives.includes(drive.id || drive._id) ? "fill-primary text-primary" : "")} />
                    </button>

                    <div className="flex items-start gap-4 mb-4 pr-8">
                      <div className="w-14 h-14 rounded-xl bg-white border flex items-center justify-center p-2 shadow-sm">
                        <img src={drive.companyLogo} alt={drive.companyName} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${drive.companyName}&background=random` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{drive.companyName}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">{drive.role} {isClosingSoon && !drive.applied && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full animate-pulse">Closing Soon</span>}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block cursor-help">
                              <Badge variant={eligibilityCheck.isEligible ? "default" : "destructive"} className="gap-1">
                                {eligibilityCheck.isEligible ? <><Check className="w-3 h-3" /> Eligible</> : <><X className="w-3 h-3" /> Not Eligible</>}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          {!eligibilityCheck.isEligible && <TooltipContent><p className="font-semibold">Issues:</p><ul className="list-disc pl-4 text-xs">{eligibilityCheck.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></TooltipContent>}
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-4 flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground col-span-2"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{drive.location}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-muted-foreground">Package</span><span className="font-bold text-primary flex items-center gap-1">{drive.package} <TrendingUp className="w-3 h-3 text-green-500" /></span></div>
                      <div className="flex flex-col items-end"><span className="text-xs text-muted-foreground">Applicants</span><span className="font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> {drive.totalApplicants}</span></div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
                      <Clock className="w-3 h-3" /><span>Deadline: </span><span className={cn("font-medium", isClosingSoon ? "text-red-600" : "text-foreground")}>{drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'N/A'}</span>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="flex-1 w-full hover:bg-secondary/80">Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col gap-0">
                          <DialogHeader className="p-6 pb-2 border-b">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-muted border flex items-center justify-center p-2">
                                    <img src={drive.companyLogo} alt={drive.companyName} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl">{drive.companyName}</DialogTitle>
                                    <DialogDescription className="text-base">{drive.role} • {drive.package}</DialogDescription>
                                </div>
                            </div>
                          </DialogHeader>
                          
                          <ScrollArea className="flex-1 p-6">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="w-full mb-4">
                                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                                    <TabsTrigger value="eligibility" className="flex-1">Eligibility</TabsTrigger>
                                    <TabsTrigger value="process" className="flex-1">Selection Process</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary"/> Job Description</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{drive.description || "No description provided."}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary"/> Key Requirements</h4>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            {drive.requirements?.length > 0 ? drive.requirements.map((req: string, i: number) => (
                                                <li key={i}>{req}</li>
                                            )) : <li>No specific requirements listed.</li>}
                                        </ul>
                                    </div>
                                    {drive.applicationLink && (
                                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
                                            <ExternalLink className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">External Application</p>
                                                <p className="text-xs text-muted-foreground">Applying will redirect you to the official form.</p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="eligibility" className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className={cn("p-4 rounded-xl border flex justify-between items-center", (user?.cgpa || 0) >= drive.eligibility?.minCGPA ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                                            <div><p className="text-sm font-medium">Minimum CGPA</p><p className="text-xs text-muted-foreground">Required: {drive.eligibility?.minCGPA}</p></div>
                                            <span className="text-xl font-bold">{drive.eligibility?.minCGPA}</span>
                                        </div>
                                        <div className={cn("p-4 rounded-xl border flex justify-between items-center", (user?.backlogs || 0) <= drive.eligibility?.maxBacklogs ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                                            <div><p className="text-sm font-medium">Maximum Backlogs</p><p className="text-xs text-muted-foreground">Allowed: {drive.eligibility?.maxBacklogs}</p></div>
                                            <span className="text-xl font-bold">{drive.eligibility?.maxBacklogs}</span>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="process" className="space-y-4">
                                    <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2 pl-6">
                                        {drive.selectionProcess?.length > 0 ? drive.selectionProcess.map((round: any, i: number) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                                                <h4 className="font-semibold text-sm">Round {round.round}: {round.name}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">{round.description}</p>
                                            </div>
                                        )) : <p className="text-sm text-muted-foreground">Selection process details will be updated soon.</p>}
                                    </div>
                                </TabsContent>
                            </Tabs>
                          </ScrollArea>

                          <DialogFooter className="p-4 border-t bg-muted/20">
                             {drive.applied ? (
                                <Button disabled className="w-full bg-green-100 text-green-700 border-green-200"><Check className="w-4 h-4 mr-2"/> Applied Successfully</Button>
                             ) : (
                                <Button className="w-full" disabled={!eligibilityCheck.isEligible || isApplying} onClick={() => handleApply(drive.id || drive._id, drive)}>
                                    {isApplying ? "Submitting..." : (drive.applicationLink ? "Proceed to Application" : "Apply for this Drive")}
                                    {drive.applicationLink && <ExternalLink className="w-4 h-4 ml-2" />}
                                </Button>
                             )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {drive.applied ? (
                        <Button disabled className="flex-1 bg-green-500/10 text-green-700 border border-green-200 opacity-100"><Check className="w-4 h-4 mr-2" /> Applied</Button>
                      ) : (
                        <Button 
                            className="flex-1 gradient-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            disabled={!eligibilityCheck.isEligible || isApplying} 
                            onClick={() => handleApply(drive.id || drive._id, drive)}
                        >
                            {isApplying ? "Applying..." : "Apply Now"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredDrives.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 animate-bounce"><Briefcase className="w-10 h-10 text-muted-foreground" /></div>
          <h3 className="text-xl font-semibold mb-2">No active drives found</h3>
          <Button variant="outline" onClick={() => { setSearchValue(''); dispatch(setFilters({ search: '', jobType: [], eligibleOnly: false })); }}>Reset Filters</Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DrivesPage;
