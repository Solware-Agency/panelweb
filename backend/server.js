// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const chatRoutes = require('./routes/chat');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // URL de tu Vite dev server
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});