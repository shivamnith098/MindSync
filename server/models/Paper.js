// server/models/Paper.js
const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authors: [{
    type: String,
    required: true
  }],
  abstract: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  // Blockchain specific fields
  blockchainHash: {
    type: String
  },
  blockchainTxHash: {
    type: String
  },
  blockchainTimestamp: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Citation and reference tracking
  citations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper'
  }],
  references: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper'
  }],
  // To identify if this is a research paper or patent
  paperType: {
    type: String,
    enum: ['research', 'patent', 'note', 'other'],
    default: 'research'
  }
}, { timestamps: true });

// We can now create papers from the Note model
PaperSchema.statics.createFromNote = async function(note) {
  try {
    // Extract authors from note metadata or use default
    const authors = note.metadata?.authors || ['Unknown Author'];
    
    // Create new paper from note
    return this.create({
      title: note.title || 'Untitled Note',
      authors: authors,
      abstract: note.summary || '',
      content: note.content,
      keywords: note.tags || [],
      paperType: 'note'
    });
  } catch (error) {
    console.error('Error creating paper from note:', error);
    throw error;
  }
};

module.exports = mongoose.model('Paper', PaperSchema);