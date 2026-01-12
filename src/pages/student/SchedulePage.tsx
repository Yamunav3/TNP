import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SchedulePage: React.FC = () => {
  const { applications } = useAppSelector((state) => state.applications);
  
  const upcomingInterviews = applications
    .filter(a => a.status === 'interview' || a.status === 'shortlisted')
    .filter(a => a.nextStep)
    .map(a => ({
      id: a.id,
      company: a.companyName,
      logo: a.companyLogo,
      role: a.role,
      round: a.nextStep,
      date: a.nextStep,
      time: '10:00 AM',
      type: 'Virtual',
    }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Interview Schedule</h1>
        <p className="text-muted-foreground mt-1">Your upcoming interviews and assessments</p>
      </div>

      <div className="grid gap-4">
        {upcomingInterviews.map((interview) => (
          <Card key={interview.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center p-2">
                  <img src={interview.logo} alt={interview.company} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{interview.company}</h3>
                  <p className="text-muted-foreground">{interview.role} - {interview.round}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(interview.date!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span>{interview.time}</span>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    {interview.type}
                  </Badge>
                </div>
                <Button className="gradient-primary text-primary-foreground">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {upcomingInterviews.length === 0 && (
          <Card>
            <CardContent className="p-16 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No upcoming interviews</h3>
              <p className="text-muted-foreground">Your scheduled interviews will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default SchedulePage;
