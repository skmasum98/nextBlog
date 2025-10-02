import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// GET handler to fetch comments for a post
export async function GET(request, { params }) {
  const { postId } = params;

  try {
    await dbConnect();

    const comments = await Comment.find({ post: postId })
      .populate({
        path: 'author',
        select: 'name',
        model: User,
      })
      .sort({ createdAt: 'asc' }); // Show oldest comments first

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Fetch Comments Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

// POST handler to create a new comment
export async function POST(request, { params }) {
  const { postId } = params;

  try {
  // 1. Authenticate the user
  const c = await cookies();
  const tokenCookie = c.get('token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
      payload = verifiedPayload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    // 2. Get comment content
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }
    
    await dbConnect();

    // 3. Create and save the new comment
    const newComment = await Comment.create({
      content,
      author: userId,
      post: postId,
    });
    
    // We need to populate the author info to send back to the client immediately
    const populatedComment = await Comment.findById(newComment._id).populate({
        path: 'author',
        select: 'name',
        model: User
    });


    return NextResponse.json({ comment: populatedComment }, { status: 201 });

  } catch (error) {
    console.error('Create Comment Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
