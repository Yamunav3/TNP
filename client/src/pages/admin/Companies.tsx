

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { addDrive, deleteDrive, fetchDrives } from '@/store/slices/drivesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Building2, MapPin, Briefcase, Link as LinkIcon, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // Added Badge for status

const Companies: React.FC = () => {
  const dispatch = useAppDispatch();
  const { drives, loading } = useAppSelector((state) => state.drives);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deletion state per item

  useEffect(() => {
    dispatch(fetchDrives());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    companyName: '',
    applicationLink: '',
    role: '',
    package: '',
    location: '',
    deadline: '',
    minCGPA: 0,
    description: 'Join our amazing team...',
  });

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.role || !formData.applicationLink) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    const newDriveData = {
      companyName: formData.companyName,
      applicationLink: formData.applicationLink,
      companyLogo: `https://ui-avatars.com/api/?name=${formData.companyName}&background=random`,
      role: formData.role,
      package: formData.package,
      location: formData.location,
      deadline: formData.deadline,
      description: formData.description,
      jobType: 'Full-time',
      requirements: ['Good communication'],
      eligibility: {
        minCGPA: Number(formData.minCGPA),
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'ECE', 'IT'],
        batch: [2024, 2025]
      },
      selectionProcess: [{ round: 1, name: 'Resume Shortlisting', description: 'Based on criteria' }]
    };

    try {
      await dispatch(addDrive(newDriveData)).unwrap(); // Use unwrap to catch errors
      toast({ title: "Success", description: "Drive added successfully!" });
      setIsOpen(false);
      setFormData({ companyName: '', applicationLink: '', role: '', package: '', location: '', deadline: '', minCGPA: 0, description: '' });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add drive.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This will remove the drive from ALL student dashboards.")) return;

    setIsDeleting(id); // Show loader on specific button
    try {
      await dispatch(deleteDrive(id)).unwrap();
      toast({ title: "Deleted", description: "Drive and associated applications removed." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete drive.", variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Recruitment Drives</h1>
            <p className="text-muted-foreground mt-1">Manage active listings and applications.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all"><Plus className="w-4 h-4" /> Add Drive</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Drive</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Company Name</Label><Input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Google" /></div>
                 <div className="space-y-2"><Label>Role</Label><Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="SDE I" /></div>
              </div>
              <div className="space-y-2">
                 <Label>Application Link</Label>
                 <Input value={formData.applicationLink} onChange={e => setFormData({...formData, applicationLink: e.target.value})} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Package (LPA)</Label><Input value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} placeholder="12 LPA" /></div>
                 <div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Remote" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Min CGPA</Label><Input type="number" step="0.1" value={formData.minCGPA} onChange={e => setFormData({...formData, minCGPA: parseFloat(e.target.value)})} /></div>
              </div>
            </div>
            <DialogFooter>
               <Button onClick={handleSubmit}>Publish Drive</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && drives.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drives.map((drive) => (
            <Card key={drive._id || drive.id} className="hover:shadow-md transition-shadow relative group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={drive.companyLogo} alt="logo" className="w-12 h-12 rounded-xl bg-slate-50 border p-1 object-contain" />
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{drive.companyName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{drive.role}</p>
                    </div>
                  </div>
                  {/* Delete Button with Loading State */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2" 
                    onClick={() => handleDelete(drive._id || drive.id || '')}
                    disabled={isDeleting === (drive._id || drive.id)}
                  >
                      {isDeleting === (drive._id || drive.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="font-normal bg-slate-100">{drive.package || 'N/A'}</Badge>
                        <span className="text-xs text-slate-400">{drive.location}</span>
                    </div>
                    
                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Min CGPA: {drive.eligibility?.minCGPA || 0}</span>
                        </div>
                        {drive.deadline && (
                            <span className={new Date(drive.deadline) < new Date() ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                                {new Date(drive.deadline) < new Date() ? "Closed" : "Active"}
                            </span>
                        )}
                    </div>

                    {drive.applicationLink && (
                        <div className="pt-2">
                            <a 
                                href={drive.applicationLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center justify-center w-full gap-2 text-xs font-medium text-primary bg-primary/5 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                                <LinkIcon className="w-3 h-3" /> View Application
                            </a>
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;