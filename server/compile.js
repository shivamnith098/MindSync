// server/compile.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Compile the contract
  await hre.run('compile');
  
  // Get the contract factory
  const PaperRegistry = await ethers.getContractFactory("PaperRegistry");
  
  // Get the artifact information
  const artifactPath = path.join(__dirname, "blockchain/contracts/build/PaperRegistry.json");
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(path.dirname(artifactPath))) {
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  }
  
  // Write the ABI to a file
  fs.writeFileSync(
    artifactPath,
    JSON.stringify({
      abi: PaperRegistry.interface.format('json'),
      bytecode: PaperRegistry.bytecode
    }, null, 2)
  );
  
  console.log("Contract compiled and ABI saved to:", artifactPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });