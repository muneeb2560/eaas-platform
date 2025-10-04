import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Check if we're in development mode with placeholder credentials
const isDevelopmentMode = 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    const params = await context.params;
    console.log('🗑️ Delete file API called - File ID:', params.fileId);
    
    let userId = 'dev-user';
    
    if (!isDevelopmentMode) {
      // Production mode - use Supabase authentication
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
      
      userId = session.user.id;
    }

    // Extract filename from fileId (format: userId/filename)
    const fileIdParts = params.fileId.split('/');
    if (fileIdParts.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid file ID format' },
        { status: 400 }
      );
    }

    const [requestUserId, fileName] = fileIdParts;
    
    // Security check - ensure user can only delete their own files
    if (requestUserId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (isDevelopmentMode) {
      // Development mode - delete from local directory
      const filePath = join(process.cwd(), 'uploads', userId, fileName);
      
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }
      
      await unlink(filePath);
      
      console.log('✅ File deleted locally:', filePath);
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        developmentMode: true,
      });
    } else {
      // Production mode - delete from Supabase Storage
      const supabase = await createServerClient();
      
      const { error } = await supabase.storage
        .from('datasets')
        .remove([`${userId}/${fileName}`]);

      if (error) {
        console.error('Storage delete error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete file' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        developmentMode: false,
      });
    }

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}