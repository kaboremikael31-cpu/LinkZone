const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./database');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const interactionsRoutes = require('./routes/interactions');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');
const previewRoutes = require('./routes/preview');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/preview', previewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));