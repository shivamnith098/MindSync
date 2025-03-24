// server/blockchain/utils.js
const crypto = require('crypto');

/**
 * Generates a SHA-256 hash of paper content
 * 
 * @param {Object} paper - Paper object containing content
 * @returns {String} - Hex string of the hash
 */
function generatePaperHash(paper) {
  // Create a standardized string from paper content
  // Including title and content helps ensure uniqueness
  const contentToHash = `${paper.title}:${paper.content}`;
  
  // Generate SHA-256 hash
  return crypto.createHash('sha256')
    .update(contentToHash)
    .digest('hex');
}

/**
 * Utility function to normalize paper content before hashing
 * This ensures consistent hashing regardless of whitespace, etc.
 * 
 * @param {String} content - Paper content 
 * @returns {String} - Normalized content
 */
function normalizeContent(content) {
  if (!content) return '';
  
  // Remove excessive whitespace
  return content
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  generatePaperHash,
  normalizeContent
};