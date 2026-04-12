

// import axios from 'axios';

// // Ensure this matches your backend port (default 5000)
// const API_URL = 'http://localhost:5002/api/ai';

// // --- TYPE DEFINITIONS ---
// export interface QuizQuestion {
//   question: string;
//   options: string[];
//   correctIndex: number;
//   explanation: string;
// }

// interface InterviewContext {
//   messages: { role: string; content: string }[];
//   candidateName: string;
//   candidateSkills: string[];
//   interviewerPersona: { name: string; role: string; focus: string };
// }

// // --- 1. CHAT INTERVIEWER LOGIC ---
// export const getAIResponse = async ({ 
//   messages, 
//   candidateName, 
//   candidateSkills, 
//   interviewerPersona 
// }: InterviewContext) => {
//   try {
//     const isFirstMessage = messages.length <= 1;

//     // Send context to backend so it can construct the prompt
//     const res = await axios.post(`${API_URL}/chat`, { 
//         messages,
//         systemPrompt: `
//           You are ${interviewerPersona.name}, a professional ${interviewerPersona.role}.
//           You are interviewing ${candidateName}.
//           FOCUS: ${interviewerPersona.focus}.
//           SKILLS: ${candidateSkills.join(", ")}.
          
//           ${isFirstMessage ? 'Start by greeting the candidate.' : 'Briefly acknowledge the answer and ask the next question.'}
//         `
//     });
    
//     return res.data.result;
//   } catch (error) {
//     console.error("AI Service Error:", error);
//     return "I'm having trouble connecting to the interview server. Please try again.";
//   }
// };

// // --- 2. QUIZ GENERATOR ---
// export const generateQuizQuestion = async (
//   role: string, 
//   difficulty: 'Easy' | 'Medium' | 'Hard', 
//   previousTopics: string[]
// ): Promise<QuizQuestion> => {
//   try {
//     const res = await axios.post(`${API_URL}/quiz`, {
//         prompt: `Generate a ${difficulty} MCQ for a ${role} interview.`
//     });
    
//     return res.data; 
//   } catch (error) {
//     console.error("Quiz Gen Error:", error);
//     return {
//       question: "Could not generate question. Server Error.",
//       options: ["Retry", "Wait", "Refresh", "Exit"],
//       correctIndex: 0,
//       explanation: "Backend connection failed."
//     };
//   }
// };


import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5002/api/ai';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface InterviewContext {
  messages: { role: string; content: string }[];
  candidateName: string;
  candidateSkills: string[];
  interviewerPersona: { name: string; role: string; focus: string };
}

// --- 1. CHAT INTERVIEWER LOGIC ---
// --- 1. CHAT INTERVIEWER LOGIC ---
export const getAIResponse = async ({ 
  messages, 
  candidateName, 
  candidateSkills, 
  interviewerPersona 
}: InterviewContext) => {
  try {
    // Construct a smarter System Prompt
    const systemPrompt = `
      You are ${interviewerPersona.name}, a professional ${interviewerPersona.role}.
      You are interviewing ${candidateName}.
      
      CONTEXT:
      - Role Focus: ${interviewerPersona.focus}
      - Candidate Skills: ${candidateSkills.join(", ")}
      
      INSTRUCTIONS:
      1. Review the entire chat history below.
      2. Do NOT ask a question that has already been asked.
      3. If the candidate answered correctly, acknowledge it briefly and move to a harder question.
      4. If the answer was wrong, briefly correct them before moving on.
      5. Keep responses short (max 2-3 sentences).
      6. Ask exactly ONE question at a time.
    `;

    // Send to backend
    const res = await axios.post(`${API_URL}/chat`, { 
        messages, // We send the full history here
        systemPrompt
    });
    
    return res.data.result;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("I'm having trouble connecting to the interview server.");
  }
};
// --- 2. QUIZ GENERATOR ---
export const generateQuizQuestion = async (
  topic: string, 
  difficulty: string, 
  previousQuestions: string[]
): Promise<QuizQuestion> => {
  try {
    const res = await axios.post(`${API_URL}/quiz`, {
        prompt: `Generate a ${difficulty} multiple-choice question about ${topic}.`
    });
    
    return res.data; 
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    // Fallback if server fails
    return {
      question: "Server Error: Could not generate quiz.",
      options: ["Retry", "Check Console", "Check Server", "Refresh"],
      correctIndex: 0,
      explanation: "Please check if your backend server is running and the API Key is valid."
    };
  }
};