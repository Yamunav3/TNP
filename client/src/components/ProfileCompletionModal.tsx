import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { GraduationCap, MapPin, Phone, Briefcase, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileCompletionModal: React.FC = () => {
  const { user, updateUser, isProfileComplete, hasDismissedProfileModal, dismissProfileModal } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isStudent = user?.role === 'student';

  // Show modal if profile is incomplete AND (we haven't dismissed OR we're on drives page)
  const shouldShowModal = !hasDismissedProfileModal;
  const isOnDrivesPage = location.pathname.includes('/drives');
  
  const [open, setOpen] = useState(shouldShowModal);
  
  // Update open state if location or profile completion changes
  React.useEffect(() => {
    if (!isProfileComplete()) {
      if (isOnDrivesPage || !hasDismissedProfileModal) {
        setOpen(true);
      }
    } else {
      setOpen(false);
    }
  }, [isProfileComplete, isOnDrivesPage, hasDismissedProfileModal]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: user?.cgpa?.toString() || '',
    backlogs: user?.backlogs?.toString() || '0',
    department: user?.department || '',
    year: user?.year || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const completionPercentage = () => {
    let count = 0;
    if (user?.name) count++;
    if (user?.email) count++;
    if (user?.cgpa) count++;
    if (user?.department) count++;
    if (user?.year) count++;
    if (user?.phone) count++;
    return Math.round((count / 6) * 100);
  };

  if (!isStudent || isProfileComplete()) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        userId: user?._id,
        cgpa: parseFloat(formData.cgpa),
        backlogs: parseInt(formData.backlogs),
        department: formData.department,
        year: formData.year,
        phone: formData.phone,
        address: formData.address,
      };
      
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, payload);
      const updatedUser = res.data?.user ?? res.data;
      
      if (updatedUser) {
        updateUser({ ...updatedUser, ...payload });
      }
      
      setOpen(false);
      toast({
        title: "Profile Complete! 🎉",
        description: "You're now eligible to see all job opportunities!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && !isOnDrivesPage) dismissProfileModal();
      setOpen(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-primary/5 to-accent/10 dark:from-slate-900 dark:to-slate-800 border-none">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isOnDrivesPage ? "Complete Your Profile to Apply!" : "Complete Your Profile!"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            {isOnDrivesPage 
              ? "You need to complete your profile to become eligible for placement drives!" 
              : "Fill in these details to unlock all job opportunities and get personalized recommendations!"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 my-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Profile Completion</span>
            <span className="font-bold text-primary">{completionPercentage()}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage()}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-primary-dark"
            />
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> CGPA
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="8.5"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Backlogs</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.backlogs}
                onChange={(e) => setFormData({ ...formData, backlogs: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Department
              </Label>
              <Input
                placeholder="Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input
                placeholder="2027"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </Label>
            <Input
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Address
            </Label>
            <Input
              placeholder="City, State"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3">
          {!isOnDrivesPage && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                dismissProfileModal();
                setOpen(false);
              }}
            >
              Maybe Later
            </Button>
          )}
          <Button
            className={`${isOnDrivesPage ? 'flex-1' : 'flex-1'} bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCompletionModal;
