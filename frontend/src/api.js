import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Interceptor to attach userId from localStorage
API.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) config.headers['X-User-Id'] = userId;
  return config;
});

export const initUser = async (username) => {
  const res = await API.post('/auth/init', { username });
  localStorage.setItem('userId', res.data.user.id);
  return res.data.user;
};

export const getFeed = () => API.get('/posts/feed');
export const createPost = (data) => API.post('/posts', data);
export const likePost = (userId, postId) => API.post('/interactions/like', { userId, postId });
export const commentOnPost = (userId, postId, content) => API.post('/interactions/comment', { userId, postId, content });
export const favoritePost = (userId, postId) => API.post('/interactions/favorite', { userId, postId });
export const sharePost = (postId) => API.post('/interactions/share', { postId });
export const reportPost = (userId, postId) => API.post(`/posts/${postId}/report`, { userId });
export const followUser = (followerId, followedId) => API.post('/users/follow', { followerId, followedId });
export const getFollowingFeed = (userId) => API.get(`/users/${userId}/following-feed`);
export const getUserProfile = (userId) => API.get(`/users/${userId}`);
export const getUserPosts = (userId) => API.get(`/users/${userId}/posts`);
export const searchByHashtag = (tag) => API.get(`/users/search/hashtag/${tag}`);
export const searchByDescription = (query) => API.get(`/users/search/description/${query}`);
export const sendMessage = (senderId, receiverId, content) => API.post('/chat/message', { senderId, receiverId, content });
export const getConversation = (user1, user2) => API.get(`/chat/conversation/${user1}/${user2}`);
export const getConversationsList = (userId) => API.get(`/chat/conversations/${userId}`);
export const aiChat = (message) => API.post('/ai/chat', { message });
export const getLinkPreview = (url) => API.post('/preview', { url });
export const checkFollow = (followerId, followedId) => API.get(`/users/follow/${followerId}/${followedId}`);
export const checkLike = (userId, postId) => API.get(`/interactions/like/${userId}/${postId}`);
export const getPostComments = (postId) => API.get(`/interactions/comments/${postId}`);