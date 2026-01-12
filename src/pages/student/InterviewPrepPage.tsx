
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Upload, Send, Brain, Building2, Code, 
  Loader2, Mic, MicOff, Sparkles, Target, Trophy, BookOpen, 
  ArrowLeft, Volume2, VolumeX, CheckCircle, XCircle, FileText, Download, Clock
} from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Services & Redux
import { getAIResponse, generateQuizQuestion, QuizQuestion } from "@/services/aiService";
import { useAppSelector } from '@/hooks/useAppDispatch'; 

// --- TYPES ---
type Message = { role: "user" | "assistant"; content: string; };

// Speech Types
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", 
  "Full Stack Developer", "Data Scientist", "DevOps Engineer", 
  "Product Manager", "UI/UX Designer"
];

const QUIZ_CATEGORIES = [
  { id: "dsa", name: "Data Structures", icon: Code, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "aptitude", name: "Aptitude", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "os", name: "Operating Systems", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "dbms", name: "DBMS", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "cn", name: "Networks", icon: Building2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

// --- MOCK DATA FOR COMPANIES ---
const COMPANY_DATA: Record<string, {
    logo: string;
    process: string[];
    questions: string[];
    resources: { name: string; size: string }[];
}> = {
    "Google": {
        logo: "🔵",
        process: ["Phone Screen (45 min)", "Technical Round 1 (DSA)", "Technical Round 2 (System Design)", "Googlyness (Behavioral)"],
        questions: ["Invert a Binary Tree", "Design a URL Shortener", "Explain MapReduce", "Tell me about a time you failed."],
        resources: [
            { name: "Google_Interview_Guide_2024.pdf", size: "2.4 MB" },
            { name: "Google_System_Design_Cheatsheet.pdf", size: "1.1 MB" },
            { name: "Top_50_Google_DSA_Questions.pdf", size: "850 KB" }
        ]
    },
    "Microsoft": {
        logo: "🟦",
        process: ["Online Assessment", "Technical Interview 1", "Technical Interview 2", "HR/Managerial Round"],
        questions: ["Reverse a Linked List", "Design a Parking Lot", "Difference between Process and Thread", "Why Microsoft?"],
        resources: [
            { name: "Microsoft_Core_Competencies.pdf", size: "1.8 MB" },
            { name: "Azure_Basics_For_Interviews.pdf", size: "3.2 MB" }
        ]
    },
    "Amazon": {
        logo: "🟠",
        process: ["Online Assessment (OA)", "Bar Raiser Round", "System Design", "Leadership Principles Review"],
        questions: ["Top K Frequent Elements", "Design Amazon Locker", "Tell me about a time you disagreed with a manager.", "Explain Amazon's 14 Leadership Principles."],
        resources: [
            { name: "Amazon_Leadership_Principles_Deep_Dive.pdf", size: "4.5 MB" },
            { name: "Star_Method_Guide.pdf", size: "500 KB" }
        ]
    },
    "Netflix": {
        logo: "🔴",
        process: ["Recruiter Screen", "Technical Screen (Remote)", "Onsite: System Design", "Onsite: Cultural Fit"],
        questions: ["Design Netflix Video Player", "Explain Caching Strategies", "Who is our biggest competitor?", "What would you change about Netflix?"],
        resources: [
            { name: "Netflix_Culture_Deck.pdf", size: "5.1 MB" },
            { name: "High_Scalability_Architecture.pdf", size: "2.2 MB" }
        ]
    },
    "Meta": {
        logo: "🔷",
        process: ["Initial Screen", "Coding Interview (Ninja)", "System Design (Pirate)", "Behavioral (Jedi)"],
        questions: ["Merge Intervals", "Design Facebook Messenger", "Flatten a Multilevel Doubly Linked List", "Conflict Resolution"],
        resources: [
            { name: "Meta_Engineering_Bootcamp.pdf", size: "3.0 MB" },
            { name: "React_Internals_Deep_Dive.pdf", size: "1.5 MB" }
        ]
    }
};

const InterviewPrepPage = () => {
  const { toast } = useToast();
  const { profile } = useAppSelector((state) => state.profile); 
  const userName = profile?.personalInfo?.firstName || "Candidate";

  const [isLoading, setIsLoading] = useState(false);
  
  // --- INTERVIEW STATE (Chat & Voice) ---
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const interviewEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- QUIZ STATE (Visual UI) ---
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // --- COMPANY STATE (Static UI) ---
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // --- 1. VOICE LOGIC (Only for Interview) ---
  const scrollToBottom = () => {
    interviewEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => scrollToBottom(), [messages, isLoading, isListening]);

  // Speech-to-Text Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
      const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;
      
      if (SpeechRecognitionApi) {
        recognitionRef.current = new SpeechRecognitionApi();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if(transcript) setInputMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => setIsListening(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel(); 
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (isMuted || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => { window.speechSynthesis.getVoices(); }, []);

  // --- 2. INTERVIEW LOGIC ---
  const handleInterviewResponse = async (newHistory: Message[]) => {
    setIsLoading(true);
    try {
      const aiResponse = await getAIResponse({
        // --- FIXED LINE: Send role exactly as is ('user' or 'assistant') ---
        messages: newHistory.map(m => ({ 
            role: m.role, 
            content: m.content 
        })),
        candidateName: userName,
        candidateSkills: [selectedRole],
        interviewerPersona: { name: "AI Interviewer", role: "Senior " + selectedRole, focus: "Technical" }
      });
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      speak(aiResponse);
    } catch (error) {
      toast({ title: "Error", description: "AI failed to respond.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = async () => {
    const startMsg = `I am ready for my ${selectedRole} interview. ${resumeFileName ? "I have uploaded my resume." : ""}`;
    const initialHistory: Message[] = [{ role: "user", content: startMsg }];
    setMessages(initialHistory);
    await handleInterviewResponse(initialHistory);
  };

  const sendInterviewMessage = async () => {
    if (!inputMessage.trim()) return;
    if(isListening) toggleListening();
    window.speechSynthesis.cancel();

    const newMsg: Message = { role: "user", content: inputMessage };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage("");
    await handleInterviewResponse([...messages, newMsg]);
  };

  const endInterview = () => {
    window.speechSynthesis.cancel();
    if(isListening && recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setMessages([]);
    setInputMessage("");
    toast({ title: "Session Ended", description: "Interview reset." });
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      toast({ title: "Resume Uploaded", description: `Ready to analyze ${file.name}` });
    }
  };


  // --- 3. QUIZ LOGIC (NEW - NO CHAT) ---
  const loadNewQuestion = async (category: string) => {
    setIsLoading(true);
    setSelectedOption(null);
    setShowExplanation(false);
    try {
        // AI Service generates a structured JSON question
        const q = await generateQuizQuestion(category + " Engineer", 'Medium', []);
        setCurrentQuestion(q);
        setQuizQuestionCount(prev => prev + 1);
    } catch (e) {
        toast({ title: "Error", description: "Failed to load question." });
    } finally {
        setIsLoading(false);
    }
  };

  const startQuiz = (category: string) => {
      setSelectedQuizCategory(category);
      setQuizScore(0);
      setQuizQuestionCount(0);
      loadNewQuestion(category);
  };

  const handleQuizAnswer = (index: number) => {
      if (showExplanation) return;
      setSelectedOption(index);
      setShowExplanation(true);
      if (index === currentQuestion?.correctIndex) {
          setQuizScore(prev => prev + 1);
      }
  };

  // --- 4. COMPANY VIEW RENDERER ---
  const CompanyDetailView = ({ companyName }: { companyName: string }) => {
    const data = COMPANY_DATA[companyName] || COMPANY_DATA["Google"];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{data.logo}</div>
                <div>
                    <h2 className="text-3xl font-bold">{companyName}</h2>
                    <p className="text-muted-foreground">Interview Preparation Resources</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Process */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500"/> Interview Process</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {data.process.map((step, i) => (
                                <li key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                    <Badge variant="outline">{i + 1}</Badge> {step}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Questions */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-500"/> Top Questions</CardTitle></CardHeader>
                    <CardContent>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            {data.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Files / Resources */}
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-orange-500"/> Study Materials</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    {data.resources.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toast({ title: "Downloading...", description: `${file.name} started.` })}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FileText className="w-5 h-5"/></div>
                                <div>
                                    <p className="font-medium text-sm">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{file.size}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon"><Download className="w-4 h-4"/></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
  };


  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
         <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">AI Interview Prep</h1>
                <p className="text-muted-foreground">Master your interview with real-time AI simulations.</p>
            </div>
            {/* Global Mute Toggle (Only affects Mock Interview) */}
            <Button variant="outline" size="sm" onClick={() => { if(!isMuted) window.speechSynthesis.cancel(); setIsMuted(!isMuted); }}>
                {isMuted ? <VolumeX className="w-4 h-4 mr-2"/> : <Volume2 className="w-4 h-4 mr-2"/>} {isMuted ? "Unmute" : "Mute"}
            </Button>
         </div>
      </motion.div>

      <Tabs defaultValue="interview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="interview" className="gap-2"><MessageSquare className="h-4 w-4" /> Interview</TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2"><Brain className="h-4 w-4" /> Quiz</TabsTrigger>
          <TabsTrigger value="company" className="gap-2"><Building2 className="h-4 w-4" /> Company</TabsTrigger>
        </TabsList>

        {/* 1. MOCK INTERVIEW TAB (Chat & Voice) */}
        <TabsContent value="interview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Setup</CardTitle>
                <CardDescription>Configure your session</CardDescription>
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
                  <label className="text-sm font-medium">Resume</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 hover:border-primary/50 hover:bg-muted/50 transition-all">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center">{resumeFileName || "Upload PDF"}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                  </label>
                </div>
                <Button onClick={startInterview} disabled={isLoading} className="w-full gap-2 rounded-xl" size="lg">
                  <Mic className="h-4 w-4" /> Start Interview
                </Button>
                {messages.length > 0 && <Button variant="destructive" onClick={endInterview} className="w-full">End Session</Button>}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-lg border-muted h-[600px] flex flex-col">
              <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/> Live Session</CardTitle>
                {isMuted && <Badge variant="secondary" className="text-xs">Voice Off</Badge>}
              </CardHeader>
              
              <CardContent className="p-0 flex-1 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center gap-4 text-center opacity-50 mt-20">
                                <Brain className="h-12 w-12" /><p>Ready? Click Start to begin.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-line ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="flex justify-start"><div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Thinking...</div></div>}
                        {isListening && <div className="flex justify-end"><div className="bg-red-50 text-red-500 border border-red-200 rounded-2xl px-4 py-2 flex items-center gap-2 animate-pulse"><Mic className="h-4 w-4"/> Listening...</div></div>}
                        <div ref={interviewEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                      <form onSubmit={(e) => { e.preventDefault(); sendInterviewMessage(); }} className="flex gap-2">
                          <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListening} className="rounded-full shrink-0">
                             {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder={isListening ? "Listening..." : "Type answer..."} disabled={isLoading} className="rounded-full"/>
                          <Button type="submit" size="icon" disabled={isLoading || !inputMessage} className="rounded-full"><Send className="h-4 w-4"/></Button>
                      </form>
                  </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. QUIZ TAB (Structured UI - No Chat) */}
        <TabsContent value="quiz">
            <AnimatePresence mode="wait">
                {!selectedQuizCategory ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {QUIZ_CATEGORIES.map((cat) => (
                            <Card key={cat.id} onClick={() => startQuiz(cat.name)} className="cursor-pointer hover:border-primary hover:shadow-md transition-all group">
                                <CardContent className="flex flex-col items-center gap-4 p-6">
                                    <div className={`rounded-full p-4 ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}><cat.icon className="h-8 w-8" /></div>
                                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                                    <Badge variant="secondary">Start Quiz</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                ) : (
                    <Card className="max-w-3xl mx-auto shadow-lg min-h-[500px]">
                        <CardHeader className="border-b flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> {selectedQuizCategory} Quiz</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Question {quizQuestionCount} | Score: {quizScore}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedQuizCategory(null)}>Exit Quiz</Button>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col justify-center min-h-[400px]">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary"/>
                                    <p className="text-lg animate-pulse">Generating Challenge...</p>
                                </div>
                            ) : currentQuestion ? (
                                <div className="space-y-8 animate-in fade-in zoom-in-95">
                                    <h2 className="text-2xl font-bold leading-relaxed">{currentQuestion.question}</h2>
                                    <div className="grid gap-4">
                                        {currentQuestion.options.map((opt, idx) => {
                                            const isCorrect = idx === currentQuestion.correctIndex;
                                            const isSelected = selectedOption === idx;
                                            let style = "p-4 text-left border-2 rounded-xl text-lg hover:bg-accent transition-all flex items-center";
                                            let icon = null;

                                            if (showExplanation) {
                                                if (isCorrect) {
                                                    style = "p-4 text-left border-2 rounded-xl text-lg bg-green-50 border-green-500 text-green-700 flex items-center justify-between";
                                                    icon = <CheckCircle className="w-5 h-5"/>;
                                                } else if (isSelected) {
                                                    style = "p-4 text-left border-2 rounded-xl text-lg bg-red-50 border-red-500 text-red-700 flex items-center justify-between";
                                                    icon = <XCircle className="w-5 h-5"/>;
                                                } else {
                                                    style += " opacity-50";
                                                }
                                            }
                                            return (
                                                <button key={idx} disabled={showExplanation} onClick={() => handleQuizAnswer(idx)} className={style}>
                                                    <span className="font-bold mr-3">{String.fromCharCode(65+idx)}.</span> {opt}
                                                    {icon}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {showExplanation && (
                                        <div className="mt-4 p-6 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
                                            <p className="font-bold flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4"/> Explanation:</p>
                                            <p className="leading-relaxed">{currentQuestion.explanation}</p>
                                            <Button onClick={() => loadNewQuestion(selectedQuizCategory!)} className="mt-4 w-full md:w-auto">Next Question</Button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}
            </AnimatePresence>
        </TabsContent>

        {/* 3. COMPANY PREP TAB (Structured Resources - No Chat) */}
        <TabsContent value="company">
            <AnimatePresence mode="wait">
                {!selectedCompany ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.keys(COMPANY_DATA).map((company) => (
                            <Card key={company} onClick={() => setSelectedCompany(company)} className="cursor-pointer hover:border-primary hover:shadow-md transition-all group">
                                <CardContent className="flex flex-col items-center gap-3 p-6">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{COMPANY_DATA[company].logo}</span>
                                    <h3 className="font-bold text-lg">{company}</h3>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <Button variant="ghost" onClick={() => setSelectedCompany(null)} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Companies</Button>
                        <CompanyDetailView companyName={selectedCompany} />
                    </div>
                )}
            </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewPrepPage;