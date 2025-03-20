// routes/notes.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Note = require("../models/Note");
const { getConceptsFromGemini } = require("../utils/gemini");
const { improveNoteContentAI } = require("../utils/improveNote");
const { structureNoteWithNLP } = require("../utils/structureNoteNLP");
const { extractTextFromImage } = require("../utils/ocrParser");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-ai-note", upload.single("file"), async (req, res) => {
  try {
    console.log("📂 Received file:", req.file);
    console.log("🧑 UserID:", req.body.userId);

    const { userId } = req.body;
    let extractedText = "";

    if (req.file && req.file.mimetype && req.file.mimetype.includes("image")) {
      extractedText = await extractTextFromImage(req.file.path);
    } else if (req.file.mimetype === 'application/pdf') {
      const { extractTextFromPDF } = require("../utils/pdfParser");
      extractedText = await extractTextFromPDF(req.file.path);
    } else {
      extractedText = fs.readFileSync(req.file.path, "utf-8");
    }

    const improvedText = await improveNoteContentAI(extractedText);
    const structuredText = await structureNoteWithNLP(improvedText);
    const concepts = await getConceptsFromGemini(structuredText);

    const fileUrl = `/uploads/${req.file.filename}`;
    const note = new Note({ userId, content: structuredText, fileUrl, concepts });
    await note.save();

    res.json({ success: true, note });
  } catch (err) {
    console.error("❌ AI Note Upload Error:", err);
    res.status(500).json({ error: "Failed to process AI note" });
  }
});

router.post("/upload-text", async (req, res) => {
  try {
    const { userId, content } = req.body;
    const improvedText = await improveNoteContentAI(content);
    const structuredText = await structureNoteWithNLP(improvedText);
    const concepts = await getConceptsFromGemini(structuredText);

    const note = new Note({ userId, content: structuredText, concepts });
    await note.save();

    res.json({ success: true, note });
  } catch (err) {
    console.error("Text Note Upload Error:", err);
    res.status(500).json({ error: "Failed to upload note" });
  }
});

router.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    const { userId, content } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const improvedText = await improveNoteContentAI(content);
    const structuredText = await structureNoteWithNLP(improvedText);
    const concepts = await getConceptsFromGemini(structuredText);

    const note = new Note({ userId, content: structuredText, fileUrl, concepts });
    await note.save();

    res.json({ success: true, note });
  } catch (err) {
    console.error("File Upload Error:", err);
    res.status(500).json({ error: "Failed to upload file note" });
  }
});

router.get("/related/:topic", async (req, res) => {
  try {
    const { topic } = req.params;
    const notes = await Note.find({ concepts: { $in: [topic.toLowerCase()] } });
    res.json(notes);
  } catch (err) {
    console.error("Search API Error:", err);
    res.status(500).json({ error: "Failed to fetch related notes" });
  }
});

router.get("/concepts", async (req, res) => {
  try {
    const notes = await Note.find({});
    const conceptLinks = {};

    notes.forEach(note => {
      note.concepts.forEach((concept, _, arr) => {
        if (!conceptLinks[concept]) conceptLinks[concept] = new Set();
        arr.forEach(other => {
          if (other !== concept) conceptLinks[concept].add(other);
        });
      });
    });

    const result = Object.entries(conceptLinks).map(([name, linksSet]) => ({
      name,
      linksTo: [...linksSet],
    }));

    res.json({ concepts: result });
  } catch (err) {
    console.error("Concept Graph Error:", err);
    res.status(500).json({ error: "Failed to build concept map" });
  }
});

module.exports = router;
