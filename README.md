# MindSync

MindSync is an AI-powered note-taking and concept clustering application that helps users organize and analyze their notes efficiently. The app integrates with AI models to generate insights, extract key concepts, and link related ideas.

## Features
- **AI-Powered Note Upload**: Upload images or documents to extract concepts automatically.
- **Concept Clustering**: Group related concepts for better organization and understanding.
- **Linked Notes**: Discover relationships between different notes.
- **User-Friendly UI**: Intuitive design with smooth navigation.
- **Blockchain Integration**: Securely store and verify notes using blockchain technology.

## Project Structure
```
shivamnith098-mindsync/
├── client/                 # React Native frontend
│   ├── App.js              # Main application entry point
│   ├── screens/            # App screens
│   │   ├── HomeScreen.js           
│   │   ├── UploadAiNoteScreen.js   
│   │   ├── LinkedNotesScreen.js    
│   │   ├── ConceptClusterScreen.js
│   ├── components/        # UI components
│   ├── services/          # API services
│   ├── assets/            # Static assets
├── server/                # Backend with Express and MongoDB
│   ├── server.js          # Main server file
│   ├── routes/            # API routes
│   ├── blockchain/        # Blockchain service integration
│   ├── .env               # Environment variables
```

## Installation & Setup
### Prerequisites
- Node.js
- MongoDB
- Expo CLI (for React Native frontend)

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/mindsync.git
   cd mindsync/server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and add the following:
   ```
   MONGO_URI=your_mongodb_connection_string
   BLOCKCHAIN_PROVIDER_URL=http://localhost:8545
   BLOCKCHAIN_PRIVATE_KEY=your_private_key
   ```
4. Start the backend server:
   ```sh
   node server.js
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```sh
   cd ../client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   expo start
   ```

## Usage
- Run the backend and frontend services as described above.
- Use the mobile app to upload notes, explore concept clusters, and link related notes.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request.


