"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      setMessage('✅ Login successful! Redirecting...');
      // On successful login, refresh the router to update session state across the app
      // and then push to the dashboard.
      
      router.push('/dashboard');
      router.refresh(); 
      
    } catch (error) {
      setMessage(`❌ ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to BlogPlatform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Password Input with Forgot Password Link */}
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              {/* --- THIS IS THE NEW LINK --- */}
              <Link href="/forgot-password" passHref>
                <div className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer">
                  Forgot password?
                </div>
              </Link>
              {/* --- END NEW LINK --- */}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <p className={`text-center text-sm font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}>
            {message}
          </p>
        )}

        {/* Link to Register Page */}
        <div className="text-sm text-center text-gray-600">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" passHref>
            <div className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer inline-block">
              Sign up
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}