import React, { useState } from 'react';
import { createPost } from '../api';

const CreatePost = ({ user, onPostCreated }) => {
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [error, setError] = useState('');

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link) return setError('Un lien est requis.');
    if (!description) return setError('Une description est requise.');
    if (hashtags.length === 0) return setError('Au moins un hashtag est requis.');
    try {
      await createPost({ userId: user.id, link, description, hashtags });
      onPostCreated();
    } catch (err) {
      setError('Erreur lors de la création.');
    }
  };

  return (
    <div className="create-post">
      <h2>Nouveau post</h2>
      <form onSubmit={handleSubmit}>
        <input type="url" placeholder="Lien (URL)" value={link} onChange={e => setLink(e.target.value)} required />
        <textarea placeholder="Description..." value={description} onChange={e => setDescription(e.target.value)} required />
        <div className="hashtag-input">
          <input type="text" placeholder="#hashtag" value={hashtagInput} onChange={e => setHashtagInput(e.target.value)} />
          <button type="button" onClick={addHashtag}>Ajouter</button>
        </div>
        <div className="hashtags-list">
          {hashtags.map(tag => (
            <span key={tag} className="hashtag-tag">#{tag} <button type="button" onClick={() => removeHashtag(tag)}>×</button></span>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Publier</button>
      </form>
    </div>
  );
};

export default CreatePost;