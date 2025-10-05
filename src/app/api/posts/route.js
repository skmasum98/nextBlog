import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';
import User from '@/models/User';
import Category from '@/models/Category'; // --- NEW: Import Category model ---

// GET /api/posts - Fetch all posts (UPDATED)
export async function GET() {
  try {
    await dbConnect();

    const posts = await Post.find({})
      .populate({ path: 'author', select: 'name', model: User })
      // --- NEW: Populate category as well ---
      .populate({ path: 'category', select: 'name slug', model: Category })
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

// POST /api/posts - Create a new post (UPDATED)

export async function POST(request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();

    // --- NEW: Destructure 'category' from the body ---
    const { title, content, coverImage, category } = await request.json();

    // --- NEW: Add category to validation ---
    if (!title || !title.trim() || !content || content === '<p></p>' || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // --- NEW: Add category to the create object ---
    const newPost = await Post.create({
      title: title.trim(),
      content,
      author: session.id,
      coverImage: coverImage || '',
      category, // Add category here
    });

    // Populate for the response
    await newPost.populate([
        { path: 'author', select: 'name', model: User },
        { path: 'category', select: 'name slug', model: Category }
    ]);
    
    return NextResponse.json(
      { message: 'Post created successfully', post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Post Creation Error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors }, 
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}