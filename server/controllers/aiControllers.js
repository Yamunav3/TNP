const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. CHAT HANDLER (Matches your getAIResponse) ---
exports.handleChat = async (req, res) => {
  // Frontend sends: { messages, systemPrompt }
  const { messages, systemPrompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 1. Convert frontend messages to Gemini history format
    // Map 'assistant' -> 'model', 'user' -> 'user'
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' || msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 2. Start Chat
    // We inject the systemPrompt as the first instruction
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
        { role: "model", parts: [{ text: "Understood. I will act according to that persona." }] },
        ...history
      ],
    });

    // 3. Send the latest message
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    // Frontend expects: res.data.result
    res.status(200).json({ result: text });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ result: "AI Service Unavailable" });
  }
};

// --- 2. QUIZ HANDLER (Matches your generateQuizQuestion) ---
exports.generateQuiz = async (req, res) => {
  // Frontend sends: { prompt }
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Enforce JSON format in the prompt
    const finalPrompt = `
      ${prompt}
      
      STRICT REQUIREMENT: Output strictly valid JSON. No markdown, no backticks.
      Format:
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Why it is correct"
      }
    `;

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    // Clean up potential markdown code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Parse JSON
    const quizData = JSON.parse(cleanedText);

    // Frontend expects the object directly
    res.status(200).json(quizData);

  } catch (error) {
    console.error("Quiz Error:", error);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};