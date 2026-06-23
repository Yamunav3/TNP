
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Briefcase,
    Linkedin,
    Github,
    Search,
    Plus,
    Send,
    CheckCircle,
    Calendar,
    MessageSquare,
    Star,
    X,
    ExternalLink,
    Filter,
    GraduationCap,
    Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Alumni {
    _id: string;
    name: string;
    company: string;
    role: string;
    graduationYear: number;
    branch: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    skills: string[];
    isAvailable: boolean;
    mentorshipTopics: string[];
    maxMentees: number;
    currentMentees: string[];
    rating: number;
}

interface MentorshipRequest {
    _id: string;
    student: any;
    alumni: any;
    requestType: 'Resume Review' | 'Career Advice' | 'Mock Interview' | 'Other';
    message: string;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
    meetingDate?: string;
    meetingLink?: string;
    feedback?: string;
    createdAt: string;
}

const AlumniCorner: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [alumni, setAlumni] = useState<Alumni[]>([]);
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [requestData, setRequestData] = useState<Partial<MentorshipRequest>>({
        requestType: 'Career Advice',
        message: ''
    });

    // Fetch alumni
  const fetchAlumni = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCompany && selectedCompany !== 'all') params.append('company', selectedCompany);
      if (selectedBranch && selectedBranch !== 'all') params.append('branch', selectedBranch);

      const res = await fetch(`http://localhost:5002/api/alumni?${params.toString()}`);
      const data = await res.json();
      setAlumni(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    // Fetch requests
    const fetchRequests = async () => {
        try {
            const res = await fetch(`http://localhost:5002/api/alumni/mentorship/requests?type=sent`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAlumni();
        fetchRequests();
    }, [search, selectedCompany, selectedBranch]);

    const sendRequest = async () => {
        if (!selectedAlumni || !requestData.message) {
            toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
            return;
        }
        try {
            const res = await fetch('http://localhost:5002/api/alumni/mentorship/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    alumni: selectedAlumni._id,
                    ...requestData
                })
            });
            await res.json();
            toast({ title: 'Success', description: 'Request sent successfully!' });
            setIsRequestDialogOpen(false);
            fetchRequests();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        }
    };

    const companies = Array.from(new Set(alumni.map(a => a.company)));
    const branches = Array.from(new Set(alumni.map(a => a.branch)));

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Alumni Corner</h1>
                    <p className="text-muted-foreground">Connect with alumni and get mentorship</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search alumni..."
                            className="pl-10 w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="w-[200px]">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <SelectValue placeholder="Filter by Company" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {companies.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                </Select>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-[200px]">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <SelectValue placeholder="Filter by Branch" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                </Select>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Alumni List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" /> Alumni Network
                    </h2>
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-16 h-16 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-6 w-1/3" />
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : alumni.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Users className="w-16 h-16 opacity-20 mb-4" />
                            <p>No alumni found</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {alumni.map((alumni) => (
                                <motion.div
                                    key={alumni._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="hover:border-primary transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="w-16 h-16 border border-primary/20">
                                                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold">
                                                        {alumni.name.charAt(0)}
                                                    </div>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{alumni.name}</h3>
                                                        <p className="text-muted-foreground flex items-center gap-1">
                                                            <Briefcase className="w-4 h-4" /> {alumni.role} at {alumni.company}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary">{alumni.branch}</Badge>
                                                        <Badge variant="outline">{alumni.graduationYear}</Badge>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {Array(5).fill(0).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < Math.floor(alumni.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {alumni.isAvailable && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-gradient-to-r from-primary to-primary-dark"
                                                                onClick={() => {
                                                                    setSelectedAlumni(alumni);
                                                                    setIsRequestDialogOpen(true);
                                                                }}
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-1" /> Request Mentorship
                                                            </Button>
                                                            {alumni.linkedin && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(alumni.linkedin, '_blank')}
                                                                >
                                                                    <Linkedin className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Requests */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> My Requests
                    </h2>
                    <div className="space-y-3">
                        {requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center">
                                <MessageSquare className="w-12 h-12 opacity-20 mb-3" />
                                <p>No requests yet</p>
                            </div>
                        ) : (
                            requests.map(request => (
                                <Card key={request._id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge
                                                className={`${
                                                    request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    request.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-primary/10 text-primary'
                                                }`}
                                            >
                                                {request.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{request.requestType}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{request.message}</p>
                                        {request.meetingDate && (
                                            <div className="mt-2 text-xs flex items-center gap-1 text-green-600">
                                                <Calendar className="w-3 h-3" /> {new Date(request.meetingDate).toLocaleString()}
                                            </div>
                                        )}
                                        {request.meetingLink && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 text-xs"
                                                onClick={() => window.open(request.meetingLink, '_blank')}
                                            >
                                                Join Meeting
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Request Dialog */}
            <AnimatePresence>
                {isRequestDialogOpen && selectedAlumni && (
                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Request Mentorship from {selectedAlumni.name}</DialogTitle>
                                <DialogDescription>
                                    Explain what type of mentorship you need
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Request Type</Label>
                                    <Select
                                        value={requestData.requestType}
                                        onValueChange={(v: any) => setRequestData({ ...requestData, requestType: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Resume Review">Resume Review</SelectItem>
                                            <SelectItem value="Career Advice">Career Advice</SelectItem>
                                            <SelectItem value="Mock Interview">Mock Interview</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea
                                        value={requestData.message}
                                        onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                                        placeholder="Write your message..."
                                        className="min-h-[120px]"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={sendRequest}
                                    className="bg-gradient-to-r from-primary to-primary-dark"
                                >
                                    <Send className="w-4 h-4 mr-2" /> Send Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlumniCorner;
