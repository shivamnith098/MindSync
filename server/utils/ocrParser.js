const Tesseract = require("tesseract.js");
const path = require("path");
const { improveNoteContentAI } = require("./improveNote");
const { structureNoteWithNLP } = require("./structureNoteNLP");

const extractTextFromImage = async (imagePath) => {
  try {
    console.log("🔍 OCR Processing image:", imagePath);

    const result = await Tesseract.recognize(
      path.resolve(imagePath),
      'eng',
      {
        logger: m => console.log(`[Tesseract] ${m.status}: ${Math.floor(m.progress * 100)}%`)
      }
    );

    const rawText = result.data.text.trim();
    console.log("📃 Raw OCR Text:", rawText);

    // Step 2: Improve grammar and clarity
    const improvedText = await improveNoteContentAI(rawText);

    // Step 3: Structure the note using NLP
    const structuredText = await structureNoteWithNLP(improvedText);

    return structuredText;
  } catch (err) {
    console.error("❌ OCR/NLP Error:", err);
    return "";
  }
};

module.exports = { extractTextFromImage };
