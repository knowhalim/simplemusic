const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve audio files
app.use('/audio', express.static('public/audio'));

// Your music database (add your songs here!)
const musicDatabase = [
  {
    id: "1",
    title: "Mom Morning",
    url: "https://daymusic.sys.knowhalim.com/audio/MakanSihat.mp3" // Replace with your domain!
  }
];

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>🎵 Your Music Server is Running!</h1>
    <p>Available songs:</p>
    <ul>
      ${musicDatabase.map(song => `<li><a href="${song.url}">${song.title}</a></li>`).join('')}
    </ul>
  `);
});

// Alexa skill endpoint
app.post('/alexa', (req, res) => {
  const request = req.body;
  
  console.log('Alexa Request:', JSON.stringify(request, null, 2));
  
  // Handle different types of requests
  if (request.request.type === 'LaunchRequest') {
    // When user says "Alexa, open my music"
    res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Welcome to your personal music player! Say play music to start.'
        },
        shouldEndSession: false
      }
    });
  } 
  else if (request.request.type === 'IntentRequest' && request.request.intent.name === 'PlayAudio') {
    // When user says "play music"
    const firstSong = musicDatabase[0];
    
    res.json({
      version: '1.0',
      response: {
        directives: [
          {
            type: 'AudioPlayer.Play',
            playBehavior: 'REPLACE_ALL',
            audioItem: {
              stream: {
                token: firstSong.id,
                url: firstSong.url,
                offsetInMilliseconds: 0
              },
              metadata: {
                title: firstSong.title,
                subtitle: 'My Personal Music'
              }
            }
          }
        ],
        shouldEndSession: true
      }
    });
  }
  else {
    // Default response
    res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Sorry, I did not understand that.'
        },
        shouldEndSession: true
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Music server running on port ${PORT}`);
});
