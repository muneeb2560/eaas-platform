# EaaS Platform Deployment Guide

## Overview
This guide covers deploying the EaaS Platform from development to production, with proper authentication configuration.

## Authentication Modes

### Development Mode (Current)
- **Detection**: `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
- **Features**:
  - Mock authentication (any email/password works)
  - Local file storage for uploads
  - Simulated Google OAuth
  - Data stored in localStorage

### Production Mode
- **Detection**: Real Supabase URL and credentials
- **Features**:
  - Real Supabase authentication
  - Database persistence
  - Real Google OAuth integration
  - Cloud file storage

## Setup for Production

### 1. Supabase Configuration

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Database Setup**:
   ```sql
   -- Run the migration file
   -- supabase/migrations/20241004000001_initial_schema.sql
   ```

3. **Authentication Providers**:
   ```sql
   -- Enable Google OAuth in Supabase Dashboard
   -- Auth > Providers > Google
   -- Add your Google OAuth credentials
   ```

### 2. Environment Configuration

1. **Copy Production Template**:
   ```bash
   cp .env.production.example .env.local
   ```

2. **Update Environment Variables**:
   ```env
   # Replace with your actual Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   
   # Update site URL for production
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

### 3. Google OAuth Setup

1. **Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create/select project
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure Redirect URIs**:
   ```
   Development: http://localhost:3002/auth/callback
   Production: https://your-domain.com/auth/callback
   ```

3. **Update Supabase**:
   - Add Google OAuth credentials to Supabase Auth settings
   - Set redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

### 4. Deployment Options

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

#### Option B: Docker
```bash
# Build Docker image
docker build -t eaas-platform .

# Run with environment variables
docker run -p 3000:3000 --env-file .env.local eaas-platform
```

#### Option C: Traditional Hosting
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Post-Deployment Checklist

### Authentication Testing
- [ ] Email/password sign up
- [ ] Email verification (if enabled)
- [ ] Email/password sign in
- [ ] Google OAuth sign in
- [ ] Dashboard redirection after login
- [ ] User email display in sidebar
- [ ] Sign out functionality

### File Upload Testing
- [ ] CSV file upload
- [ ] File storage in Supabase Storage
- [ ] File listing in Recent Uploads
- [ ] File download functionality
- [ ] File deletion

### General Functionality
- [ ] All navigation links work
- [ ] Protected routes redirect to login
- [ ] Public routes accessible
- [ ] Mobile responsiveness
- [ ] Error handling

## Monitoring & Maintenance

### Logs
- **Development**: Browser console + terminal
- **Production**: Vercel logs / server logs
- **Supabase**: Dashboard > Logs

### Performance
- Monitor Core Web Vitals
- Database query performance
- File upload speeds

### Security
- Regularly update dependencies
- Monitor Supabase security alerts
- Review authentication logs

## Troubleshooting

### Common Issues

1. **"Unauthorized" Upload Errors**:
   - Check Supabase credentials
   - Verify user authentication
   - Check storage bucket permissions

2. **Google OAuth Not Working**:
   - Verify redirect URIs match exactly
   - Check Google Cloud Console settings
   - Ensure Supabase Google provider is enabled

3. **Dashboard Not Loading**:
   - Check authentication state
   - Verify protected route middleware
   - Check for JavaScript errors

4. **Database Connection Issues**:
   - Verify Supabase URL and keys
   - Check network connectivity
   - Review Supabase project status

## Support

For issues specific to:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)

## Development vs Production Comparison

| Feature | Development | Production |
|---------|------------|------------|
| Authentication | Mock/Simulated | Real Supabase |
| Database | localStorage | Supabase Database |
| File Storage | Local filesystem | Supabase Storage |
| Google OAuth | Simulated alert | Real OAuth flow |
| Email Verification | Mock API | Real email service |
| Error Handling | Console logs | Production logging |
| Performance | Development optimizations | Production optimizations |

The application automatically detects the environment based on the `NEXT_PUBLIC_SUPABASE_URL` value and switches behavior accordingly.