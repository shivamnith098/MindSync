// server/blockchain/verification.js
const ethers = require('ethers');
const PaperRegistryABI = require('./contracts/build/PaperRegistry.json').abi;

class BlockchainService {
  constructor(provider, contractAddress) {
    this.provider = new ethers.providers.JsonRpcProvider(provider);
    this.contract = new ethers.Contract(contractAddress, PaperRegistryABI, this.provider);
  }

  async registerPaper(paperHash, metadata, authorAddress) {
    const signer = this.provider.getSigner(authorAddress);
    const contractWithSigner = this.contract.connect(signer);
    const tx = await contractWithSigner.registerPaper(paperHash, JSON.stringify(metadata));
    return await tx.wait();
  }

  async verifyPaper(paperHash) {
    return await this.contract.verifyPaper(paperHash);
  }
}

module.exports = BlockchainService;