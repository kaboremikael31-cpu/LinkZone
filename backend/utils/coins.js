const db = require('../database');

function updateUserCoins(userId) {
  // Get total likes from all posts of user
  const totalLikes = db.prepare(`
    SELECT SUM(likes_count) as total FROM posts WHERE user_id = ?
  `).get(userId).total || 0;
  
  // Coins = floor(totalLikes / 20)
  const coins = Math.floor(totalLikes / 20);
  db.prepare('UPDATE users SET coins = ? WHERE id = ?').run(coins, userId);
  return coins;
}

module.exports = { updateUserCoins };