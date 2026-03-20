import React, { useState, useEffect } from 'react';
import { getFeed, getFollowingFeed, likePost, reportPost, checkLike, getPostComments, commentOnPost, favoritePost, sharePost, followUser, checkFollow } from '../api';
import PostCard from './PostCard';

const Feed = ({ user, onOpenProfile }) => {
  const [posts, setPosts] = useState([]);
  const [mode, setMode] = useState('global'); // 'global' or 'following'

  useEffect(() => {
    const fetchPosts = async () => {
      const res = mode === 'global' ? await getFeed() : await getFollowingFeed(user.id);
      setPosts(res.data);
    };
    fetchPosts();
  }, [mode, user.id]);

  const handleLike = async (postId) => {
    await likePost(user.id, postId);
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p));
  };

  const handleReport = async (postId) => {
    if (window.confirm('Signaler ce post ?')) {
      const res = await reportPost(user.id, postId);
      if (res.data.deleted) {
        setPosts(posts.filter(p => p.id !== postId));
        alert('Post supprimé après 10 signalements.');
      } else {
        alert('Signalement enregistré.');
      }
    }
  };

  return (
    <div className="feed">
      <div className="feed-mode-toggle">
        <button className={mode === 'global' ? 'active' : ''} onClick={() => setMode('global')}>Pour vous</button>
        <button className={mode === 'following' ? 'active' : ''} onClick={() => setMode('following')}>Abonnements</button>
      </div>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={user}
          onLike={handleLike}
          onReport={handleReport}
          onOpenProfile={onOpenProfile}
        />
      ))}
    </div>
  );
};

export default Feed;