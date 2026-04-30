import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, GraduationCap, Award, Code,
  ExternalLink, Edit2, Plus, FileText,
  UploadCloud, Eye, ArrowRight, ArrowLeft,
  Loader2, CheckCircle, Trash2, X, Github, Linkedin, Briefcase, FileImage, FolderOpen
} from 'lucide-react';
import axios from 'axios';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { id: 'personal', label: 'Overview' },
  { id: 'academic', label: 'Academic' },
  { id: 'skills', label: 'Skills & Certs' },
  { id: 'resume', label: 'Resume' },
  { id: 'docs', label: 'Documents' }
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // --- CORE STATE ---
  const [profile, setProfile] = useState({
    personal: {
      name: user?.name || "",
      headline: (user as any)?.headline || "Student",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      linkedin: (user as any)?.linkedin || "",
      github: (user as any)?.github || "",
      avatar: (user as any)?.image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`,
    },
    academic: {
      cgpa: user?.cgpa || 0,
      backlogs: user?.backlogs || 0,
      branch: user?.department || "Information Technology",
      year: user?.year || "2027"
    },
    skills: { technical: user?.skills || [], soft: ["Communication", "Teamwork"] },
    certs: (user as any)?.certs || [],
    documents: (user as any)?.documents || [],
    resumeUrl: (user as any)?.resumeUrl || ""
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal States
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);

  // Form States
  const [personalForm, setPersonalForm] = useState({ ...profile.personal });
  const [academicForm, setAcademicForm] = useState({ cgpa: profile.academic.cgpa.toString(), backlogs: profile.academic.backlogs.toString() });
  const [newSkill, setNewSkill] = useState("");
  const [certForm, setCertForm] = useState({ name: '', issuer: '', date: '', file: null as File | null });

  // --- HANDLERS ---

  const savePersonal = async () => {
    setIsSaving(true);
    try {
      const payload = { userId: user?._id, ...personalForm };
      await axios.put('http://localhost:5002/api/auth/profile', payload);
      updateUser(payload as any);
      setProfile(prev => ({ ...prev, personal: { ...personalForm } }));
      setIsEditPersonalOpen(false);
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5002/api/auth/upload', formData);
      const resumeUrl = res.data.filePath;
      await axios.put('http://localhost:5002/api/auth/profile', { userId: user?._id, resumeUrl });
      updateUser({ resumeUrl } as any);
      setProfile(prev => ({ ...prev, resumeUrl }));
      toast({ title: "Resume updated!" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // OVERVIEW
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-40 h-40 rounded-2xl overflow-hidden ring-4 ring-violet-500/10 shadow-2xl shrink-0">
                <img src={profile.personal.avatar} className="w-full h-full object-cover" alt="avatar" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{profile.personal.name}</h1>
                  <p className="text-xl text-violet-600 font-medium mt-1">{profile.personal.headline}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-400 text-sm">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.personal.email}</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {profile.personal.phone || "No phone added"}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.personal.address || "No address added"}</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {profile.academic.branch}</div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => setIsEditPersonalOpen(true)} className="bg-violet-600 hover:bg-violet-700 rounded-full px-6">Edit Profile</Button>
                  {profile.personal.linkedin && <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(profile.personal.linkedin)}><Linkedin className="w-4 h-4" /></Button>}
                  {profile.personal.github && <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(profile.personal.github)}><Github className="w-4 h-4" /></Button>}
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // ACADEMIC
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6 text-violet-600" /> Academic Stats</h2>
              <Button variant="outline" onClick={() => setIsEditAcademicOpen(true)}><Edit2 className="w-4 h-4 mr-2" /> Update</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-violet-50 dark:bg-violet-900/10 border-none"><CardContent className="p-6 text-center">
                <p className="text-xs font-bold text-violet-600 uppercase">Current CGPA</p>
                <p className="text-4xl font-black mt-2">{profile.academic.cgpa}</p>
              </CardContent></Card>
              <Card className={profile.academic.backlogs > 0 ? "bg-red-50" : "bg-green-50"}><CardContent className="p-6 text-center border-none">
                <p className="text-xs font-bold text-slate-500 uppercase">Backlogs</p>
                <p className={`text-4xl font-black mt-2 ${profile.academic.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>{profile.academic.backlogs}</p>
              </CardContent></Card>
            </div>
          </div>
        );

      case 2: // SKILLS & CERTS
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Code className="w-5 h-5 text-violet-600" /> Technical Skills</h3>
                  <Button size="sm" onClick={() => setIsEditSkillsOpen(true)}><Plus className="w-4 h-4" /></Button>
                </div>
                <Card><CardContent className="p-6 flex flex-wrap gap-2">
                  {profile.skills.technical.map((skill, i) => (
                    <Badge key={i} className="bg-violet-100 text-violet-700 border-none px-3 py-1">{skill}</Badge>
                  ))}
                </CardContent></Card>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Award className="w-5 h-5 text-violet-600" /> Certifications</h3>
                  <Button size="sm" onClick={() => setIsAddCertOpen(true)}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-3">
                  {profile.certs.map((cert: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 border rounded-xl bg-white dark:bg-slate-800">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden"><img src={cert.image} className="w-full h-full object-cover" /></div>
                      <div className="flex-1"><p className="font-bold text-sm">{cert.name}</p><p className="text-xs text-slate-500">{cert.issuer}</p></div>
                      <Button variant="ghost" size="icon" onClick={() => window.open(cert.image)}><ExternalLink className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // RESUME
        return (
          <div className="max-w-xl mx-auto py-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto"><FileText className="w-10 h-10 text-violet-600" /></div>
            <h3 className="text-2xl font-bold">Placement Resume</h3>
            {profile.resumeUrl ? (
              <div className="p-4 border rounded-2xl bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3"><CheckCircle className="text-green-500" /> <span className="text-sm font-medium">Resume_Uploaded.pdf</span></div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => window.open(profile.resumeUrl)}><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setProfile(p => ({...p, resumeUrl: ""}))}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ) : (
              <Button className="bg-violet-600 px-10 rounded-full" onClick={() => resumeInputRef.current?.click()} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />} Upload PDF
              </Button>
            )}
            <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf" onChange={handleResumeUpload} />
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 pt-10 px-4">
      {/* STEPPER */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute h-0.5 bg-slate-200 dark:bg-slate-800 w-full left-0 top-1/2 -z-10" />
        {STEPS.map((step, idx) => (
          <button key={step.id} onClick={() => setCurrentStep(idx)} className={`flex flex-col items-center gap-2 transition-all ${idx === currentStep ? 'scale-110 opacity-100' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${idx <= currentStep ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-white border-slate-300'}`}>
              {idx < currentStep ? <CheckCircle className="w-6 h-6" /> : <span className="text-sm font-bold">{idx + 1}</span>}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{step.label}</span>
          </button>
        ))}
      </div>

      <Card className="border-none shadow-2xl shadow-violet-500/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[500px]">
        <CardContent className="p-8 md:p-12">{renderStepContent()}</CardContent>
      </Card>

      {/* STICKY NAV */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-2 rounded-full border shadow-2xl z-50">
        <Button variant="ghost" className="rounded-full" disabled={currentStep === 0} onClick={() => setCurrentStep(s => s - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <div className="w-px bg-slate-200" />
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8" disabled={currentStep === STEPS.length - 1} onClick={() => setCurrentStep(s => s + 1)}>
          Next Step <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* PERSONAL EDIT MODAL */}
      <Dialog open={isEditPersonalOpen} onOpenChange={setIsEditPersonalOpen}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader><DialogTitle className="text-2xl font-bold">Edit Details</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 md:col-span-1 space-y-2"><Label>Full Name</Label><Input value={personalForm.name} onChange={e => setPersonalForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="col-span-2 md:col-span-1 space-y-2"><Label>Headline</Label><Input value={personalForm.headline} onChange={e => setPersonalForm(f => ({...f, headline: e.target.value}))} /></div>
            <div className="col-span-1 space-y-2"><Label>LinkedIn</Label><Input value={personalForm.linkedin} onChange={e => setPersonalForm(f => ({...f, linkedin: e.target.value}))} /></div>
            <div className="col-span-1 space-y-2"><Label>GitHub</Label><Input value={personalForm.github} onChange={e => setPersonalForm(f => ({...f, github: e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={savePersonal} disabled={isSaving} className="bg-violet-600">{isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;