// utils/structureNoteNLP.js

const axios = require("axios");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const structureNoteWithNLP = async (text) => {
  try {
    const prompt = `
You are a knowledge structuring AI assistant.
Your task is to analyze the following note content and structure it into organized sections based on topics and subtopics.
Use a clean, readable format with headings and bullet points where helpful.
Avoid general commentary — only output the structured note.

Note Content:
"""
${text}
"""

Return only the structured note below:
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const structuredText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return structuredText || text;
  } catch (err) {
    console.error("NLP Structuring Error:", err.response?.data || err.message);
    return text; // fallback
  }
};

module.exports = { structureNoteWithNLP };
