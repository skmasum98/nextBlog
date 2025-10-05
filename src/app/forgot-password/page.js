"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      // We always show a positive message to prevent email enumeration
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        // Even on error, we show a generic positive message for security
        setMessage('✅ If an account with that email exists, a password reset link has been sent.');
      }

    } catch (error) {
      setMessage('❌ An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Your Password?
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            No problem! Enter your email address below and we'll send you a link to reset it.
          </p>
        </div>

        {/* Form */}
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
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

        {/* Link back to Login */}
        <div className="text-sm text-center text-gray-600">
          Remembered your password?{' '}
          <Link href="/login" passHref>
            <div className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer inline-block">
              Sign In
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}