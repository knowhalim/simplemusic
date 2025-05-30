const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/audio', express.static('public/audio'));

// Your music (UPDATE THESE URLS!)
const songs = [
  {
    id: "1",
    title: "Mom Morning",
    url: "https://daymusic.sys.knowhalim.com/audio/MakanSihat.mp3" // Replace with your domain!
  }
];

// Home page
app.get('/', (req, res) => {
  res.send('<h1>🎵 Music Server Running!</h1><p>Alexa endpoint: /alexa</p>');
});

// Test endpoint 
app.get('/alexa', (req, res) => {
  res.json({ message: 'Alexa endpoint is working! Use POST for actual requests.' });
});

// Alexa skill endpoint (the important one!)
app.post('/alexa', (req, res) => {
  try {
    console.log('📨 Alexa request received:', req.body?.request?.type);
    
    const requestType = req.body?.request?.type;
    const intentName = req.body?.request?.intent?.name;
    
    // Launch request - "Alexa, open my music"
    if (requestType === 'LaunchRequest') {
      return res.json({
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: 'Welcome to your music player! Say play music to start listening.'
          },
          reprompt: {
            outputSpeech: {
              type: 'PlainText',
              text: 'You can say play music, or ask for help.'
            }
          },
          shouldEndSession: false
        }
      });
    }
    
    // Play music intent
    if (requestType === 'IntentRequest' && intentName === 'PlayAudio') {
      const song = songs[0]; // Play first song
      
      return res.json({
        version: '1.0',
        response: {
          directives: [{
            type: 'AudioPlayer.Play',
            playBehavior: 'REPLACE_ALL',
            audioItem: {
              stream: {
                token: song.id,
                url: song.url,
                offsetInMilliseconds: 0
              },
              metadata: {
                title: song.title,
                subtitle: 'Personal Music'
              }
            }
          }],
          shouldEndSession: true
        }
      });
    }
    
    // Default response
    res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'I can play your music. Just say play music!'
        },
        shouldEndSession: true
      }
    });
    
  } catch (error) {
    console.error('❌ Alexa endpoint error:', error);
    res.status(500).json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Sorry, there was a problem with the music player.'
        },
        shouldEndSession: true
      }
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server started on port', PORT);
});
