import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    await dbConnect();

    // Use a case-insensitive regular expression for the search
    const posts = await Post.find({
      title: { $regex: query, $options: 'i' },
    })
    .populate({
        path: 'author',
        select: 'name',
        model: User
    })
    .sort({ createdAt: -1 });

    return NextResponse.json({ posts }, { status: 200 });

  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}