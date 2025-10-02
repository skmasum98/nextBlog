"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    
    // State for user data, posts, loading, and form inputs
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    // Fetch user data and posts on component mount
    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/profile');
            if (!res.ok) {
                // If not authenticated, the middleware should have already redirected.
                // This is a fallback.
                router.push("/login");
                return;
            }
            const data = await res.json();
            setUser(data.user);
            setPosts(data.posts);
            setName(data.user.name);
            setPhone(data.user.phone || '');
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout');
        router.push('/login');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');

        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone }),
        });
        
        const data = await res.json();
        if (res.ok) {
            setMessage('Profile updated successfully!');
            setUser(data.user); // Update user state with new data
        } else {
            setMessage(`Error: ${data.error}`);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete post');
            }
            alert('Post deleted successfully!');
            fetchData(); // Refresh the list of posts
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!user) {
        // This can be shown briefly before the redirect happens
        return <div className="text-center py-10">Please log in to view your dashboard.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Update Form */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={user.email} disabled className="mt-1 w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                            <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Update Profile</button>
                    </form>
                    {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
                </div>

                {/* User's Posts */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Your Posts</h2>
                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post._id} className="border p-4 rounded-md">
                                    <Link href={`/posts/${post._id}`}>
                                        <h3 className="text-xl font-bold hover:text-indigo-600">{post.title}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                        Created on {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Link href={`/posts/${post._id}/edit`} className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDeletePost(post._id)} className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>You haven&apos;t created any posts yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}