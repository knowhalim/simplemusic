const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/audio', express.static('public/audio'));

// Your music database - ADD YOUR SONGS HERE!
const songs = {
  "mom day": {
    id: "1",
    title: "Mom Morning",
    url: "https://daymusic.sys.knowhalim.com/audio/MakanSihat.mp3" // Replace with your domain!
  }
  // Add more songs here!
};

// Helper function to find song by name
function findSong(songName) {
  const searchName = songName.toLowerCase().trim();
  
  // Direct match
  if (songs[searchName]) {
    return songs[searchName];
  }
  
  // Partial match
  for (let key in songs) {
    if (key.includes(searchName) || searchName.includes(key)) {
      return songs[key];
    }
  }
  
  return null;
}

// Home page
app.get('/', (req, res) => {
  const songList = Object.keys(songs).map(name => `<li>"${name}"</li>`).join('');
  res.send(`
    <h1>🎵 Music Server Running!</h1>
    <h3>Available songs:</h3>
    <ul>${songList}</ul>
    <p>Say: "Alexa, tell my music to play [song name]"</p>
  `);
});

app.get('/alexa', (req, res) => {
  res.json({ message: 'Alexa endpoint ready!' });
});

// Main Alexa endpoint
app.post('/alexa', (req, res) => {
  try {
    const requestType = req.body?.request?.type;
    const intentName = req.body?.request?.intent?.name;
    const slots = req.body?.request?.intent?.slots;
    
    console.log('📨 Request type:', requestType);
    console.log('🎯 Intent:', intentName);
    console.log('📝 Slots:', slots);
    
    // Launch - "Alexa, open my music"
    if (requestType === 'LaunchRequest') {
      const songNames = Object.keys(songs).join(', ');
      return res.json({
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: `Welcome to your music player! You can say play followed by a song name. Available songs are: ${songNames}.`
          },
          reprompt: {
            outputSpeech: {
              type: 'PlainText',
              text: 'Which song would you like to hear?'
            }
          },
          shouldEndSession: false
        }
      });
    }
    
    // Play specific song - "play Mom Music"
    if (requestType === 'IntentRequest' && intentName === 'PlaySpecificSongIntent') {
      const songName = slots?.songName?.value;
      console.log('🎵 Requested song:', songName);
      
      if (!songName) {
        return res.json({
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: 'Which song would you like me to play?'
            },
            shouldEndSession: false
          }
        });
      }
      
      const song = findSong(songName);
      
      if (song) {
        return res.json({
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: `Playing ${song.title}`
            },
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
                  subtitle: 'Personal Music Collection'
                }
              }
            }],
            shouldEndSession: true
          }
        });
      } else {
        const availableSongs = Object.keys(songs).join(', ');
        return res.json({
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: `I couldn't find a song called ${songName}. Available songs are: ${availableSongs}`
            },
            shouldEndSession: false
          }
        });
      }
    }
    
    // Generic play intent
    if (requestType === 'IntentRequest' && intentName === 'PlayAudio') {
      const firstSong = Object.values(songs)[0];
      return res.json({
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: `Playing ${firstSong.title}`
          },
          directives: [{
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
                subtitle: 'Personal Music'
              }
            }
          }],
          shouldEndSession: true
        }
      });
    }
    
    // Default response
    return res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'You can say play followed by a song name, or just say play music.'
        },
        shouldEndSession: false
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Sorry, there was a problem playing your music.'
        },
        shouldEndSession: true
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Server running on port ${PORT}`);
});
