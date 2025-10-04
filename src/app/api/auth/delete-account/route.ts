import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Check if we're in development mode with placeholder credentials
const isDevelopmentMode = 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Account deletion API called - Development mode:', isDevelopmentMode);

    if (isDevelopmentMode) {
      // Development mode - simulate account deletion
      console.log('🚧 Running in development mode - account deletion simulated');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully (development mode)',
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

    const userId = session.user.id;

    // In production, you would:
    // 1. Delete user data from your tables
    // 2. Delete uploaded files from storage
    // 3. Clean up any associated records
    // 4. Finally delete the auth user

    try {
      // Example: Delete user-related data
      // await supabase.from('experiments').delete().eq('user_id', userId);
      // await supabase.from('evaluation_runs').delete().eq('user_id', userId);
      // await supabase.storage.from('datasets').remove([`${userId}/`]);

      // Delete the auth user (this will cascade delete in most cases)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('Account deletion error:', deleteError);
        return NextResponse.json(
          { success: false, error: 'Failed to delete account' },
          { status: 500 }
        );
      }

      console.log('✅ Account deleted successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully',
      });

    } catch (cleanupError) {
      console.error('Account cleanup error:', cleanupError);
      return NextResponse.json(
        { success: false, error: 'Failed to complete account deletion' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Account deletion endpoint ready' 
  });
}