"use client";

import { useState } from 'react';
import Link from 'next/link';
import UserMenu from './UserMenu'; // Reuse the UserMenu component
import SearchBar from './SearchBar';

export default function MobileMenu({ session }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Hamburger Icon */}
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-md p-4 mt-1">
                    <div className="mb-4">
                        <SearchBar />
                    </div>
                    <div className="flex flex-col space-y-4">
                        <Link href="/posts/create" onClick={() => setIsOpen(false)} className="hover:text-indigo-600">Create Post</Link>
                        {session ? (
                            <>
                                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-indigo-600">My Dashboard</Link>
                                {session.role === 'admin' && (
                                    <Link href="/admin" onClick={() => setIsOpen(false)} className="hover:text-indigo-600">Admin Panel</Link>
                                )}
                                {/* We can create a simpler logout button for mobile if needed */}
                                <button onClick={async () => {
                                    await fetch('/api/auth/logout');
                                    setIsOpen(false);
                                    window.location.href = '/'; // Simple page reload on mobile logout
                                }} className="text-left text-red-500 hover:text-red-700">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-indigo-600">Login</Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}