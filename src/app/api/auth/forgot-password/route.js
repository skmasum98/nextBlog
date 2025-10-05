import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto'; // Built-in Node.js module
import nodemailer from 'nodemailer';

// --- MAIN POST HANDLER ---
export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, we don't reveal if the user exists or not.
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    // 2. Generate a secure, random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3. Set the token and expiry date on the user document (e.g., expires in 10 minutes)
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // 4. Create the reset URL and send the email
    const resetURL = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;
    
    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
      <p>Please click on the following link, or paste it into your browser to complete the process within 10 minutes of receiving it:</p>
      <a href="${resetURL}" target="_blank">Reset Your Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Token (Valid for 10 min)',
        html: message,
      });

      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });

    } catch (error) {
      console.error('Email sending error:', error);
      // If email fails, clear the reset token from the database
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return NextResponse.json({ error: 'There was an error sending the email. Please try again.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- EMAIL SENDING HELPER FUNCTION ---
async function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
}