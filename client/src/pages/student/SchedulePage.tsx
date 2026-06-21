import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, ExternalLink, Plus, Loader } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AddInterviewScheduleDialog from '@/components/student/AddInterviewScheduleDialog';

interface Interview {
  _id: string;
  companyName: string;
  role: string;
  round: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'online' | 'offline' | 'phone' | 'group';
  interviewLink?: string;
  location?: string;
  status: string;
  scheduledBy: 'manual' | 'automatic';
  description?: string;
}

const SchedulePage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchUpcomingInterviews();
  }, []);

  const fetchUpcomingInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/interviews/upcoming', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="w-3 h-3" />;
      case 'offline':
        return <MapPin className="w-3 h-3" />;
      case 'phone':
        return <Clock className="w-3 h-3" />;
      case 'group':
        return <Video className="w-3 h-3" />;
      default:
        return <Video className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Interview Schedule</h1>
          <p className="text-muted-foreground mt-1">Your upcoming interviews and assessments</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="gradient-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <AddInterviewScheduleDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onScheduleAdded={() => {
          fetchUpcomingInterviews();
          setShowAddDialog(false);
        }}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : interviews.length > 0 ? (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <motion.div
              key={interview._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{interview.companyName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {interview.scheduledBy === 'manual' ? '📝 Manual' : '🤖 Auto'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{interview.role} - {interview.round}</p>
                      {interview.description && (
                        <p className="text-xs text-muted-foreground mt-2">{interview.description}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(interview.interviewDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning" />
                        <span>{interview.interviewTime}</span>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getInterviewIcon(interview.interviewType)}
                        {interview.interviewType.charAt(0).toUpperCase() + interview.interviewType.slice(1)}
                      </Badge>
                    </div>

                    {interview.interviewType === 'online' && interview.interviewLink ? (
                      <Button size="sm" className="gradient-primary text-primary-foreground">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Call
                      </Button>
                    ) : interview.interviewType === 'offline' && interview.location ? (
                      <div className="text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{interview.location}</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-16 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No upcoming interviews</h3>
            <p className="text-muted-foreground mb-4">Your scheduled interviews will appear here once created</p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              Add Your First Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SchedulePage;

