require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

// static for local images (corkboard, sticky textures, etc.)
app.use('/images', express.static('images'));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

app.get('/', (req, res) => {
  res.send('Corkboard API working');
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
