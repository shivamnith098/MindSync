const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: String,
  content: String,
  fileUrl: String,
  concepts: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Note", NoteSchema);