import React, { useState, useEffect } from 'react';
import { getUserProfile, getUserPosts, followUser, checkFollow } from '../api';
import PostCard from './PostCard';

const Profile = ({ userId, currentUser, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const userRes = await getUserProfile(userId);
      setProfile(userRes.data);
      const postsRes = await getUserPosts(userId);
      setPosts(postsRes.data);
      if (userId !== currentUser.id) {
        const followRes = await checkFollow(currentUser.id, userId);
        setFollowing(followRes.data.following);
      }
    };
    fetchProfile();
  }, [userId, currentUser.id]);

  const handleFollow = async () => {
    await followUser(currentUser.id, userId);
    setFollowing(!following);
    // Update follower count in UI
    setProfile({ ...profile, followers: following ? profile.followers - 1 : profile.followers + 1 });
  };

  if (!profile) return <div>Chargement...</div>;

  return (
    <div className="profile">
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <div className="profile-header">
        <img src={profile.avatar || '/default-avatar.png'} alt="avatar" className="profile-avatar" />
        <div className="profile-info">
          <div className="name-badge">
            <h2>{profile.username}</h2>
            {profile.certified && <span className="badge">✓</span>}
          </div>
          <div className="stats">
            <div><strong>{profile.postsCount}</strong> posts</div>
            <div><strong>{profile.followers}</strong> abonnés</div>
            <div><strong>{profile.following}</strong> abonnements</div>
          </div>
          <div className="coins">🪙 {profile.coins} pièces</div>
          {userId !== currentUser.id && (
            <button className={`follow-btn ${following ? 'following' : ''}`} onClick={handleFollow}>
              {following ? 'Abonné' : 'Suivre'}
            </button>
          )}
        </div>
      </div>
      <div className="profile-posts">
        {posts.map(post => (
          <PostCard key={post.id} post={post} currentUser={currentUser} onLike={() => {}} onReport={() => {}} onOpenProfile={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default Profile;