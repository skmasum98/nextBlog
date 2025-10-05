import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await dbConnect();
    const { token, password, confirmPassword } = await request.json();

    // 1. Validate input
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }
    if (!token) {
        return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 });
    }
    
    // 2. Hash the incoming token to match the one stored in the DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 3. Find the user by the hashed token AND check if it's expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check that the expiry date is greater than the current time
    });

    // 4. If no user is found or token is expired, send an error
    if (!user) {
      return NextResponse.json({ error: 'Password reset token is invalid or has expired.' }, { status: 400 });
    }

    // 5. If token is valid, update the password and clear the reset fields
    user.password = password; // The 'pre-save' hook in your User model will automatically hash this
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Note: We are NOT logging the user in automatically here. 
    // They will be redirected to the login page to sign in with their new password.
    // This is a common and secure practice.

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}