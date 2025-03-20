const axios = require('axios');


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Extracts key concepts from provided text using Gemini API
 * @param {string} text - The text to extract concepts from
 * @returns {Array} Array of extracted concepts
 */
const getConceptsFromGemini = async (text) => {
  try {
    const prompt = ` 
      Extract the most important concepts and topics from this note content. 
      Return only a plain JSON array like: ["Concept A", "Topic B", "Term C"]. 
      Do NOT add any extra text, code blocks or explanation.

      Note content: """ ${text} """ 
    `;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    
    let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    // Clean unnecessary wrappers
    rawText = rawText.replace(/```json|```|\n/g, "").trim();
    
    let concepts = [];
    
    try {
      concepts = JSON.parse(rawText);
    } catch (err) {
      console.warn("⚠ Gemini response not in JSON. Falling back to split.");
      concepts = rawText
        .replace(/[\[\]"]/g, '') // remove brackets and quotes
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
    }
    
    return Array.isArray(concepts) ? concepts.slice(0, 10) : [];
  } catch (err) {
    console.error("❌ Gemini Concept Extraction Error:", err.response?.data || err.message);
    return [];
  }
};

/**
 * Gets insights about a specific topic using Gemini API
 * @param {string} topic - The topic to get insights about
 * @returns {string} Insights text about the topic
 */
const getGeminiInsights = async (topic) => {
  try {
    const prompt = `
      Provide a concise, informative overview of the topic "${topic}".
      Focus on key aspects, definitions, and significance.
      Keep it under 350 words and make it educational yet accessible.
      Highlight important related concepts or terms.
    `;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    
    const insightText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!insightText) {
      throw new Error("Empty response from Gemini API");
    }
    
    return insightText;
  } catch (err) {
    console.error("❌ Gemini Insights Error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Asks a specific question about a topic using Gemini API
 * @param {string} topic - The main topic context
 * @param {string} question - The specific question about the topic
 * @returns {string} The answer to the question
 */
const askGeminiQuestion = async (topic, question) => {
  try {
    const prompt = `
      Context: The user is learning about "${topic}".
      
      Question: ${question}
      
      Provide a clear, concise, and helpful answer to this specific question.
      Focus on accuracy and educational value.
      If the question is not related to the topic, still provide a helpful response
      but gently mention that it seems to be outside the current topic.
    `;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    
    const answerText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!answerText) {
      throw new Error("Empty response from Gemini API");
    }
    
    return answerText;
  } catch (err) {
    console.error("❌ Gemini Question Error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = {
  getConceptsFromGemini,
  getGeminiInsights,
  askGeminiQuestion
};
