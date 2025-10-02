import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

export async function DELETE(request, { params }) {
  const { commentId } = params;

  // 1. Authenticate and verify the user is an admin
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    await dbConnect();

    // 2. Find and delete the comment
    const commentToDelete = await Comment.findByIdAndDelete(commentId);

    if (!commentToDelete) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete Comment Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}