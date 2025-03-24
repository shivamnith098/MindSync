const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Routes
const noteRoutes = require("./routes/notes");
app.use("/api/notes", noteRoutes);

// Add blockchain routes
// const blockchainRoutes = require("./routes/blockchain");
// app.use("/api/blockchain", blockchainRoutes);

// Create .env file if it doesn't exist or append blockchain configs if it does
// const fs = require('fs');
// if (fs.existsSync('.env')) {
//   // Check if blockchain configs exist, add if they don't
//   const envContent = fs.readFileSync('.env', 'utf8');
//   if (!envContent.includes('BLOCKCHAIN_PROVIDER_URL')) {
//     fs.appendFileSync('.env', '\n# Blockchain Configuration\nBLOCKCHAIN_PROVIDER_URL=http://localhost:8545\nBLOCKCHAIN_PRIVATE_KEY=\nPAPER_REGISTRY_CONTRACT_ADDRESS=\n');
//     console.log('Blockchain config added to .env file. Please fill in required values.');
//   }
// }

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));