import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session'; // Use our new admin session helper

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    await dbConnect();

    // Fetch all users, excluding their passwords, sorted by creation date
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Fetch all posts, populating the author's name
    const posts = await Post.find({})
      .populate({
        path: 'author',
        select: 'name',
        model: User
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ users, posts }, { status: 200 });

  } catch (error) {
    console.error('Admin data fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}