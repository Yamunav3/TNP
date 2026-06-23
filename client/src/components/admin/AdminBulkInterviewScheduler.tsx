import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail, Users, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Drive {
  _id: string;
  companyName: string;
  role: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  selected: boolean;
}

interface InterviewScheduleRequest {
  driveId: string;
  studentIds: string[];
  round: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'online' | 'offline' | 'phone' | 'group';
  location?: string;
  interviewLink?: string;
  interviewer?: string;
  interviewerEmail?: string;
  description?: string;
}

const AdminBulkInterviewScheduler: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  const [drives, setDrives] = useState<Drive[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState<InterviewScheduleRequest>({
    driveId: '',
    studentIds: [],
    round: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'online',
    location: '',
    interviewLink: '',
    interviewer: '',
    interviewerEmail: '',
    description: ''
  });

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/drives`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDrives(data.drives || []);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
      toast({
        title: 'Error',
        description: 'Failed to load drives',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchStudentsForDrive = async (driveId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/applications/drive/${driveId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map applications to students
        const studentsList = data.applications?.map((app: Record<string, any>) => ({
          _id: app.studentId._id,
          name: app.studentId.name,
          email: app.studentId.email,
          selected: false
        })) || [];
        setStudents(studentsList);
        setFormData(prev => ({ ...prev, studentIds: [] }));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.studentIds.length === students.length) {
      setFormData(prev => ({ ...prev, studentIds: [] }));
    } else {
      setFormData(prev => ({
        ...prev,
        studentIds: students.map(s => s._id)
      }));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.driveId || formData.studentIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a drive and at least one student',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/interviews/create-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `${data.schedulesCount} interview schedules created and ${data.emailsCount} emails sent!`
        });
        setShowDialog(false);
        setFormData({
          driveId: '',
          studentIds: [],
          round: '',
          interviewDate: '',
          interviewTime: '',
          interviewType: 'online',
          location: '',
          interviewLink: '',
          interviewer: '',
          interviewerEmail: '',
          description: ''
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to create interview schedules',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating interview schedules:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Interview Scheduling</h2>
            <p className="text-muted-foreground mt-1">Create and manage interview schedules for students</p>
          </div>
          <Button 
            onClick={() => setShowDialog(true)}
            className="gradient-primary"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interviews
          </Button>
        </div>
      </motion.div>

      {/* Bulk Schedule Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interviews</DialogTitle>
            <DialogDescription>
              Create interview schedules for multiple students. They will receive email notifications automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drive Selection */}
            <div className="space-y-2">
              <Label htmlFor="driveId">Select Drive *</Label>
              <Select value={formData.driveId} onValueChange={(value) => handleSelectChange('driveId', value)}>
                <SelectTrigger id="driveId">
                  <SelectValue placeholder="Select a drive" />
                </SelectTrigger>
                <SelectContent>
                  {drives.map((drive) => (
                    <SelectItem key={drive._id} value={drive._id}>
                      {drive.companyName} - {drive.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            {formData.driveId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Students *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {formData.studentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                {students.length > 0 ? (
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                    {students.map((student) => (
                      <label key={student._id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-secondary rounded">
                        <input
                          type="checkbox"
                          checked={formData.studentIds.includes(student._id)}
                          onChange={() => handleStudentToggle(student._id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No students found for this drive
                  </div>
                )}
                
                {formData.studentIds.length > 0 && (
                  <Badge variant="secondary">
                    {formData.studentIds.length} student{formData.studentIds.length !== 1 ? 's' : ''} selected
                  </Badge>
                )}
              </div>
            )}

            {/* Interview Details */}
            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type *</Label>
                <Select value={formData.interviewType} onValueChange={(value: any) => handleSelectChange('interviewType', value)}>
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

            {formData.interviewType === 'online' && (
              <div className="space-y-2">
                <Label htmlFor="interviewLink">Interview Link *</Label>
                <Input
                  id="interviewLink"
                  name="interviewLink"
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  value={formData.interviewLink}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {formData.interviewType === 'offline' && (
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Office address"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interviewer">Interviewer Name</Label>
                <Input
                  id="interviewer"
                  name="interviewer"
                  placeholder="e.g., John Smith"
                  value={formData.interviewer}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewerEmail">Interviewer Email</Label>
                <Input
                  id="interviewerEmail"
                  name="interviewerEmail"
                  type="email"
                  placeholder="interviewer@company.com"
                  value={formData.interviewerEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description/Instructions</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add any instructions for the students..."
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary"
                disabled={submitting || formData.studentIds.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating Schedules...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Schedule & Send Emails
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Scheduled</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBulkInterviewScheduler;
