
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, GraduationCap, Award, Code,
  ExternalLink, Edit2, Plus, ArrowRight, ArrowLeft,
  Loader2, CheckCircle, Github, Linkedin, Briefcase, X,
  Calendar, Star, User, Target
} from 'lucide-react';
import axios from 'axios';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchProfile } from '@/store/slices/profileSlice';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    personal: {
      name: user?.name || "",
      headline: (user as any)?.headline || "Placement Ready Student",
      email: user?.email || "",
      phone: user?.phone || "",
      address: (user as any)?.address || "",
      linkedin: (user as any)?.linkedin || "",
      github: (user as any)?.github || "",
      avatar: (user as any)?.image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10B981&color=fff&size=256`,
    },
    academic: {
      cgpa: user?.cgpa || 0,
      backlogs: user?.backlogs || 0,
      branch: user?.department || "Information Technology",
      year: user?.year || "2027"
    },
    skills: { technical: user?.skills || [] },
    certs: (user as any)?.certs || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [personalForm, setPersonalForm] = useState({ ...profile.personal });
  const [academicForm, setAcademicForm] = useState({ cgpa: profile.academic.cgpa.toString(), backlogs: profile.academic.backlogs.toString() });
  const [skillInput, setSkillInput] = useState("");

  const completionPercentage = () => {
    let count = 0;
    if (user?.name) count++;
    if (user?.email) count++;
    if (user?.cgpa) count++;
    if (user?.department) count++;
    if (user?.year) count++;
    if (user?.phone) count++;
    if (profile.skills.technical.length > 0) count++;
    return Math.round((count / 7) * 100);
  };

  const handleUpdate = async (updatedData: any) => {
    setIsSaving(true);
    try {
    const payload = { userId: user?._id, ...updatedData };
      const res = await axios.put(`${API_URL}/api/auth/profile`, payload);
      const updatedUser = res.data?.user ?? res.data;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      await dispatch(fetchProfile());
      toast({ title: "Success", description: "Profile updated successfully!" });
      return true;
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const savePersonal = async () => {
    const success = await handleUpdate(personalForm);
    if (success) {
      setProfile(prev => ({ ...prev, personal: personalForm }));
      setIsEditPersonalOpen(false);
    }
  };

  const saveAcademic = async () => {
    const data = {
      cgpa: parseFloat(academicForm.cgpa),
      backlogs: parseInt(academicForm.backlogs)
    };
    const success = await handleUpdate(data);
    if (success) {
      setProfile(prev => ({ ...prev, academic: { ...prev.academic, ...data } }));
      setIsEditAcademicOpen(false);
    }
  };

  const addSkill = async () => {
    if (!skillInput.trim()) return;
    const newSkills = [...profile.skills.technical, skillInput.trim()];
    const success = await handleUpdate({ skills: newSkills });
    if (success) {
      setProfile(prev => ({ ...prev, skills: { technical: newSkills } }));
      setSkillInput("");
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    const newSkills = profile.skills.technical.filter(s => s !== skillToRemove);
    const success = await handleUpdate({ skills: newSkills });
    if (success) {
      setProfile(prev => ({ ...prev, skills: { technical: newSkills } }));
    }
  };

  return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Completion Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
        >
            <div className="bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-white/30 rounded-full blur-xl" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden">
                  <img src={profile.personal.avatar} className="w-full h-full object-cover" alt="avatar" />
                </div>
              </motion.div>
              
              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{profile.personal.name}</h1>
                <p className="text-xl md:text-2xl text-white/80 mb-4">{profile.personal.headline}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {profile.personal.linkedin && (
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none" onClick={() => window.open(profile.personal.linkedin)}>
                      <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                    </Button>
                  )}
                  {profile.personal.github && (
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none" onClick={() => window.open(profile.personal.github)}>
                      <Github className="w-4 h-4 mr-2" /> GitHub
                    </Button>
                  )}
                  <Button size="sm" className="bg-white text-primary hover:bg-white/90" onClick={() => { setPersonalForm({...profile.personal}); setIsEditPersonalOpen(true); }}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[200px]">
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-2">Profile Completion</p>
                  <p className="text-4xl font-bold text-white mb-3">{completionPercentage()}%</p>
                  <Progress value={completionPercentage()} className="h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-lg gap-1">
              <TabsTrigger value="overview" className="rounded-xl py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
              <TabsTrigger value="academic" className="rounded-xl py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white">
              <GraduationCap className="w-4 h-4 mr-2" /> Academic
            </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-xl py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-2" /> Skills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
              <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-5 sm:p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{profile.personal.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{profile.personal.phone || "Not added"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="p-2 bg-accent/15 rounded-lg">
                          <MapPin className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{profile.personal.address || "Not added"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-5 sm:p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-primary" /> Academic Summary
                    </h3>
                    <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 dark:from-slate-900 dark:to-slate-800 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">Current CGPA</span>
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.round(profile.academic.cgpa / 2) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                <p className="text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{profile.academic.cgpa}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                          <p className="text-sm text-muted-foreground">Branch</p>
                          <p className="font-bold">{profile.academic.branch}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-bold">{profile.academic.year}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="academic">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
                <Card className="border-none shadow-xl">
      <CardContent className="p-5 sm:p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" /> Academic Performance
                    </h3>
                    <Button variant="outline" onClick={() => { setAcademicForm({ cgpa: profile.academic.cgpa.toString(), backlogs: profile.academic.backlogs.toString() }); setIsEditAcademicOpen(true); }}>
                      <Edit2 className="w-4 h-4 mr-2" /> Update
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Current CGPA</p>
                            <p className="text-5xl font-black text-emerald-700 dark:text-emerald-300 mt-2">{profile.academic.cgpa}</p>
                          </div>
                          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <Award className="w-10 h-10 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`p-6 bg-gradient-to-br rounded-2xl border ${profile.academic.backlogs > 0 ? 'from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-900' : 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-900'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium uppercase tracking-wide ${profile.academic.backlogs > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Active Backlogs</p>
                            <p className={`text-5xl font-black mt-2 ${profile.academic.backlogs > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{profile.academic.backlogs}</p>
                          </div>
                          <div className={`p-4 rounded-full ${profile.academic.backlogs > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                            {profile.academic.backlogs > 0 ? <X className="w-10 h-10 text-red-600" /> : <CheckCircle className="w-10 h-10 text-green-600" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="skills">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Code className="w-8 h-8 text-purple-600" /> Technical Skills
                    </h3>
      <Button size="sm" onClick={() => setIsEditSkillsOpen(true)} className="bg-gradient-to-r from-primary to-primary-dark">
                      <Plus className="w-4 h-4 mr-2" /> Add Skill
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.technical.length > 0 ? (
                      profile.skills.technical.map((skill, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
   <Badge className="bg-primary/5 text-primary border border-primary/10 px-4 py-2 text-sm font-medium hover:scale-105 transition-transform cursor-pointer">
  {skill}

                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <div className="w-full text-center py-12 text-muted-foreground">
                        <Code className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No skills added yet. Start adding your skills!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

        </Tabs>

        {/* Modals */}
        <Dialog open={isEditPersonalOpen} onOpenChange={setIsEditPersonalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle className="text-xl">Edit Personal Details</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={personalForm.name} onChange={e => setPersonalForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="space-y-2"><Label>Headline</Label><Input value={personalForm.headline} onChange={e => setPersonalForm(f => ({...f, headline: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-2"><Label>LinkedIn</Label><Input value={personalForm.linkedin} onChange={e => setPersonalForm(f => ({...f, linkedin: e.target.value}))} /></div>
                 <div className="space-y-2"><Label>GitHub</Label><Input value={personalForm.github} onChange={e => setPersonalForm(f => ({...f, github: e.target.value}))} /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input value={personalForm.address} onChange={e => setPersonalForm(f => ({...f, address: e.target.value}))} /></div>
            </div>
  <DialogFooter><Button onClick={savePersonal} disabled={isSaving} className="bg-gradient-to-r from-primary to-primary-dark w-full">{isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditAcademicOpen} onOpenChange={setIsEditAcademicOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle className="text-xl">Update Academic Data</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2"><Label>Current CGPA</Label><Input type="number" step="0.01" value={academicForm.cgpa} onChange={e => setAcademicForm(f => ({...f, cgpa: e.target.value}))} /></div>
              <div className="space-y-2"><Label>Active Backlogs</Label><Input type="number" value={academicForm.backlogs} onChange={e => setAcademicForm(f => ({...f, backlogs: e.target.value}))} /></div>
            </div>
  <DialogFooter><Button onClick={saveAcademic} disabled={isSaving} className="bg-gradient-to-r from-primary to-primary-dark w-full">Save Changes</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditSkillsOpen} onOpenChange={setIsEditSkillsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle className="text-xl">Manage Skills</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input placeholder="Add a skill (e.g. React)" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
  <Button onClick={addSkill} className="bg-gradient-to-r from-primary to-primary-dark"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.technical.map(skill => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 gap-2">
                    {skill} <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ProfilePage;
