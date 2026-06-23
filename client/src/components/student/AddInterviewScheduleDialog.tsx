import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

interface AddInterviewScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleAdded?: () => void;
}

interface Application {
  _id: string;
  status: string;
  appliedDate: string;
  driveId: {
    _id: string;
    companyName: string;
    role: string;
  };
}

const AddInterviewScheduleDialog: React.FC<AddInterviewScheduleDialogProps> = ({
  open,
  onOpenChange,
  onScheduleAdded,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const [formData, setFormData] = useState({
    applicationId: '',
    round: '',
    interviewType: 'online',
    interviewDate: '',
    interviewTime: '',
    interviewLink: '',
    location: '',
    description: ''
  });

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicationId) {
      toast({
        title: 'Error',
        description: 'Please select an application',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.interviewDate || !formData.interviewTime) {
      toast({
        title: 'Error',
        description: 'Please fill in date and time',
        variant: 'destructive'
      });
      return;
    }

    if (formData.interviewType === 'online' && !formData.interviewLink) {
      toast({
        title: 'Error',
        description: 'Please provide interview link for online interviews',
        variant: 'destructive'
      });
      return;
    }

    if (formData.interviewType === 'offline' && !formData.location) {
      toast({
        title: 'Error',
        description: 'Please provide location for offline interviews',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/interviews/add-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: formData.applicationId,
          round: formData.round,
          interviewType: formData.interviewType,
          interviewDate: formData.interviewDate,
          interviewTime: formData.interviewTime,
          interviewLink: formData.interviewLink,
          location: formData.location,
          description: formData.description
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Interview schedule added successfully!'
        });
        setFormData({
          applicationId: '',
          round: '',
          interviewType: 'online',
          interviewDate: '',
          interviewTime: '',
          interviewLink: '',
          location: '',
          description: ''
        });
        onOpenChange(false);
        onScheduleAdded?.();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to add interview schedule',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding interview schedule:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Interview Schedule</DialogTitle>
          <DialogDescription>
            Manually add your interview schedule and track it in one place
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Application Selection */}
          <div className="space-y-2">
            <Label htmlFor="applicationId">Select Application *</Label>
            {loadingApps ? (
              <div className="flex items-center justify-center p-4 border rounded-lg bg-secondary/50">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                <span>Loading your applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <p className="text-sm text-amber-800">
                  📋 No applications yet. <a href="/student/drives" className="underline font-semibold hover:text-amber-900">Apply to a drive first</a>
                </p>
              </div>
            ) : (
              <Select value={formData.applicationId} onValueChange={(value) => handleSelectChange('applicationId', value)}>
                <SelectTrigger id="applicationId" className="w-full">
                  <SelectValue placeholder="Click to select an application" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {applications
                    .filter(app => app.driveId && app.driveId.companyName)
                    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
                    .map((app) => (
                      <SelectItem key={app._id} value={app._id}>
                        <div className="flex items-center gap-8">
                          <div>
                            <p className="font-semibold">{app.driveId?.companyName || 'Unknown Company'}</p>
                            <p className="text-xs text-muted-foreground">{app.driveId?.role || 'N/A'}</p>
                          </div>
                          <div className="text-xs">
                            <span className={`px-2 py-1 rounded-full ${
                              app.status === 'interview' ? 'bg-primary/10 text-primary' :
                              app.status === 'selected' ? 'bg-green-100 text-green-800' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              app.status === 'shortlisted' ? 'bg-accent/15 text-accent-foreground' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
            {applications.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {applications.length} application{applications.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          {/* Selected Application Preview */}
          {formData.applicationId && applications.length > 0 && (
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
              {(() => {
                const selectedApp = applications.find(a => a._id === formData.applicationId);
                if (!selectedApp) return null;
                return (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Selected Application</p>
                    <p className="font-semibold text-sm">{selectedApp.driveId.companyName}</p>
                    <p className="text-xs text-muted-foreground">{selectedApp.driveId.role}</p>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Interview Round */}
            <div className="space-y-2">
              <Label htmlFor="round">Interview Round *</Label>
              <Input
                id="round"
                name="round"
                placeholder="e.g., Technical Round 1"
                value={formData.round}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <Label htmlFor="interviewType">Interview Type *</Label>
              <Select value={formData.interviewType} onValueChange={(value) => handleSelectChange('interviewType', value)}>
                <SelectTrigger id="interviewType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Interview Date */}
            <div className="space-y-2">
              <Label htmlFor="interviewDate">Interview Date *</Label>
              <Input
                id="interviewDate"
                name="interviewDate"
                type="date"
                value={formData.interviewDate}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Interview Time */}
            <div className="space-y-2">
              <Label htmlFor="interviewTime">Interview Time *</Label>
              <Input
                id="interviewTime"
                name="interviewTime"
                type="time"
                value={formData.interviewTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Conditional: Interview Link for Online */}
          {formData.interviewType === 'online' && (
            <div className="space-y-2">
              <Label htmlFor="interviewLink">Interview Link * (e.g., Zoom, Google Meet)</Label>
              <Input
                id="interviewLink"
                name="interviewLink"
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                value={formData.interviewLink}
                onChange={handleInputChange}
                required={formData.interviewType === 'online'}
              />
            </div>
          )}

          {/* Conditional: Location for Offline */}
          {formData.interviewType === 'offline' && (
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Office address or venue details"
                value={formData.location}
                onChange={handleInputChange}
                required={formData.interviewType === 'offline'}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add any additional details about the interview..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Schedule'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInterviewScheduleDialog;
