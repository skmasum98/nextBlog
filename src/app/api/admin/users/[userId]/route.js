import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

export async function PUT(request, { params }) {
  const { userId } = params;

  // 1. Authenticate and verify the user is an admin
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  // Prevent admin from suspending themselves
  if (session.id === userId) {
      return NextResponse.json({ error: "Admins cannot suspend their own account." }, { status: 400 });
  }

  try {
    const { isSuspended } = await request.json(); // Expecting { "isSuspended": true/false }

    await dbConnect();
    
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isSuspended },
        { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
        message: `User has been ${isSuspended ? 'suspended' : 'unsuspended'}.`,
        user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('Toggle suspend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}