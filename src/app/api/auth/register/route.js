import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Connect to the database
    await dbConnect();

    // 2. Parse the request body to get user data
    const { name, email, password } = await request.json();

    // 3. Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // 4. Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 } // 409 Conflict
      );
    }

    // 5. Create the new user
    // The password will be hashed automatically by the 'pre-save' middleware in the User model
    const newUser = await User.create({
      name,
      email,
      password,
    });

    // 6. Send a success response
    return NextResponse.json(
      { message: 'User created successfully', userId: newUser._id },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error('Registration Error:', error);
    // Handle potential Mongoose validation errors
    if (error.name === 'ValidationError') {
        let errors = {};
        for (let field in error.errors) {
            errors[field] = error.errors[field].message;
        }
        return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}