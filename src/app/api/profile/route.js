import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Post from '@/models/Post'; // We'll need this to fetch user's posts
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session'; // Use our session helper

// GET handler to fetch user profile and their posts
export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Find the user but exclude the password
    const user = await User.findById(session.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all posts by this user
    const posts = await Post.find({ author: session.id }).sort({ createdAt: -1 });

    return NextResponse.json({ user, posts }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update user profile
export async function PUT(request) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, phone } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await dbConnect();
    
    // 1. Find the user document first
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Update the properties on the document
    user.name = name;
    user.phone = phone;

    // 3. Save the updated document
    const updatedUser = await user.save();
    
    // Create a plain object to send back, excluding the password
    const userObject = updatedUser.toObject();
    delete userObject.password;


    return NextResponse.json({ message: 'Profile updated successfully', user: userObject }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}