// This is a Client Component
"use client";

import { useState, useEffect } from 'react';

export default function LikeDislike({ post, userId }) {
  // State to hold the counts and the user's current reaction
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes.length);
  const [userReaction, setUserReaction] = useState(null);

  // Determine the user's initial reaction when the component loads
  useEffect(() => {
    if (userId) {
      if (post.likes.includes(userId)) {
        setUserReaction('like');
      } else if (post.dislikes.includes(userId)) {
        setUserReaction('dislike');
      }
    }
  }, [userId, post.likes, post.dislikes]);

  const handleReaction = async (reactionType) => {
    // If the user is not logged in, do nothing.
    // We could also redirect them to the login page.
    if (!userId) {
        alert('Please log in to react to posts.');
        return;
    }

    try {
      const res = await fetch(`/api/posts/${post._id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit reaction');
      }
      
      const data = await res.json();
      
      // Update the state with the new counts from the server
      setLikeCount(data.likes);
      setDislikeCount(data.dislikes);

      // Update the user's reaction state for UI feedback
      if (reactionType === 'like') {
        setUserReaction(userReaction === 'like' ? null : 'like');
      } else if (reactionType === 'dislike') {
        setUserReaction(userReaction === 'dislike' ? null : 'dislike');
      }

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center space-x-1 p-2 rounded-md transition-colors ${
          userReaction === 'like' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <span>👍</span>
        <span>{likeCount}</span>
      </button>
      <button
        onClick={() => handleReaction('dislike')}
        className={`flex items-center space-x-1 p-2 rounded-md transition-colors ${
          userReaction === 'dislike' 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <span>👎</span>
        <span>{dislikeCount}</span>
      </button>
    </div>
  );
}