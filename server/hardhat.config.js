

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {}, // Local Hardhat network
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",  // Load from .env
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",  // Load from .env
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
