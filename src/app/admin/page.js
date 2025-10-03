"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [data, setData] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // প্রথমবার load করার সময় data ফেচ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch admin data");
        }
        const adminData = await res.json();
        setData(adminData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Post Delete
  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      // লোকালি posts থেকে সরিয়ে দাও
      setData((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p._id !== postId),
      }));

      alert("Post deleted successfully.");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ✅ Toggle Suspend
  const handleToggleSuspend = async (user) => {
    const action = user.isSuspended ? "unsuspend" : "suspend";
    if (!confirm(`Are you sure you want to ${action} the user "${user.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !user.isSuspended }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${action} user`);
      }

      // লোকালি user আপডেট করো
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u._id === user._id ? { ...u, isSuspended: !u.isSuspended } : u
        ),
      }));

      alert(`User ${action}ed successfully.`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading)
    return <div className="text-center py-10">Loading admin dashboard...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">Error: {error}</div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            All Users ({data.users.length})
          </h2>
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
          <h2 className="text-2xl font-semibold mb-4">
            All Posts ({data.posts.length})
          </h2>
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
