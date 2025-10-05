"use client";

import { useState, useEffect } from "react";
import Link from 'next/link'; // Make sure Link is imported

export default function AdminPage() {
  const [data, setData] = useState({ users: [], posts: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Function to fetch all data
  const fetchData = async () => {
    try {
        // Fetch admin data (users, posts) and categories data in parallel
        const [adminRes, catRes] = await Promise.all([
            fetch('/api/admin'),
            fetch('/api/categories')
        ]);

        if (!adminRes.ok) {
            const errorData = await adminRes.json();
            throw new Error(errorData.error || "Failed to fetch admin data");
        }
        if (!catRes.ok) {
            const errorData = await catRes.json();
            throw new Error(errorData.error || "Failed to fetch categories");
        }

        const adminData = await adminRes.json();
        const catData = await catRes.json();
        
        setData({ 
            users: adminData.users, 
            posts: adminData.posts, 
            categories: catData.categories 
        });

    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };
  
  // Fetch data on initial load
  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePost = async (postId) => { /* Your existing function, no changes needed */ };
  const handleToggleSuspend = async (user) => { /* Your existing function, no changes needed */ };

  // --- NEW: Create Category Handler ---
  const handleCreateCategory = async (e) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;

      try {
          const res = await fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newCategoryName }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          
          alert('Category created successfully!');
          setNewCategoryName('');
          fetchData(); // Refresh all data to show the new category
      } catch (err) {
          alert(`Error: ${err.message}`);
      }
  };

  if (isLoading) return <div className="text-center py-10">Loading admin dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* --- UPDATED: 3-column grid layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
            <form onSubmit={handleCreateCategory} className="mb-4">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="w-full px-3 py-2 border rounded-md"
                />
                <button type="submit" className="w-full mt-2 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Add Category</button>
            </form>
            <div className="max-h-60 overflow-y-auto space-y-2">
                <h3 className="font-semibold text-gray-700">Existing Categories: ({data.categories.length})</h3>
                {data.categories.map(cat => (
                    <div key={cat._id} className="bg-gray-100 p-2 rounded-md text-sm">
                        {cat.name}
                    </div>
                ))}
            </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">All Users ({data.users.length})</h2>
          {/* Your existing user table code goes here... */}
          <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isSuspended
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {user.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="py-2">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleToggleSuspend(user)}
                      className={`px-3 py-1 text-sm rounded-md text-white ${
                        user.isSuspended
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      {user.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>

        {/* Posts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">All Posts ({data.posts.length})</h2>
           {/* Your existing post list code goes here... */}
           <div className="max-h-96 overflow-y-auto">
        {data.posts.map((post) => (
          <div key={post._id} className="border-t py-2">
            <p className="font-bold">{post.title}</p>
            <p className="text-sm text-gray-600">
              by {post.author?.name || "Unknown"}
            </p>
            <button
              onClick={() => handleDeletePost(post._id)}
              className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    
        </div>
      </div>
    </div>
  );
}