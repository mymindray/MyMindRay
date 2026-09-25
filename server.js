require("dotenv").config();
const path = require("path");
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = "gemini-3.8-flash";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `You are the AI desk inside My MindRay, a private mental-wellness companion for students.
- Be warm, brief, and practical. Keep replies short (2-5 sentences) unless the user clearly asks for more detail.
- You are a supportive companion, not a licensed therapist, doctor, or crisis counsellor. Never diagnose, prescribe, or claim to be a medical professional.
- If someone describes an emergency, self-harm, or being in immediate danger, gently and clearly tell them to contact emergency services right away, and mention the KIRAN mental health helpline (1800-599-0019, India, toll-free, 24/7) and the emergency number 112 (India).
- When it fits naturally, point the user toward the right part of the app: the Relax page for guided breathing/grounding, the Journal for private writing, or the Doctors directory to book a consultation.
- Keep a calm, non-judgmental, encouraging tone. Avoid clinical jargon.`;

app.use(express.json({ limit: "15mb" }));
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "The AI is not configured. Set GEMINI_API_KEY in your .env file and restart the server."
    });
  }

  try {
    const { message, images, history } = req.body || {};
    const hasImages = Array.isArray(images) && images.length > 0;
    if (!message && !hasImages) {
      return res.status(400).json({ error: "Empty message." });
    }

    const contents = [];

    if (Array.isArray(history)) {
      history.slice(-12).forEach((turn) => {
        if (!turn || !turn.text) return;
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: String(turn.text).slice(0, 4000) }]
        });
      });
    }

    const parts = [];
    if (message) parts.push({ text: String(message).slice(0, 4000) });
    if (hasImages) {
      images.slice(0, 3).forEach((src) => {
        const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(String(src || ""));
        if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      });
    }
    if (!parts.length) parts.push({ text: "" });

    contents.push({ role: "user", parts });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    const reply = response && response.text ? response.text.trim() : "";
    res.json({ reply: reply || "I'm here with you. Could you tell me a little more about that?" });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "The AI could not respond right now. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`My MindRay server listening on http://localhost:${PORT}`);
});
