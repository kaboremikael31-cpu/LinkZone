const express = require('express');
const router = express.Router();
const db = require('../database');

// Auto-create user on first visit
router.post('/init', (req, res) => {
  const { username } = req.body;
  if (!username) {
    // Generate random username
    const randomNum = Math.floor(Math.random() * 10000);
    const newUsername = `user${randomNum}`;
    const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
    const info = stmt.run(newUsername);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    return res.json({ user });
  } else {
    // Check if username exists
    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
      const info = stmt.run(username);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    }
    res.json({ user });
  }
});

// Get user by ID
router.get('/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // Get followers count
  const followers = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followed_id = ?').get(user.id).count;
  const following = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id).count;
  res.json({ ...user, followers, following });
});

module.exports = router;