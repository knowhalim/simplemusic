const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all requests
app.use(cors());

// Serve audio files from public/audio folder
app.use('/audio', express.static('public/audio'));

// Home page - shows your server is running
app.get('/', (req, res) => {
  res.send(`
    <h1>🎵 Your Music Server is Running!</h1>
    <p>Upload your MP3 files to the /audio folder</p>
    <p>Access them at: /audio/yourfile.mp3</p>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Music server is healthy!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Music server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
