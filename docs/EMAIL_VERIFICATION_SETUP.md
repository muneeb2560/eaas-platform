# Email Verification Setup Guide

This document explains how to set up email verification for the EaaS Platform.

## Current Status

✅ **Development Mode Active**
- Email verification is currently running in development/simulation mode
- Verification emails are logged to the console instead of being sent
- Verification URLs are displayed in the console for testing

## Development Testing

### Testing Email Verification Flow

1. **Sign up for a new account** at `/auth/signup`
2. **Check the server console** for:
   - Email content preview
   - Verification URL for testing
3. **Copy the verification URL** from console and paste it in your browser
4. **Complete the verification** process

### Console Output Example
```
📧 [DEV MODE] Email would be sent:
To: user@example.com
Subject: Verify Your Email - EaaS Platform
Content: Welcome to EaaS Platform! We're excited to have you join...
---
🔗 Verification URL for testing: http://localhost:3001/verify-email?token=...
```

## Production Setup

To enable real email sending in production, follow these steps:

### 1. Google OAuth 2.0 Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Set application type to "Web application"
   - Add authorized redirect URIs (for OAuth playground)

### 2. Get Refresh Token

1. **Visit [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)**
2. **Configure settings**:
   - Click the gear icon (settings)
   - Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
3. **Authorize Gmail API**:
   - In Step 1, select "Gmail API v1" > "https://www.googleapis.com/auth/gmail.send"
   - Click "Authorize APIs"
   - Sign in with your Gmail account
4. **Get refresh token**:
   - In Step 2, click "Exchange authorization code for tokens"
   - Copy the refresh_token

### 3. Update Environment Variables

Update your `.env.local` file with real values:

```bash
# Email Configuration (Gmail OAuth 2.0)
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_CLIENT_ID=your-google-oauth-client-id
EMAIL_CLIENT_SECRET=your-google-oauth-client-secret
EMAIL_REFRESH_TOKEN=your-refresh-token-from-playground
EMAIL_ACCESS_TOKEN=  # Leave empty, will be generated automatically

# JWT Secret for verification tokens
JWT_SECRET=your-super-secure-random-string-min-32-chars
```

### 4. Test Production Mode

1. **Restart your development server**
2. **Sign up with a real email address**
3. **Check your inbox** for the verification email
4. **Click the verification link** in the email

## Email Templates

The system includes two email templates:

### 1. Verification Email
- **Subject**: "Verify Your Email - EaaS Platform"
- **Content**: Welcome message with verification button
- **Expiry**: 24 hours

### 2. Welcome Email
- **Subject**: "Welcome to EaaS Platform! 🎉"
- **Content**: Confirmation of successful verification
- **Sent**: After email verification is complete

## Security Features

- ✅ **JWT-based tokens** with expiration (24 hours)
- ✅ **One-time use tokens** (consumed after verification)
- ✅ **Secure token storage** (in-memory for dev, database for production)
- ✅ **Rate limiting ready** (can be added to API routes)
- ✅ **XSS protection** in email templates

## API Endpoints

### Send Verification Email
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com",
  "userId": "user-123",
  "userName": "User Name"
}
```

### Verify Email Token
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

### Direct Link Verification
```http
GET /api/auth/verify-email?token=verification-token
```

## Troubleshooting

### Common Issues

1. **"Failed to get access token"**
   - Check your OAuth credentials
   - Ensure Gmail API is enabled
   - Verify refresh token is valid

2. **"Invalid or expired verification token"**
   - Tokens expire after 24 hours
   - Each token can only be used once
   - Check console for token generation logs

3. **Email not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check console logs for sending errors

### Development Mode Issues

1. **No verification URL in console**
   - Check that signup process completed successfully
   - Look for error messages in browser console

2. **Verification page shows error**
   - Ensure the token parameter is included in URL
   - Check that server is running on correct port

## File Structure

```
src/
├── lib/
│   └── email/
│       ├── emailService.ts      # Nodemailer configuration
│       ├── templates.ts         # Email HTML templates
│       └── verificationService.ts # Token generation/verification
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── send-verification/
│   │       │   └── route.ts     # Send verification email API
│   │       └── verify-email/
│   │           └── route.ts     # Verify token API
│   └── verify-email/
│       └── page.tsx             # Verification page UI
```

## Next Steps

1. **Set up real Gmail OAuth** for production email sending
2. **Add rate limiting** to prevent email spam
3. **Integrate with database** for persistent token storage
4. **Add email templates** for password reset and other notifications
5. **Implement email preferences** for users

---

*For more help, check the console logs or contact the development team.*