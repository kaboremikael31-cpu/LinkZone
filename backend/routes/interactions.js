const express = require('express');
const router = express.Router();
const db = require('../database');
const { updateUserCoins } = require('../utils/coins');

// Like post
router.post('/like', (req, res) => {
  const { userId, postId } = req.body;
  const existing = db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
    // Decrement likes_count on post
    db.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?').run(postId);
    // Update coins for post owner
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
    if (post) updateUserCoins(post.user_id);
    return res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
    db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
    if (post) updateUserCoins(post.user_id);
    return res.json({ liked: true });
  }
});

// Check if liked
router.get('/like/:userId/:postId', (req, res) => {
  const existing = db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?').get(req.params.userId, req.params.postId);
  res.json({ liked: !!existing });
});

// Comment on post
router.post('/comment', (req, res) => {
  const { userId, postId, content } = req.body;
  if (!content.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
  db.prepare('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)').run(userId, postId, content);
  db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId);
  const comment = db.prepare(`
    SELECT c.*, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = last_insert_rowid()
  `).get();
  res.json(comment);
});

// Get comments for a post
router.get('/comments/:postId', (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
  `).all(req.params.postId);
  res.json(comments);
});

// Favorite post
router.post('/favorite', (req, res) => {
  const { userId, postId } = req.body;
  const existing = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND post_id = ?').get(userId, postId);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND post_id = ?').run(userId, postId);
    db.prepare('UPDATE posts SET favorites_count = favorites_count - 1 WHERE id = ?').run(postId);
    return res.json({ favorited: false });
  } else {
    db.prepare('INSERT INTO favorites (user_id, post_id) VALUES (?, ?)').run(userId, postId);
    db.prepare('UPDATE posts SET favorites_count = favorites_count + 1 WHERE id = ?').run(postId);
    return res.json({ favorited: true });
  }
});

// Share post (increment count)
router.post('/share', (req, res) => {
  const { postId } = req.body;
  db.prepare('UPDATE posts SET shares_count = shares_count + 1 WHERE id = ?').run(postId);
  res.json({ success: true });
});

module.exports = router;