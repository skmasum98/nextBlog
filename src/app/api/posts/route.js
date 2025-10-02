import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers'; // Import cookies
import User from '@/models/User';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// GET /api/posts - Fetch all posts

export async function GET() {
  try {
    await dbConnect();

    // Find all posts and sort them by creation date (newest first)
    // Then, populate the 'author' field with the 'name' from the User model
    const posts = await Post.find({})
      .populate({
        path: 'author',
        select: 'name', // Only select the 'name' field of the author
        model: User, // Explicitly specify the User model
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}


// POST /api/posts - Create a new post (requires authentication)
export async function POST(request) {
  try {
  // 1. Get the token from the cookie
  const c = await cookies();
  const tokenCookie = c.get('token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const token = tokenCookie.value;

    // 2. Verify the token and get the user's ID from the payload
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id; // The user ID from the JWT

    // 3. Connect to the database
    await dbConnect();

    // 4. Parse the request body
    const { title, content, coverImage } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // 5. Create the new post, linking it to the author
    const newPost = await Post.create({
      title,
      content,
      author: userId, // Associate the post with the logged-in user
      coverImage,
    });

    return NextResponse.json(
      { message: 'Post created successfully', post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Post Creation Error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

