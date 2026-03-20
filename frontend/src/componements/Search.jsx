import React, { useState } from 'react';
import { searchByHashtag, searchByDescription } from '../api';
import PostCard from './PostCard';

const Search = ({ user, onOpenProfile }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('hashtag'); // 'hashtag' or 'description'
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    let res;
    if (type === 'hashtag') {
      res = await searchByHashtag(query.replace(/^#/, ''));
    } else {
      res = await searchByDescription(query);
    }
    setResults(res.data);
    setSearched(true);
  };

  return (
    <div className="search">
      <div className="search-bar">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher..." />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="hashtag">Hashtag</option>
          <option value="description">Description</option>
        </select>
        <button onClick={handleSearch}>Rechercher</button>
      </div>
      {searched && (
        <div className="search-results">
          {results.length === 0 ? <p>Aucun résultat.</p> : results.map(post => (
            <PostCard key={post.id} post={post} currentUser={user} onLike={() => {}} onReport={() => {}} onOpenProfile={onOpenProfile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;