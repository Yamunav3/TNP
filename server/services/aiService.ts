import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Generates a conversational response for the Mock Interview
export const getAIResponse = async (data: {
  messages: { role: string; content: string }[];
  candidateName: string;
  candidateSkills: string[];
  interviewerPersona: Record<string, any>;
}) => {
  const response = await axios.post(`${API_URL}/api/ai/interview`, data);
  return response.data.content;
};

// Generates a structured JSON question for the Quiz section
export const generateQuizQuestion = async (category: string, level: string, history: string[]): Promise<QuizQuestion> => {
  const response = await axios.post(`${API_URL}/api/ai/quiz-question`, { category, level, history });
  return response.data; // Expects { question, options, correctIndex, explanation }
};