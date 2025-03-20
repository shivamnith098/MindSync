// utils/improveNote.js

const axios = require("axios");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const improveNoteContentAI = async (text) => {
  try {
    const prompt = `
You are an AI assistant. Improve the following note content by:
1. Correcting grammar and spelling
2. Enhancing clarity and flow
3. Structuring it in readable format

Return only the improved content (no explanations or formatting wrappers):
"""
${text}
"""
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const improvedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return improvedText || text;
  } catch (err) {
    console.error("Gemini AI Note Improvement Error:", err.response?.data || err.message);
    return text; // fallback to original text
  }
};

module.exports = { improveNoteContentAI };