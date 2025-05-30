const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use('/audio', express.static('public/audio'));

app.get('/', (req, res) => {
  res.send('Your Music Server is Running! 🎵');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Music server running on port ${PORT}`);
});
