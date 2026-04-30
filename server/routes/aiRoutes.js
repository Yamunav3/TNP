const express = require('express');
const OpenAI = require('openai');
const path = require('path');
const router = express.Router();
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const FALLBACK_GROQ_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';

// Helper function to get Groq client with lazy initialization
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
};

const runChatCompletion = async (openai, payload, model = DEFAULT_GROQ_MODEL) => {
  try {
    return await openai.chat.completions.create({ ...payload, model });
  } catch (err) {
    if (err?.code === 'model_decommissioned' && model !== FALLBACK_GROQ_MODEL) {
      console.warn(`⚠️ Model ${model} is decommissioned. Retrying with ${FALLBACK_GROQ_MODEL}.`);
      return openai.chat.completions.create({ ...payload, model: FALLBACK_GROQ_MODEL });
    }
    throw err;
  }
};

// --- 1. CHAT ENDPOINT ---
router.post('/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    const openai = getGroqClient();

    // --- CRITICAL FIX ---
    // We must pass the PREVIOUS conversation history to the model.
    // If we only pass the last message, the AI forgets everything.
    const conversation = [
        { role: "system", content: systemPrompt }, 
        ...messages // <--- This spreads the entire history into the prompt
    ];

    const completion = await runChatCompletion(openai, {
      messages: conversation,
      temperature: 0.7, // Lower temperature = less random / less repetition
    });

    res.json({ result: completion.choices[0]?.message?.content });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Failed" });
  }
});

// --- 2. QUIZ ENDPOINT ---
router.post('/quiz', async (req, res) => {
  try {
    const { prompt } = req.body;
    const openai = getGroqClient();

    // Llama-3 instruction to force JSON
    const jsonPrompt = `
      ${prompt}
      
      IMPORTANT: Return ONLY valid JSON. Do not add markdown formatting like \`\`\`json.
      Structure:
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctIndex": number,
        "explanation": "string"
      }
    `;

    const completion = await runChatCompletion(openai, {
      messages: [{ role: "user", content: jsonPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" } // Force JSON mode
    });

    const content = completion.choices[0]?.message?.content;
    
    // Parse it safely
    const quizData = JSON.parse(content);
    res.json(quizData);

  } catch (err) {
    console.error("Quiz Gen Error:", err);
    res.status(500).json({ error: "Quiz Gen Failed" });
  }
});

module.exports = router;