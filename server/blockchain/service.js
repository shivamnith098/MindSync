// server/blockchain/service.js
const ethers = require('ethers');
const PaperRegistryABI = require('./contracts/build/PaperRegistry.json').abi;
require('dotenv').config();

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_URL);
    this.contract = new ethers.Contract(
      process.env.PAPER_REGISTRY_CONTRACT_ADDRESS, 
      PaperRegistryABI, 
      this.provider
    );
    this.privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    this.wallet = new ethers.Wallet(this.privateKey, this.provider);
    this.contractWithSigner = this.contract.connect(this.wallet);
  }

  async registerPaper(paperHash, metadata, authorAddress) {
    try {
      // Prepare metadata for on-chain storage (only store essential info)
      const metadataForChain = {
        title: metadata.title,
        authors: metadata.authors,
        timestamp: Date.now(),
        authorAddress
      };
      
      // Convert to string for blockchain storage
      const metadataString = JSON.stringify(metadataForChain);
      
      // Register the paper on the blockchain
      const tx = await this.contractWithSigner.registerPaper(
        paperHash, 
        metadataString
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Blockchain registration error:', error);
      throw new Error(`Failed to register paper: ${error.message}`);
    }
  }

  async verifyPaper(paperHash) {
    try {
      const result = await this.contract.verifyPaper(paperHash);
      
      // Parse blockchain response
      return {
        exists: result.registered,
        author: result.author,
        timestamp: new Date(Number(result.timestamp) * 1000).toISOString(),
        metadataHash: result.metadataHash
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      throw new Error(`Failed to verify paper: ${error.message}`);
    }
  }

  async getPaperHistory(paperHash) {
    try {
      // Query events from the blockchain
      const filter = this.contract.filters.PaperRegistered(paperHash);
      const events = await this.contract.queryFilter(filter);
      
      return events.map(event => ({
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(Number(event.args.timestamp) * 1000).toISOString(),
        author: event.args.author
      }));
    } catch (error) {
      console.error('Error fetching paper history:', error);
      throw new Error(`Failed to get paper history: ${error.message}`);
    }
  }
}

module.exports = BlockchainService;