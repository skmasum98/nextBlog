"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserMenu({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout');
        setIsOpen(false);
        router.push('/'); // Go to homepage
        router.refresh(); // Refresh the page to update the header
    };

    return (
        <div className="relative">
            {/* User name button that toggles the dropdown */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="font-semibold hover:text-indigo-600"
            >
                Hello, {user.email.split('@')[0]}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Dashboard
                    </Link>
                    {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Admin Panel
                        </Link>
                    )}
                    <button 
                        onClick={handleLogout} 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}