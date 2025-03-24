// server/blockchain/deploy.js
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  // Read contract artifact
  const contractPath = path.join(__dirname, 'contracts', 'build', 'PaperRegistry.json');
  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  
  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_URL);
  
  // Create a wallet connected to the provider
  const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
  
  // Calculate the contract factory
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );
  
  console.log('Deploying PaperRegistry contract...');
  const contract = await factory.deploy();
  
  // Wait for the contract to be deployed
  await contract.deployed();
  
  console.log('Contract deployed at address:', contract.address);
  console.log('Transaction hash:', contract.deployTransaction.hash);
  
  // Save the contract address to .env
  fs.appendFileSync('.env', `\nPAPER_REGISTRY_CONTRACT_ADDRESS=${contract.address}`);
  
  console.log('Contract address saved to .env file');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment error:', error);
    process.exit(1);
  });