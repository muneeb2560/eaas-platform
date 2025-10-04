import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Check if we're in development mode with placeholder credentials
const isDevelopmentMode = 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 Profile update API called - Development mode:', isDevelopmentMode);

    if (isDevelopmentMode) {
      // Development mode - simulate profile update
      console.log('🚧 Running in development mode - profile update simulated');
      
      const body = await request.json();
      console.log('Profile update data:', body);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully (development mode)',
        data: body,
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

    const body = await request.json();
    const { displayName, bio, preferences } = body;

    // Update user metadata in Supabase
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: displayName,
        bio: bio,
        preferences: preferences,
      }
    });

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    console.log('✅ Profile updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: data.user,
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Profile update endpoint ready' 
  });
}