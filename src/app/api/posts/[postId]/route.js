import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import { getAdminSession } from '@/lib/session';
import { getUserSession } from '@/lib/session';

// GET handler to fetch a single post by its ID
export async function GET(request, { params }) {
  const { postId } = params;

  try {
    await dbConnect();

    const post = await Post.findById(postId).populate({
      path: 'author',
      select: 'name',
      model: User,
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Fetch Single Post Error:', error);
    if (error.kind === 'ObjectId') {
        return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

// PUT handler to update a post
export async function PUT(request, { params }) {
    const { postId } = params;
    const session = await getUserSession();
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Ensure the user is the author of the post
        if (post.author.toString() !== session.id) {
            return NextResponse.json({ error: 'Forbidden: You are not the author of this post' }, { status: 403 });
        }

        const { title, content, coverImage } = await request.json();
        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        post.title = title;
        post.content = content;
        post.coverImage = coverImage;
        await post.save();

        return NextResponse.json({ message: 'Post updated successfully', post }, { status: 200 });

    } catch (error) {
        console.error('Update Post Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
 
// DELETE handler to remove a post (Updated logic)
export async function DELETE(request, { params }) {
    const { postId } = params;
    const session = await getUserSession();
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Allow deletion if user is the author OR an admin
        const isAuthor = post.author.toString() === session.id;
        const isAdmin = session.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this post' }, { status: 403 });
        }

        await Post.findByIdAndDelete(postId);
        await Comment.deleteMany({ post: postId });

        return NextResponse.json({ message: 'Post and associated comments deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Delete Post Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}