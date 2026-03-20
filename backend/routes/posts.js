const express = require('express');
const router = express.Router();
const db = require('../database');
const { updateUserCoins } = require('../utils/coins');

// Create post (must have link, hashtags, description)
router.post('/', (req, res) => {
  const { userId, link, description, hashtags } = req.body;
  if (!userId || !link || !description || !hashtags || !Array.isArray(hashtags) || hashtags.length === 0) {
    return res.status(400).json({ error: 'Missing required fields (link, description, hashtags)' });
  }
  const hashtagsJson = JSON.stringify(hashtags);
  const stmt = db.prepare('INSERT INTO posts (user_id, link, description, hashtags) VALUES (?, ?, ?, ?)');
  const info = stmt.run(userId, link, description, hashtagsJson);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
  res.json(post);
});

// Get feed (recent posts)
router.get('/feed', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.certified,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
           (SELECT COUNT(*) FROM favorites WHERE post_id = p.id) as favorites_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(posts);
});

// Get post by ID
router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.certified,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
           (SELECT COUNT(*) FROM favorites WHERE post_id = p.id) as favorites_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Delete post (by owner or system)
router.delete('/:id', (req, res) => {
  const { userId } = req.body;
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  // Update coins for user
  updateUserCoins(post.user_id);
  res.json({ success: true });
});

// Report a post
router.post('/:id/report', (req, res) => {
  const { userId } = req.body;
  const postId = req.params.id;
  // Check if user already reported
  const existing = db.prepare('SELECT * FROM reports WHERE user_id = ? AND post_id = ?').get(userId, postId);
  if (existing) return res.status(400).json({ error: 'Already reported' });
  db.prepare('INSERT INTO reports (user_id, post_id) VALUES (?, ?)').run(userId, postId);
  
  // Count distinct reports for this post
  const reportCount = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM reports WHERE post_id = ?').get(postId).count;
  if (reportCount >= 10) {
    // Auto-delete post
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    // Update coins for user
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId);
    if (post) updateUserCoins(post.user_id);
    return res.json({ success: true, deleted: true });
  }
  res.json({ success: true });
});

module.exports = router;