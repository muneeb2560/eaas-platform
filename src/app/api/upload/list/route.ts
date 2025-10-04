import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Check if we're in development mode with placeholder credentials
const isDevelopmentMode = 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(_request: NextRequest) {
  try {
    console.log('📂 List uploads API called - Development mode:', isDevelopmentMode);
    
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

    if (isDevelopmentMode) {
      // Development mode - list files from local directory
      const uploadsDir = join(process.cwd(), 'uploads', userId);
      
      if (!existsSync(uploadsDir)) {
        return NextResponse.json({
          success: true,
          files: [],
          message: 'No uploads directory found',
        });
      }
      
      const files = await readdir(uploadsDir);
      const fileList = await Promise.all(
        files.map(async (fileName) => {
          const filePath = join(uploadsDir, fileName);
          const stats = await stat(filePath);
          
          // Extract timestamp from filename (assuming format: timestamp-filename)
          const timestampMatch = fileName.match(/^(\d+)-(.+)$/);
          const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : stats.birthtimeMs;
          const originalName = timestampMatch ? timestampMatch[2] : fileName;
          
          return {
            id: `${userId}/${fileName}`,
            name: originalName,
            originalName: fileName,
            size: stats.size,
            url: `/uploads/${userId}/${fileName}`,
            uploadedAt: new Date(timestamp).toISOString(),
            type: fileName.split('.').pop()?.toLowerCase() || 'unknown',
          };
        })
      );
      
      // Sort by upload date (newest first)
      fileList.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      
      return NextResponse.json({
        success: true,
        files: fileList,
        developmentMode: true,
      });
    } else {
      // Production mode - list files from Supabase Storage
      const supabase = await createServerClient();
      
      const { data, error } = await supabase.storage
        .from('datasets')
        .list(userId, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Storage list error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to list files' },
          { status: 500 }
        );
      }

      const fileList = data.map((file: { name: string; created_at: string; metadata?: { size?: number } }) => ({
        id: `${userId}/${file.name}`,
        name: file.name.replace(/^\d+-/, ''), // Remove timestamp prefix
        originalName: file.name,
        size: file.metadata?.size || 0,
        url: supabase.storage.from('datasets').getPublicUrl(`${userId}/${file.name}`).data.publicUrl,
        uploadedAt: file.created_at,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      }));

      return NextResponse.json({
        success: true,
        files: fileList,
        developmentMode: false,
      });
    }

  } catch (error) {
    console.error('List uploads error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}