// server/routes/blockchain.js
const express = require('express');
const router = express.Router();
const BlockchainService = require('../blockchain/service');
const { generatePaperHash } = require('../blockchain/utils');
const Paper = require('../models/Paper');

// Initialize blockchain service
const blockchainService = new BlockchainService();

/**
 * Register a paper on the blockchain
 * POST /api/blockchain/register
 */
router.post('/register', async (req, res) => {
  try {
    const { paperId, authorAddress } = req.body;
    
    // Retrieve paper from database
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paper not found' 
      });
    }
    
    // Check if paper is already registered
    if (paper.blockchainHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper already registered on blockchain' 
      });
    }
    
    // Generate hash for paper
    const paperHash = generatePaperHash(paper);
    
    // Prepare metadata
    const metadata = {
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      keywords: paper.keywords,
      publicationDate: paper.createdAt
    };
    
    // Register on blockchain
    const receipt = await blockchainService.registerPaper(
      paperHash,
      metadata,
      authorAddress || req.body.walletAddress
    );
    
    // Update paper with blockchain info
    paper.blockchainHash = paperHash;
    paper.blockchainTxHash = receipt.transactionHash;
    paper.blockchainTimestamp = new Date(receipt.timestamp);
    paper.isVerified = true;
    
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: 'Paper successfully registered on blockchain',
      paper,
      receipt
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register paper', 
      error: error.message 
    });
  }
});

/**
 * Verify a paper on the blockchain
 * POST /api/blockchain/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { paperId } = req.body;
    
    // Retrieve paper from database
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paper not found' 
      });
    }
    
    // If paper has no blockchain hash, it's not registered
    if (!paper.blockchainHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper not registered on blockchain' 
      });
    }
    
    // Verify on blockchain
    const verification = await blockchainService.verifyPaper(paper.blockchainHash);
    
    // Update verification status in database
    paper.isVerified = verification.exists;
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: verification.exists 
        ? 'Paper successfully verified on blockchain' 
        : 'Paper not found on blockchain',
      verification,
      paper
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify paper', 
      error: error.message 
    });
  }
});

/**
 * Get paper history from blockchain
 * GET /api/blockchain/history/:paperId
 */
router.get('/history/:paperId', async (req, res) => {
  try {
    const paperId = req.params.paperId;
    
    // Retrieve paper from database
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paper not found' 
      });
    }
    
    // If paper has no blockchain hash, it's not registered
    if (!paper.blockchainHash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Paper not registered on blockchain' 
      });
    }
    
    // Get history from blockchain
    const history = await blockchainService.getPaperHistory(paper.blockchainHash);
    
    res.status(200).json({
      success: true,
      paper,
      history
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch paper history', 
      error: error.message 
    });
  }
});

module.exports = router;