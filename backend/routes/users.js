const express = require('express');
const router = express.Router();
const db = require('../database');
const { updateUserCoins } = require('../utils/coins');

// Get user profile with stats
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, username, avatar, coins, certified FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const followers = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followed_id = ?').get(user.id).count;
  const following = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id).count;
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(user.id).count;
  const totalLikes = db.prepare('SELECT SUM(likes_count) as total FROM posts WHERE user_id = ?').get(user.id).total || 0;
  
  // Update certified status based on followers
  const certified = followers >= 500;
  if (certified !== user.certified) {
    db.prepare('UPDATE users SET certified = ? WHERE id = ?').run(certified ? 1 : 0, user.id);
    user.certified = certified;
  }
  
  // Update coins based on total likes
  updateUserCoins(user.id);
  const updatedUser = db.prepare('SELECT coins FROM users WHERE id = ?').get(user.id);
  user.coins = updatedUser.coins;
  
  res.json({ ...user, followers, following, postsCount, totalLikes });
});

// Get posts by user
router.get('/:id/posts', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.certified,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
           (SELECT COUNT(*) FROM favorites WHERE post_id = p.id) as favorites_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.params.id);
  res.json(posts);
});

// Follow/unfollow
router.post('/follow', (req, res) => {
  const { followerId, followedId } = req.body;
  if (followerId === followedId) return res.status(400).json({ error: 'Cannot follow yourself' });
  const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?').get(followerId, followedId);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?').run(followerId, followedId);
    return res.json({ following: false });
  } else {
    db.prepare('INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)').run(followerId, followedId);
    return res.json({ following: true });
  }
});

// Check if following
router.get('/follow/:followerId/:followedId', (req, res) => {
  const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?').get(req.params.followerId, req.params.followedId);
  res.json({ following: !!existing });
});

// Search by hashtag
router.get('/search/hashtag/:tag', (req, res) => {
  const tag = req.params.tag.toLowerCase();
  const posts = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.certified,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
           (SELECT COUNT(*) FROM favorites WHERE post_id = p.id) as favorites_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.hashtags LIKE ?
    ORDER BY p.created_at DESC
  `).all(`%${tag}%`);
  res.json(posts);
});

// Search by description
router.get('/search/description/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  const posts = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.certified,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
           (SELECT COUNT(*) FROM favorites WHERE post_id = p.id) as favorites_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.description LIKE ?
    ORDER BY p.created_at DESC
  `).all(query);
  res.json(posts);
});

// Get feed from followed users
router.get('/:id/following-feed', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.username, u.avatar, u.certified,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
           (SELECT COUNT(*) FROM favorites WHERE post_id = p.id) as favorites_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE u.id IN (SELECT followed_id FROM follows WHERE follower_id = ?)
    ORDER BY p.created_at DESC
  `).all(req.params.id);
  res.json(posts);
});

module.exports = router;