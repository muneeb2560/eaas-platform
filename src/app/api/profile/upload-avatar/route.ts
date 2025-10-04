import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Check if we're in development mode with placeholder credentials
const isDevelopmentMode = 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Avatar upload API called - Development mode:', isDevelopmentMode);

    if (isDevelopmentMode) {
      // Development mode - simulate avatar upload
      console.log('🚧 Running in development mode - avatar upload simulated');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: 'Avatar uploaded successfully (development mode)',
        avatarUrl: 'https://via.placeholder.com/128/3b82f6/ffffff?text=DEV',
      });
    }

    // Production mode - use Supabase
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Authentication service error' },
        { status: 500 }
      );
    }
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExtension}`;

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Replace existing avatar
        });

      if (error) {
        console.error('Storage upload error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload avatar' },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        }
      });

      if (updateError) {
        console.error('User update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update user profile' },
          { status: 500 }
        );
      }

      console.log('✅ Avatar uploaded successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl: publicUrl,
      });

    } catch (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to process avatar upload' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Avatar upload endpoint ready' 
  });
}