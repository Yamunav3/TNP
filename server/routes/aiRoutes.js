const express = require('express');
const OpenAI = require('openai');
const router = express.Router();
require('dotenv').config();

// Initialize Groq client (using OpenAI compatibility)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// --- 1. CHAT ENDPOINT ---
router.post('/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    // --- CRITICAL FIX ---
    // We must pass the PREVIOUS conversation history to the model.
    // If we only pass the last message, the AI forgets everything.
    const conversation = [
        { role: "system", content: systemPrompt }, 
        ...messages // <--- This spreads the entire history into the prompt
    ];

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Or "gpt-3.5-turbo" / "gemini-pro"
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

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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