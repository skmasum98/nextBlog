import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and if they are suspended
    if (user && user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account has been suspended by an administrator.' },
        { status: 403 } // 403 Forbidden
      );
    }

    if (!user) {
      // Use a generic error message for security
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 } // 401 Unauthorized
      );
    }

    // 2. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Same generic error message
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 3. If credentials are correct, create a JWT
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d', // The token will expire in 30 days
    });

    // 4. Serialize the cookie to be sent in the response header
    const serializedCookie = serialize('token', token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      maxAge: MAX_AGE,
      sameSite: 'strict', // Helps prevent CSRF attacks
      path: '/',
    });

    // 5. Send a success response with the cookie in the headers
    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.headers.set('Set-Cookie', serializedCookie);

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}