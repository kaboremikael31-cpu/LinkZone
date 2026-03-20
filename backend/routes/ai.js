const express = require('express');
const router = express.Router();
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const AI_USER_ID = 0; // Special ID for AI

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    const reply = response.data.choices[0].message.content;
    res.json({ reply, aiUser: { id: AI_USER_ID, username: 'AI Assistant', avatar: 'ai.png', certified: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI service error' });
  }
});

module.exports = router;