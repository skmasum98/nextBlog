import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request, { params }) {
  const { slug  } = params;
  
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

    // 2. Get the reaction type from the request body
    const { reactionType } = await request.json(); // "like" or "dislike"
    if (!['like', 'dislike'].includes(reactionType)) {
        return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    await dbConnect();
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 3. Update likes and dislikes arrays
    const hasLiked = post.likes.includes(userId);
    const hasDisliked = post.dislikes.includes(userId);

    if (reactionType === 'like') {
      if (hasLiked) {
        // User wants to remove their like
        post.likes.pull(userId);
      } else {
        // User wants to add a like
        post.likes.push(userId);
        if (hasDisliked) {
          // If they disliked it before, remove the dislike
          post.dislikes.pull(userId);
        }
      }
    } else if (reactionType === 'dislike') {
      if (hasDisliked) {
        // User wants to remove their dislike
        post.dislikes.pull(userId);
      } else {
        // User wants to add a dislike
        post.dislikes.push(userId);
        if (hasLiked) {
          // If they liked it before, remove the like
          post.likes.pull(userId);
        }
      }
    }

    await post.save();

    // 4. Return the updated counts
    return NextResponse.json({
      likes: post.likes.length,
      dislikes: post.dislikes.length,
    }, { status: 200 });

  } catch (error) {
    console.error('React to Post Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}