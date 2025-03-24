// server/blockchain/hardhat.config.js
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.17",
  networks: {
    // For development with Hardhat's built-in network
    hardhat: {},
    // For connecting to a public testnet like Goerli
    testnet: {
      url: process.env.BLOCKCHAIN_PROVIDER_URL,
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY]
    },
    // For mainnet when ready
    mainnet: {
      url: process.env.MAINNET_PROVIDER_URL,
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY]
    }
  },
  paths: {
    artifacts: './contracts/build',
  },
};