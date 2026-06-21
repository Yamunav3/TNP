import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Upload, Send, Brain, Building2, Code,
  Loader2, Mic, MicOff, Sparkles, Target, Trophy, BookOpen,
  ArrowLeft, ArrowRight, Volume2, VolumeX, CheckCircle, XCircle, FileText, Download, Clock,
  Plus, TrendingUp, Users, Star, Share2, MessageCircle, X, Check, Search
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/contexts/AuthContext';
import { getAIResponse, getDynamicQuizQuestion, QuizQuestion } from '@/services/aiService';

// --- TYPES ---
type Message = { role: "user" | "assistant"; content: string; };

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Data Scientist", "DevOps Engineer"
];

const QUIZ_CATEGORIES = [
  { id: "dsa", name: "Data Structures", icon: Code, color: "text-primary", bg: "bg-primary/10" },
  { id: "aptitude", name: "Aptitude", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  { id: "mern", name: "MERN Stack", icon: Sparkles, color: "text-accent", bg: "bg-accent/15" },
  { id: "os", name: "Operating Systems", icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { id: "dbms", name: "DBMS", icon: BookOpen, color: "text-accent", bg: "bg-accent/15" },
];

const EXTENDED_QUIZ_CATEGORIES = [
  { id: "dsa", name: "Data Structures", icon: Code, color: "text-primary", bg: "bg-primary/10" },
  { id: "aptitude-core", name: "Aptitude Concepts", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  { id: "aptitude", name: "Aptitude Reasoning", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  { id: "python", name: "Python Programming", icon: Code, color: "text-primary", bg: "bg-primary/10" },
  { id: "java", name: "Java Programming", icon: Code, color: "text-primary", bg: "bg-primary/10" },
  { id: "javascript", name: "JavaScript Programming", icon: Code, color: "text-primary", bg: "bg-primary/10" },
  { id: "cpp", name: "C++ Programming", icon: Code, color: "text-primary", bg: "bg-primary/10" },
  { id: "dbms", name: "DBMS & SQL", icon: BookOpen, color: "text-accent", bg: "bg-accent/15" },
  { id: "ml", name: "Machine Learning", icon: Sparkles, color: "text-accent", bg: "bg-accent/15" },
  { id: "mern", name: "MERN Stack", icon: Sparkles, color: "text-accent", bg: "bg-accent/15" },
  { id: "os", name: "Operating Systems", icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { id: "system-design", name: "System Design", icon: Building2, color: "text-primary", bg: "bg-primary/10" },
];

const QUIZ_DIFFICULTIES: Array<'Beginner' | 'Medium' | 'Hard'> = ['Beginner', 'Medium', 'Hard'];

const InterviewPrepPage: React.FC = () => {
  const { toast } = useToast();
  const profile = useAppSelector((state) => state.profile)?.profile ?? null;
  const auth = useAuth();
  const userName = profile?.personalInfo?.firstName || auth.user?.name?.split(" ")[0] || "Candidate";

  const [isLoading, setIsLoading] = useState(false);

  // --- INTERVIEW STATE ---
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const interviewEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [jobDescription, setJobDescription] = useState("");

  // --- QUIZ STATE ---
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState(0);
  const [quizDifficulty, setQuizDifficulty] = useState<'Beginner' | 'Medium' | 'Hard'>('Beginner');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // --- EXPERIENCE STATE ---
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [experienceLoading, setExperienceLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExperience, setNewExperience] = useState<any>({
    company: '',
    role: '',
    interviewRounds: [{ roundName: '', questions: [''], difficulty: 'Medium' }],
    overallExperience: '',
    selected: false,
    tips: '',
    difficultyRating: 3,
    isAnonymous: false
  });

  // --- FETCH EXPERIENCES (memoized) ---
  const fetchExperiences = useCallback(async () => {
    setExperienceLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`http://localhost:5000/api/interview-experiences?${params.toString()}`);
      const data = await res.json();
      setExperiences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setExperienceLoading(false);
    }
  }, [searchTerm]);

  // --- SUBMIT EXPERIENCE ---
  const submitExperience = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/interview-experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newExperience),
      });
      await res.json();
      toast({ title: 'Success', description: 'Experience submitted for review!' });
      setIsExperienceModalOpen(false);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }
  };

  // --- UPVOTE EXPERIENCE ---
  const toggleUpvote = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/interview-experiences/${id}/upvote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchExperiences();
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch experiences when search term changes
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  // --- VOICE & INTERVIEW LOGIC ---
  const speak = (text: string) => {
    if (isMuted || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionApi) return;

    recognitionRef.current = new SpeechRecognitionApi();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript) setInputMessage(transcript);
    };

    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: "Voice input unavailable", description: "Your browser does not support speech recognition." });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    window.speechSynthesis.cancel();
    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleInterviewResponse = async (newHistory: Message[]) => {
    setIsLoading(true);
    try {
      const aiResponse = await getAIResponse({
        messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        candidateName: userName,
        candidateSkills: [selectedRole],
        jobDescription: jobDescription,
        resumeUrl: resumeUrl || undefined,
        interviewerPersona: { name: "AI", role: "Senior " + selectedRole, focus: "Technical" }
      });
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      speak(aiResponse);
    } catch (error) { 
      toast({ title: "AI Error", variant: "destructive" }); 
    }
    finally { setIsLoading(false); }
  };

  const startInterview = async () => {
    const startMsg = `I am ready for my ${selectedRole} interview.${resumeFileName ? " I have uploaded my resume." : ""}`;
    const initialHistory: Message[] = [{ role: "user", content: startMsg }];
    setMessages(initialHistory);
    await handleInterviewResponse(initialHistory);
  };

  const sendInterviewMessage = async () => {
    if (!inputMessage.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const newMessage: Message = { role: "user", content: inputMessage.trim() };
    const nextHistory = [...messages, newMessage];
    setMessages(nextHistory);
    setInputMessage("");
    await handleInterviewResponse(nextHistory);
  };

  const endInterview = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setMessages([]);
    setInputMessage("");
    setResumeFileName(null);
    setResumeUrl(null);
    toast({ title: "Session Ended", description: "Interview reset." });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({ title: "Invalid File", description: "Only PDF files are allowed", variant: "destructive" });
      return;
    }

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('http://localhost:5000/api/ai/upload-resume', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload resume');
      }

      const data = await response.json();
      setResumeFileName(file.name);
      setResumeUrl(data.resumeUrl);
      toast({ title: "Resume Uploaded", description: `${file.name} uploaded successfully!` });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive"
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  // --- QUIZ LOGIC ---
  const loadNewQuestion = async (category: string, difficultyOverride?: 'Beginner' | 'Medium' | 'Hard') => {
    setIsLoading(true);
    setSelectedOption(null);
    setShowExplanation(false);

    const activeDifficulty = difficultyOverride || quizDifficulty;
    try {
      const question = await getDynamicQuizQuestion({
        topic: category,
        difficulty: activeDifficulty,
        userId: auth.user?._id,
      });

      setCurrentQuestion(question);
      setQuizQuestionCount(prev => prev + 1);
      if ((question as any).isHighFrequency) {
        toast({ title: "🔥 Frequently Asked", description: `Popular ${activeDifficulty} interview question.` });
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || "Failed to load question.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    finally { setIsLoading(false); }
  };

  const startQuiz = (categoryId: string) => {
    setSelectedQuizCategory(categoryId);
    setQuizScore(0);
    setQuizQuestionCount(0);
    setQuizDifficulty('Beginner');
    loadNewQuestion(categoryId, 'Beginner');
  };

  const handleQuizAnswer = async (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    const isCorrect = index === currentQuestion?.correctIndex;
    if (isCorrect) setQuizScore(prev => prev + 1);

    toast({
      title: isCorrect ? "Correct" : "Incorrect",
      description: isCorrect ? "Good answer." : "Review the explanation and try the next one.",
      variant: isCorrect ? undefined : "destructive"
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Interview Prep</h1>
          <p className="text-muted-foreground">Master your skills with real-time simulations and quizzes.</p>
        </div>
        <Button variant="outline" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />} {isMuted ? "Muted" : "Voice On"}
        </Button>
      </motion.div>

      <Tabs defaultValue="interview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-muted/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-inner h-auto">
          <TabsTrigger
            value="interview"
            className="rounded-xl flex items-center justify-center gap-2 px-2 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            Interview
          </TabsTrigger>

          <TabsTrigger
            value="quiz"
            className="rounded-xl flex items-center justify-center gap-2 px-2 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
          >
            <Brain className="w-4 h-4" />
            Quiz
          </TabsTrigger>

          <TabsTrigger
            value="experiences"
            className="rounded-xl flex items-center justify-center gap-2 px-2 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            Experiences
          </TabsTrigger>
        </TabsList>

        {/* FIX: Added data-[state=inactive]:hidden to each TabsContent */}
        <TabsContent value="interview" className="data-[state=inactive]:hidden">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Setup</CardTitle>
                <CardDescription>Configure your interview session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Description (Optional)</label>
                  <Textarea
                    placeholder="Paste the job requirements here to generate tailored questions..."
                    className="min-h-[120px] bg-muted/30 resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Paste keywords like: React, AWS, Team management...</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resume</label>
                  <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 transition-all ${isUploadingResume ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-muted/50'}`}>
                    {isUploadingResume ? (
                      <>
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        <span className="text-xs text-muted-foreground text-center">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground text-center">{resumeFileName ? `✓ ${resumeFileName}` : "Upload PDF"}</span>
                      </>
                    )}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={isUploadingResume} />
                  </label>
                </div>
                <Button onClick={startInterview} disabled={isLoading} className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark" size="lg">
                  <Mic className="h-4 w-4" /> Start Interview
                </Button>
                {messages.length > 0 && <Button variant="destructive" onClick={endInterview} className="w-full">End Session</Button>}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-lg border-muted h-[600px] flex flex-col">
              <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Live Session</CardTitle>
                {isMuted && <Badge variant="secondary" className="text-xs">Voice Off</Badge>}
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="flex h-full flex-col items-center justify-center gap-4 text-center opacity-50 mt-20">
                        <Brain className="h-16 w-16" />
                        <p className="text-lg">Ready? Click Start Interview to begin.</p>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-line ${msg.role === "user" ? "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground" : "bg-muted border"}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</div></div>}
                    {isListening && <div className="flex justify-end"><div className="bg-red-50 text-red-500 border border-red-200 rounded-2xl px-4 py-2 flex items-center gap-2 animate-pulse"><Mic className="w-4 h-4" /> Listening...</div></div>}
                    <div ref={interviewEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); void sendInterviewMessage(); }} className="flex gap-2">
                    <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListening} className="rounded-full shrink-0">
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder={isListening ? "Listening..." : "Type your answer..."} disabled={isLoading} className="rounded-full" />
                    <Button type="submit" size="icon" disabled={isLoading || !inputMessage.trim()} className="rounded-full bg-gradient-to-r from-primary to-primary-dark"><Send className="w-4 h-4" /></Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            {!selectedQuizCategory ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {EXTENDED_QUIZ_CATEGORIES.map((cat) => (
                  <Card key={cat.id} onClick={() => startQuiz(cat.id)} className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group border-2 border-transparent">
                    <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                      <div className={`rounded-full p-4 ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}><cat.icon className="h-8 w-8" /></div>
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground">Start Practice</Badge>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <Card className="max-w-3xl mx-auto shadow-2xl rounded-3xl overflow-hidden border-none">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> {EXTENDED_QUIZ_CATEGORIES.find(c => c.id === selectedQuizCategory)?.name || selectedQuizCategory} Quiz</CardTitle>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Score: {quizScore} / {quizQuestionCount}</p>
                  </div>
                  <Button variant="ghost" className="rounded-full" onClick={() => setSelectedQuizCategory(null)}>Exit</Button>
                </CardHeader>

                <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b bg-white/60 dark:bg-slate-900/40">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</span>
                  {QUIZ_DIFFICULTIES.map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={quizDifficulty === level ? 'default' : 'outline'}
                      className="rounded-full"
                      onClick={() => {
                        setQuizDifficulty(level);
                        if (selectedQuizCategory) {
                          void loadNewQuestion(selectedQuizCategory, level);
                        }
                      }}
                      disabled={isLoading}
                    >
                      {level}
                    </Button>
                  ))}
                </div>

                <CardContent className="p-8 min-h-[450px] flex flex-col justify-center">
                  {isLoading ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                      <p className="text-slate-500 animate-pulse">Fetching interview-grade question...</p>
                    </div>
                  ) : currentQuestion ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95">
                      <div className="space-y-3">
                        {currentQuestion.difficulty && (
                          <Badge variant="secondary" className="w-fit uppercase">
                            {currentQuestion.difficulty}
                          </Badge>
                        )}
                        {(currentQuestion as any).isHighFrequency && <Badge className="bg-orange-500 text-white animate-pulse">🔥 Top Interview Question</Badge>}
                        <h2 className="text-2xl font-bold leading-tight">{currentQuestion.question}</h2>
                      </div>

                      <div className="grid gap-3">
                        {currentQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === currentQuestion.correctIndex;
                          const isSelected = selectedOption === idx;
                          let style = "p-5 text-left border-2 rounded-2xl text-base font-medium transition-all flex items-center justify-between ";
                          if (showExplanation) {
                          if (isCorrect) style += "bg-green-50 border-green-500 text-green-700 shadow-sm";
                            else if (isSelected) style += "bg-red-50 border-red-500 text-red-700";
                            else style += "opacity-40 border-slate-100";
                          } else { style += "border-slate-100 hover:border-primary hover:bg-primary/5"; }

                          return (
                            <button key={idx} disabled={showExplanation} onClick={() => handleQuizAnswer(idx)} className={style}>
                              <span className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + idx)}</span>
                                {opt}
                              </span>
                              {showExplanation && isCorrect && <CheckCircle className="w-5 h-5" />}
                            </button>
                          );
                        })}
                      </div>

                      {showExplanation && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-primary/5 text-foreground rounded-2xl border border-primary/10">
                          <p className="font-bold mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Explanation:</p>
                          <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                          <Button onClick={() => loadNewQuestion(selectedQuizCategory!)} className="mt-6 w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold">
                            Next Question <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Experiences Tab */}
        <TabsContent value="experiences" className="data-[state=inactive]:hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search interview experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsExperienceModalOpen(true)} className="bg-gradient-to-r from-primary to-primary-dark">
              <Plus className="w-4 h-4 mr-2" /> Share Experience
            </Button>
          </div>

          {experienceLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/3 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp, i) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:border-primary transition-all h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{exp.company}</CardTitle>
                          <CardDescription>{exp.role}</CardDescription>
                        </div>
                        <Badge className={`${exp.selected ? 'bg-green-100 text-green-800' : 'bg-accent/15 text-accent-foreground'}`}>
                          {exp.selected ? 'Selected' : 'Not Selected'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-1">
                        {Array(5).fill(0).map((_, j) => (
                          <Star key={j} className={`w-4 h-4 ${j < exp.difficultyRating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {exp.overallExperience}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" size="sm" onClick={() => toggleUpvote(exp._id)} className="text-primary">
                          <TrendingUp className="w-4 h-4 mr-1" /> {exp.upvotes?.length || 0}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* --- ADD EXPERIENCE MODAL --- */}
      <AnimatePresence>
        {isExperienceModalOpen && (
          <Dialog open={isExperienceModalOpen} onOpenChange={setIsExperienceModalOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share Your Interview Experience</DialogTitle>
                <DialogDescription>Help other students by sharing your interview experience.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={newExperience.role} onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-3 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label>Interview Rounds</Label>
                    <Button variant="ghost" size="sm" onClick={() => setNewExperience({
                      ...newExperience,
                      interviewRounds: [...newExperience.interviewRounds, { roundName: '', questions: [''], difficulty: 'Medium' }]
                    })}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newExperience.interviewRounds.map((round, i) => (
                    <div key={i} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Round {i + 1}</Label>
                        {i > 0 && <Button variant="ghost" size="sm" className="h-6 text-red-500" onClick={() => setNewExperience({
                          ...newExperience,
                          interviewRounds: newExperience.interviewRounds.filter((_, idx) => idx !== i)
                        })}>
                          <X className="w-4 h-4" />
                        </Button>}
                      </div>
                      <Input placeholder="Round Name" value={round.roundName} onChange={(e) => {
                        const updated = [...newExperience.interviewRounds];
                        updated[i].roundName = e.target.value;
                        setNewExperience({ ...newExperience, interviewRounds: updated });
                      }} />
                      <div className="space-y-2">
                        <Label className="text-xs">Questions</Label>
                        {round.questions.map((q, j) => (
                          <div key={j} className="flex gap-2">
                            <Input placeholder="Question" value={q} onChange={(e) => {
                              const updated = [...newExperience.interviewRounds];
                              updated[i].questions[j] = e.target.value;
                              setNewExperience({ ...newExperience, interviewRounds: updated });
                            }} />
                            {j > 0 && <Button variant="ghost" size="sm" className="h-10" onClick={() => {
                              const updated = [...newExperience.interviewRounds];
                              updated[i].questions.splice(j, 1);
                              setNewExperience({ ...newExperience, interviewRounds: updated });
                            }}>
                              <X className="w-4 h-4" />
                            </Button>}
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => {
                          const updated = [...newExperience.interviewRounds];
                          updated[i].questions.push('');
                          setNewExperience({ ...newExperience, interviewRounds: updated });
                        }}>
                          <Plus className="w-3 h-3 mr-1" /> Add Question
                        </Button>
                      </div>
                      <Select value={round.difficulty} onValueChange={(val) => {
                        const updated = [...newExperience.interviewRounds];
                        updated[i].difficulty = val;
                        setNewExperience({ ...newExperience, interviewRounds: updated });
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Overall Experience</Label>
                  <Textarea
                    value={newExperience.overallExperience}
                    onChange={(e) => setNewExperience({ ...newExperience, overallExperience: e.target.value })}
                    className="min-h-[120px]"
                    placeholder="Describe your interview experience..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tips for Others</Label>
                  <Textarea
                    value={newExperience.tips}
                    onChange={(e) => setNewExperience({ ...newExperience, tips: e.target.value })}
                    placeholder="Share some tips for students preparing for similar interviews..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Overall Difficulty</Label>
                    <div className="flex gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewExperience({ ...newExperience, difficultyRating: i + 1 })}
                          className="p-1"
                        >
                          <Star className={`w-6 h-6 ${i < newExperience.difficultyRating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Selected?</Label>
                      <Switch checked={newExperience.selected} onCheckedChange={(v) => setNewExperience({ ...newExperience, selected: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Post Anonymously?</Label>
                      <Switch checked={newExperience.isAnonymous} onCheckedChange={(v) => setNewExperience({ ...newExperience, isAnonymous: v })} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExperienceModalOpen(false)}>Cancel</Button>
                <Button onClick={submitExperience} className="bg-gradient-to-r from-primary to-primary-dark">Submit Experience</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewPrepPage;
