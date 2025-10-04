import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/emailService';
import { verificationService } from '@/lib/email/verificationService';
import { createVerificationEmailTemplate } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const { email, userId, userName } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = verificationService.generateVerificationToken(email, userId);
    const verificationUrl = verificationService.createVerificationUrl(token);

    // Create email template
    const { html, text } = createVerificationEmailTemplate({
      userName: userName || email.split('@')[0],
      verificationUrl,
      companyName: 'EaaS Platform'
    });

    // Send email
    let result;
    
    // Check if we're in development mode (no real email credentials)
    const isDevelopmentMode = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com';
    
    if (isDevelopmentMode) {
      // Development mode - log email instead of sending
      result = await emailService.sendEmailDev(
        email,
        'Verify Your Email - EaaS Platform',
        html
      );
      
      // Also log the verification URL for easy testing
      console.log('🔗 Verification URL for testing:', verificationUrl);
    } else {
      // Production mode - send real email
      result = await emailService.sendEmail(
        email,
        'Verify Your Email - EaaS Platform',
        html,
        text
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully',
        messageId: result.messageId,
        ...(isDevelopmentMode && { verificationUrl }) // Include URL in dev mode for testing
      });
    } else {
      throw new Error('error' in result ? result.error : 'Failed to send email');
    }

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}