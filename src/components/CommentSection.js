"use client";

import { useState, useEffect, useCallback } from 'react';

export default function CommentSection({ postId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');

      setComments((prev) => [...prev, data.comment]);
      setNewComment('');
    } catch (err) {
      setError(err?.message || 'Unknown error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete comment');
      }
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      alert('Comment deleted successfully.');
    } catch (err) {
      alert(`Error: ${err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment... (You must be logged in)"
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {isLoading && <p>Loading comments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && comments.length === 0 && <p>No comments yet. Be the first!</p>}

        {comments.map((comment) => (
          <div key={comment._id} className="border-b pb-4">
            <p className="font-semibold">{comment.author ? comment.author.name : 'User'}</p>
            <p className="text-gray-500 text-xs mb-2">{new Date(comment.createdAt).toLocaleString()}</p>
            <p className="text-gray-800">{comment.content}</p>
            {isAdmin && (
              <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500 hover:text-red-700 text-sm mt-2">
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}