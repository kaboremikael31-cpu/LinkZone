import React, { useState, useEffect } from 'react';
import { getLinkPreview, checkLike, checkFollow, followUser, getPostComments, commentOnPost, favoritePost, sharePost } from '../api';

const PostCard = ({ post, currentUser, onLike, onReport, onOpenProfile }) => {
  const [preview, setPreview] = useState(null);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Fetch link preview
    getLinkPreview(post.link).then(res => setPreview(res.data));
    // Check if liked
    checkLike(currentUser.id, post.id).then(res => setLiked(res.data.liked));
    // Check if following post author
    if (post.user_id !== currentUser.id) {
      checkFollow(currentUser.id, post.user_id).then(res => setFollowing(res.data.following));
    }
    // Fetch comments
    getPostComments(post.id).then(res => setComments(res.data));
  }, [post, currentUser]);

  const handleFollow = async () => {
    await followUser(currentUser.id, post.user_id);
    setFollowing(!following);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const res = await commentOnPost(currentUser.id, post.id, newComment);
    setComments([res.data, ...comments]);
    setNewComment('');
  };

  const handleFavorite = async () => {
    await favoritePost(currentUser.id, post.id);
    // We don't track favorite state in UI for simplicity but could
  };

  const handleShare = async () => {
    await sharePost(post.id);
    alert('Partagé !');
  };

  return (
    <div className="post-card">
      <div className="post-header" onClick={() => onOpenProfile(post.user_id)}>
        <img src={post.avatar || '/default-avatar.png'} alt="avatar" className="avatar" />
        <div className="user-info">
          <span className="username">{post.username}</span>
          {post.certified && <span className="badge">✓</span>}
        </div>
        {post.user_id !== currentUser.id && (
          <button className={`follow-btn ${following ? 'following' : ''}`} onClick={handleFollow}>
            {following ? 'Abonné' : 'Suivre'}
          </button>
        )}
      </div>
      <p className="description">{post.description}</p>
      <div className="hashtags">
        {JSON.parse(post.hashtags).map(tag => (
          <span key={tag} className="hashtag">#{tag}</span>
        ))}
      </div>
      {preview && (
        <div className="link-preview">
          {preview.image && <img src={preview.image} alt="preview" />}
          <div className="preview-info">
            <a href={post.link} target="_blank" rel="noopener noreferrer">{preview.title}</a>
            <p>{preview.description}</p>
            <span>{preview.domain}</span>
          </div>
        </div>
      )}
      <div className="post-actions">
        <button className={`like-btn ${liked ? 'active' : ''}`} onClick={() => onLike(post.id)}>❤️ {post.likes_count}</button>
        <button onClick={() => setShowComments(!showComments)}>💬 {post.comments_count}</button>
        <button onClick={handleFavorite}>⭐ {post.favorites_count}</button>
        <button onClick={handleShare}>🔄 {post.shares_count}</button>
        <button onClick={() => onReport(post.id)}>⚠️ Signaler</button>
      </div>
      {showComments && (
        <div className="comments-section">
          <div className="add-comment">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Ajouter un commentaire..." />
            <button onClick={handleComment}>Envoyer</button>
          </div>
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <img src={comment.avatar || '/default-avatar.png'} alt="avatar" className="comment-avatar" />
              <div className="comment-content">
                <strong>{comment.username}</strong>
                <p>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;