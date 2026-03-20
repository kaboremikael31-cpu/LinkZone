const express = require('express');
const router = express.Router();
const db = require('../database');

// Send private message
router.post('/message', (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!content.trim()) return res.status(400).json({ error: 'Message cannot be empty' });
  const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)');
  const info = stmt.run(senderId, receiverId, content);
  const message = db.prepare(`
    SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `).get(info.lastInsertRowid);
  res.json(message);
});

// Get conversation between two users
router.get('/conversation/:userId1/:userId2', (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY m.created_at ASC
  `).all(req.params.userId1, req.params.userId2, req.params.userId2, req.params.userId1);
  res.json(messages);
});

// Get all conversations for a user (list of users they've chatted with)
router.get('/conversations/:userId', (req, res) => {
  const conversations = db.prepare(`
    SELECT DISTINCT 
      CASE 
        WHEN sender_id = ? THEN receiver_id
        ELSE sender_id
      END as other_user_id
    FROM messages
    WHERE sender_id = ? OR receiver_id = ?
  `).all(req.params.userId, req.params.userId, req.params.userId);
  
  const result = [];
  for (const conv of conversations) {
    const otherUser = db.prepare('SELECT id, username, avatar FROM users WHERE id = ?').get(conv.other_user_id);
    const lastMessage = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at DESC LIMIT 1
    `).get(req.params.userId, conv.other_user_id, conv.other_user_id, req.params.userId);
    result.push({ user: otherUser, lastMessage });
  }
  res.json(result);
});

module.exports = router;