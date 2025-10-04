import { NextRequest, NextResponse } from 'next/server';
import { verificationService } from '@/lib/email/verificationService';
import { emailService } from '@/lib/email/emailService';
import { createWelcomeEmailTemplate } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenData = verificationService.verifyToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired verification token',
          code: 'TOKEN_INVALID'
        },
        { status: 400 }
      );
    }

    // Mark token as used
    const consumed = verificationService.consumeToken(token);
    
    if (!consumed) {
      return NextResponse.json(
        { 
          error: 'Token has already been used',
          code: 'TOKEN_USED'
        },
        { status: 400 }
      );
    }

    // In a real app, you would update the user's email verification status in the database
    // For development mode, we'll just simulate this
    console.log(`✅ Email verified for user: ${tokenData.email} (ID: ${tokenData.userId})`);

    // Send welcome email
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/signin`;
    const userName = tokenData.email.split('@')[0];
    
    const { html, text } = createWelcomeEmailTemplate({
      userName,
      loginUrl
    });

    // Send welcome email (in development mode, this will be logged)
    const isDevelopmentMode = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com';
    
    if (isDevelopmentMode) {
      await emailService.sendEmailDev(
        tokenData.email,
        'Welcome to EaaS Platform! 🎉',
        html
      );
    } else {
      await emailService.sendEmail(
        tokenData.email,
        'Welcome to EaaS Platform! 🎉',
        html,
        text
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: tokenData.email,
        userId: tokenData.userId,
        verified: true
      }
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for direct URL verification
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/verify-email?error=missing_token`
      );
    }

    // Use the same verification logic as POST
    const tokenData = verificationService.verifyToken(token);
    
    if (!tokenData) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/verify-email?error=invalid_token`
      );
    }

    // Mark token as used
    verificationService.consumeToken(token);

    console.log(`✅ Email verified via GET for user: ${tokenData.email} (ID: ${tokenData.userId})`);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/verify-email?success=true&email=${encodeURIComponent(tokenData.email)}`
    );

  } catch (error) {
    console.error('Error verifying email via GET:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/verify-email?error=server_error`
    );
  }
}