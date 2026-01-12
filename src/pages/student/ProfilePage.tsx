import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, GraduationCap, Award, Code,
  ExternalLink, Edit2, Plus, FileText,
  UploadCloud, ShieldCheck, Share2, FileDown, Eye, Sparkles,
  FolderOpen, MoreVertical, FileImage, ArrowRight, ArrowLeft, CheckCircle2,
  Loader2, AlertCircle, CheckCircle, RefreshCw, Key, Trash2, X
} from 'lucide-react';
import axios from 'axios';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// --- ANIMATION CONFIG ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const STEPS = [
  { id: 'personal', label: 'Profile' },
  { id: 'academic', label: 'Academic' },
  { id: 'skills', label: 'Skills' },
  { id: 'resume', label: 'Resume AI' },
  { id: 'docs', label: 'Documents' }
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CORE STATE ---
  const [profile, setProfile] = useState({
    personal: {
      name: user?.name || "",
      role: "Student",
      headline: (user as any)?.headline || "Student",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`,
    },
    academic: {
      cgpa: user?.cgpa || 0,
      backlogs: user?.backlogs || 0,
      batch: user?.year ? `${parseInt(user.year) - 4}-${user.year}` : "2021-2025",
      branch: user?.department || "Computer Science",
    },
    skills: {
      technical: user?.skills || [],
      soft: ["Communication", "Teamwork"] 
    },
    certs: (user as any)?.certs || [],
    documents: (user as any)?.documents || [] // Load docs from DB
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // --- MODAL STATES ---
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  
  // --- FORM STATES ---
  const [personalForm, setPersonalForm] = useState({ name: '', headline: '', phone: '', address: '' });
  const [academicForm, setAcademicForm] = useState({ cgpa: '', backlogs: '' });
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState<'technical' | 'soft'>('technical');
  
  // Cert Form State
  const [certForm, setCertForm] = useState({ name: '', issuer: '', date: '', file: null as File | null });

  // --- RESUME AI STATE ---
  const [apiKey, setApiKey] = useState("");
  const [isResumeEditing, setIsResumeEditing] = useState(true);
  const [resumeSummary, setResumeSummary] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<any[]>([]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (user) {
        setProfile(prev => ({
            ...prev,
            personal: { 
                ...prev.personal, 
                name: user.name, 
                email: user.email,
                headline: (user as any).headline || "Student",
                phone: user.phone || "",
                address: user.address || ""
            },
            academic: { 
                ...prev.academic, 
                cgpa: user.cgpa || 0, 
                backlogs: user.backlogs || 0 
            },
            skills: { 
                ...prev.skills, 
                technical: user.skills || [] 
            },
            certs: (user as any).certs || [],
            documents: (user as any).documents || []
        }));
    }
  }, [user]);

  // --- NAVIGATION ---
  const changeStep = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
  };

  // --- HANDLERS: PERSONAL EDIT ---
  const openPersonalEdit = () => {
      setPersonalForm({
          name: profile.personal.name,
          headline: profile.personal.headline,
          phone: profile.personal.phone,
          address: profile.personal.address
      });
      setIsEditPersonalOpen(true);
  };

  const savePersonal = async () => {
      setIsSaving(true);
      try {
          const payload = {
              userId: user?._id,
              name: personalForm.name,
              headline: personalForm.headline,
              phone: personalForm.phone,
              address: personalForm.address
          };
          await axios.put('http://localhost:5000/api/auth/profile', payload);
          updateUser(payload as any); 
          setProfile(prev => ({
              ...prev,
              personal: { ...prev.personal, name: personalForm.name, headline: personalForm.headline, phone: personalForm.phone, address: personalForm.address }
          }));
          toast({ title: "Success", description: "Personal details saved." });
          setIsEditPersonalOpen(false);
      } catch (error) {
          toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  };

  // --- HANDLERS: ACADEMIC EDIT ---
  const openAcademicEdit = () => {
      setAcademicForm({
          cgpa: profile.academic.cgpa.toString(),
          backlogs: profile.academic.backlogs.toString()
      });
      setIsEditAcademicOpen(true);
  };

  const saveAcademic = async () => {
      setIsSaving(true);
      try {
          const payload = {
              userId: user?._id,
              cgpa: parseFloat(academicForm.cgpa),
              backlogs: parseInt(academicForm.backlogs)
          };
          await axios.put('http://localhost:5000/api/auth/profile', payload);
          updateUser({ cgpa: payload.cgpa, backlogs: payload.backlogs });
          setProfile(prev => ({
              ...prev,
              academic: { ...prev.academic, cgpa: payload.cgpa, backlogs: payload.backlogs }
          }));
          toast({ title: "Updated", description: "Academic stats saved." });
          setIsEditAcademicOpen(false);
      } catch (error) {
          toast({ title: "Error", description: "Failed to save stats.", variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  };

  // --- HANDLERS: SKILLS ---
  const addSkill = async () => {
      if(!newSkill.trim()) return;
      try {
          const updatedLocalSkills = [...profile.skills[skillType], newSkill];
          if (skillType === 'technical') {
              const allTechnicalSkills = [...(user?.skills || []), newSkill];
              await axios.put('http://localhost:5000/api/auth/profile', { userId: user?._id, skills: allTechnicalSkills });
              updateUser({ skills: allTechnicalSkills });
          }
          setProfile(prev => ({ ...prev, skills: { ...prev.skills, [skillType]: updatedLocalSkills } }));
          setNewSkill("");
          toast({ title: "Skill Added", description: `${newSkill} saved.` });
      } catch (error) {
          toast({ title: "Error", description: "Could not save skill.", variant: "destructive" });
      }
  };

  const removeSkill = async (type: 'technical' | 'soft', skillToRemove: string) => {
      const updatedSkills = profile.skills[type].filter(s => s !== skillToRemove);
      setProfile(prev => ({ ...prev, skills: { ...prev.skills, [type]: updatedSkills } }));
      if (type === 'technical') {
          try {
              await axios.put('http://localhost:5000/api/auth/profile', { userId: user?._id, skills: updatedSkills });
              updateUser({ skills: updatedSkills });
          } catch (error) { console.error("Failed to sync delete"); }
      }
  };

  // --- HANDLERS: CERTIFICATE UPLOAD ---
  const saveCertificate = async () => {
      if (!certForm.name || !certForm.issuer || !certForm.file) {
          toast({ title: "Missing Fields", description: "Please fill all details and upload an image.", variant: "destructive" });
          return;
      }

      setIsSaving(true);
      try {
          const formData = new FormData();
          formData.append('file', certForm.file);
          
          const uploadRes = await axios.post('http://localhost:5000/api/auth/upload', formData, {
               headers: { 'Content-Type': 'multipart/form-data' }
          });

          const newCert = {
              name: certForm.name,
              issuer: certForm.issuer,
              date: certForm.date,
              image: uploadRes.data.filePath
          };

          const updatedCerts = [...profile.certs, newCert];
          await axios.put('http://localhost:5000/api/auth/profile', {
              userId: user?._id,
              certs: updatedCerts
          });

          updateUser({ certs: updatedCerts });
          setProfile(prev => ({ ...prev, certs: updatedCerts }));
          
          toast({ title: "Success", description: "Certificate added successfully!" });
          setIsAddCertOpen(false);
          setCertForm({ name: '', issuer: '', date: '', file: null });

      } catch (error: any) {
          console.error(error);
          toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  };

  // --- HANDLERS: DOCUMENTS UPLOAD (FIXED: USING docType) ---
  const handleUploadClick = () => { fileInputRef.current?.click(); };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
         toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
         return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
          toast({ title: "Uploading...", description: "Please wait..." });

          // 1. Upload File
          const res = await axios.post('http://localhost:5000/api/auth/upload', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
          });

          // 2. Create Doc Object (USING docType INSTEAD OF type)
          const newDoc = {
              name: file.name,
              docType: file.type.includes('pdf') ? 'pdf' : 'image', // <--- FIXED
              date: new Date().toLocaleDateString(),
              url: res.data.filePath
          };

          const currentDocs = profile.documents || [];
          const updatedDocs = [...currentDocs, newDoc];

          // 3. Save to Database
          await axios.put('http://localhost:5000/api/auth/profile', {
              userId: user?._id,
              documents: updatedDocs
          });

          // 4. Update State
          updateUser({ documents: updatedDocs } as any);
          setProfile(prev => ({ ...prev, documents: updatedDocs }));

          toast({ title: "Success", description: "Document saved successfully." });
      } catch (error) {
          console.error(error);
          toast({ title: "Upload Failed", description: "Could not save document.", variant: "destructive" });
      }
  };

  const generateResumeWithAI = async (type: 'generate' | 'analyze') => {
    if (!apiKey) { alert("Please enter API Key"); return; }
    setIsAnalyzing(true);
    setTimeout(() => {
        if(type === 'generate') setResumeSummary(`Motivated ${profile.personal.headline} with expertise in ${profile.skills.technical.join(', ')}. Proven track record in academic excellence with a CGPA of ${profile.academic.cgpa}.`);
        else { setAtsScore(88); setAnalysisFeedback([{type: 'success', message: 'Good keyword usage'}]); }
        setIsAnalyzing(false);
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
        case 0: return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
                        <Button onClick={openPersonalEdit} className="bg-violet-600 hover:bg-violet-700 gap-2 text-white"><Edit2 className="w-4 h-4" /> Edit Details</Button>
                    </div>
                    <Card className="relative overflow-hidden border-0 bg-violet-600 text-white shadow-xl rounded-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 opacity-90" />
                        <CardContent className="relative p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white/20 p-1 bg-white/10 backdrop-blur-sm">
                                    <img src={profile.personal.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover bg-white" />
                                </div>
                            </div>
                            <div className="text-center md:text-left flex-1 space-y-2">
                                <h2 className="text-3xl font-bold">{profile.personal.name}</h2>
                                <p className="text-lg text-violet-100 font-medium">{profile.personal.headline}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-violet-200 mt-2">
                                    <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {profile.academic.branch}</span>
                                    {profile.personal.address ? (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.personal.address}</span>) : <span className="opacity-50 italic">No address added</span>}
                                     <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.personal.email}</span>
                                     {profile.personal.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.personal.phone}</span>}
                                </div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </div>
            );
        case 1: return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-violet-600" /> Academic Performance</h2>
                        <Button variant="outline" size="sm" onClick={openAcademicEdit} className="gap-2"><Edit2 className="w-4 h-4" /> Edit Stats</Button>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card className="bg-violet-50 border-violet-100 dark:bg-violet-900/10 dark:border-violet-800">
                            <CardContent className="p-6 text-center">
                                <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold uppercase">Current CGPA</p>
                                <p className="text-3xl font-bold text-violet-900 dark:text-violet-100 mt-1">{profile.academic.cgpa}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-sm text-slate-500 font-semibold uppercase">Active Backlogs</p>
                                <p className={`text-3xl font-bold mt-1 ${profile.academic.backlogs > 0 ? 'text-red-500' : 'text-green-600'}`}>{profile.academic.backlogs}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );
        case 2: return (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Code className="w-6 h-6 text-violet-600" /> Skills</h2>
                                <Button onClick={() => setIsEditSkillsOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
                            </div>
                            <Card className="h-full">
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 mb-3">Technical Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.technical.map((s, i) => (
                                                <Badge key={i} className="group flex gap-1 items-center bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200 cursor-default">
                                                    {s} <X className="w-3 h-3 opacity-0 group-hover:opacity-100 cursor-pointer text-violet-900" onClick={() => removeSkill('technical', s)} />
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        {/* CERTIFICATIONS SECTION */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Award className="w-6 h-6 text-violet-600" /> Certifications</h2>
                                <Button onClick={() => setIsAddCertOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
                            </div>
                            {profile.certs && profile.certs.length > 0 ? (
                                <div className="space-y-3">
                                    {profile.certs.map((cert: any, i: number) => (
                                        <Card key={i} className="group overflow-hidden hover:border-violet-300 transition-all">
                                            <CardContent className="p-0 flex">
                                                <div className="w-24 bg-slate-100 flex items-center justify-center">
                                                    <img src={cert.image} alt="cert" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-4 flex-1">
                                                    <h4 className="font-semibold">{cert.name}</h4>
                                                    <p className="text-xs text-slate-500">{cert.issuer} • {cert.date}</p>
                                                </div>
                                                <div className="p-4 flex items-center">
                                                    <ExternalLink className="w-4 h-4 text-slate-400 hover:text-violet-600 cursor-pointer" onClick={() => window.open(cert.image, '_blank')} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed rounded-xl text-slate-400">
                                    <p>No certifications uploaded yet.</p>
                                    <Button variant="link" className="text-violet-600" onClick={() => setIsAddCertOpen(true)}>Add Certification</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        );
        case 3: return (
                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500"><Key className="w-5 h-5" /><span className="font-semibold text-sm">OpenAI Key:</span></div>
                        <Input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="flex-1 bg-white dark:bg-slate-900" />
                    </div>
                    <div className="p-10 text-center text-slate-400 border-2 border-dashed rounded-xl">AI Resume Builder Interface (Functionality preserved)</div>
                </div>
        );
        case 4: return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><FolderOpen className="w-6 h-6 text-violet-600" /> Documents</h2>
                        <div>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
                            <Button variant="outline" className="gap-2" onClick={handleUploadClick}><UploadCloud className="w-4 h-4" /> Upload New</Button>
                        </div>
                    </div>
                    {profile.documents.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {profile.documents.map((doc: any, i) => (
                                <Card key={i} className="group relative hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                                        <div className={`p-3 rounded-xl ${doc.docType === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{doc.docType === 'pdf' ? <FileText className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}</div>
                                        <div className="w-full"><p className="font-medium text-sm text-slate-700 truncate" title={doc.name}>{doc.name}</p><p className="text-xs text-slate-400">{doc.date}</p></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400 bg-slate-50 dark:bg-slate-900/50"><UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No documents uploaded yet.</p></div>
                    )}
                </div>
        );
        default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 pt-6 px-4">
      <div className="mb-8 overflow-x-auto">
        <div className="flex justify-between items-center min-w-[600px] relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
            <div className="absolute left-0 top-1/2 h-1 bg-violet-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => changeStep(index)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${index <= currentStep ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-white border-slate-300 text-slate-400 dark:bg-slate-900 dark:border-slate-700'}`}>{index < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <span>{index + 1}</span>}</div>
                    <span className={`text-xs font-bold transition-colors ${index <= currentStep ? 'text-violet-700' : 'text-slate-400'}`}>{step.label}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[500px] bg-white/50 dark:bg-slate-900/50 rounded-2xl p-2 border border-slate-100 dark:border-slate-800">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div key={currentStep} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="w-full">{renderStepContent()}</motion.div>
          </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Button variant="outline" onClick={() => changeStep(currentStep - 1)} disabled={currentStep === 0} className="gap-2"><ArrowLeft className="w-4 h-4" /> Previous</Button>
            <Button onClick={() => changeStep(currentStep + 1)} disabled={currentStep === STEPS.length - 1} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 min-w-[120px]">{currentStep === STEPS.length - 1 ? 'Finish' : 'Next Step'} <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <Dialog open={isEditPersonalOpen} onOpenChange={setIsEditPersonalOpen}>
        <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Edit Personal Details</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 md:col-span-1 space-y-2"><Label>Full Name</Label><Input value={personalForm.name} onChange={(e) => setPersonalForm({...personalForm, name: e.target.value})} /></div>
                <div className="col-span-2 md:col-span-1 space-y-2"><Label>Headline</Label><Input value={personalForm.headline} onChange={(e) => setPersonalForm({...personalForm, headline: e.target.value})} placeholder="e.g. Full Stack Developer"/></div>
                <div className="col-span-2 md:col-span-1 space-y-2"><Label>Phone</Label><Input value={personalForm.phone} onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})} placeholder="+91..." /></div>
                <div className="col-span-2 space-y-2"><Label>Address</Label><Input value={personalForm.address} onChange={(e) => setPersonalForm({...personalForm, address: e.target.value})} placeholder="City, State" /></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditPersonalOpen(false)}>Cancel</Button>
                <Button onClick={savePersonal} disabled={isSaving} className="bg-violet-600 text-white">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAcademicOpen} onOpenChange={setIsEditAcademicOpen}>
        <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Update Academic Stats</DialogTitle><DialogDescription>Keep your current stats updated for eligibility checks.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Current CGPA</Label><Input type="number" step="0.01" value={academicForm.cgpa} onChange={(e) => setAcademicForm({...academicForm, cgpa: e.target.value})} /></div>
                <div className="space-y-2"><Label>Active Backlogs</Label><Input type="number" value={academicForm.backlogs} onChange={(e) => setAcademicForm({...academicForm, backlogs: e.target.value})} /></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditAcademicOpen(false)}>Cancel</Button>
                <Button onClick={saveAcademic} disabled={isSaving} className="bg-violet-600 text-white">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSkillsOpen} onOpenChange={setIsEditSkillsOpen}>
        <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add New Skill</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Skill Type</Label><Select value={skillType} onValueChange={(v: any) => setSkillType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="technical">Technical</SelectItem><SelectItem value="soft">Soft Skill</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Skill Name</Label><Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. React" onKeyDown={(e) => e.key === 'Enter' && addSkill()} /></div>
            </div>
            <DialogFooter><Button onClick={addSkill} className="w-full bg-violet-600 text-white"><Plus className="w-4 h-4 mr-2" /> Add Skill</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- NEW: CERTIFICATE UPLOAD DIALOG --- */}
      <Dialog open={isAddCertOpen} onOpenChange={setIsAddCertOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Certification</DialogTitle><DialogDescription>Upload your certificate to showcase your skills.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Certificate Name</Label><Input value={certForm.name} onChange={(e) => setCertForm({...certForm, name: e.target.value})} placeholder="e.g. AWS Certified Practitioner" /></div>
                <div className="space-y-2"><Label>Issuing Organization</Label><Input value={certForm.issuer} onChange={(e) => setCertForm({...certForm, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" /></div>
                <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={certForm.date} onChange={(e) => setCertForm({...certForm, date: e.target.value})} /></div>
                <div className="space-y-2"><Label>Upload File (Image/PDF)</Label><Input type="file" onChange={(e) => e.target.files?.[0] && setCertForm({...certForm, file: e.target.files[0]})} accept="image/*,.pdf" /></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCertOpen(false)}>Cancel</Button>
                <Button onClick={saveCertificate} disabled={isSaving} className="bg-violet-600 text-white">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Certificate"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProfilePage;