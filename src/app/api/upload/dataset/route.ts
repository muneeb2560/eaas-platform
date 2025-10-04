import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const uploadSchema = z.object({
  // userId is now retrieved from session, not required in form data
});

// Check if we're in development mode with placeholder credentials
const isDevelopmentMode = 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called - Development mode:', isDevelopmentMode);
    
    let userId = 'dev-user';
    
    if (!isDevelopmentMode) {
      // Production mode - use Supabase authentication
      const supabase = createRouteHandlerClient({ cookies });
      
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
    } else {
      console.log('🚀 Running in development mode - bypassing authentication');
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const allowedExtensions = ['.csv', '.json', '.jsonl'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    console.log('📝 File validation - Name:', file.name, 'Type:', file.type, 'Extension:', fileExtension, 'Valid:', isValidType);

    if (!isValidType) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Only CSV and JSON files are allowed. Received: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${userId}/${timestamp}-${file.name}`;

    if (isDevelopmentMode) {
      // Development mode - store files locally
      console.log('💾 Storing file locally in development mode');
      
      const uploadsDir = join(process.cwd(), 'uploads', userId);
      const filePath = join(uploadsDir, `${timestamp}-${file.name}`);
      
      // Ensure directory exists
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      console.log('✅ File saved locally:', filePath);
      
      return NextResponse.json({
        success: true,
        url: `/uploads/${userId}/${timestamp}-${file.name}`,
        id: fileName,
        message: 'File uploaded successfully (development mode)',
        developmentMode: true,
      });
    } else {
      // Production mode - use Supabase Storage
      const supabase = createRouteHandlerClient({ cookies });
      
      const { data, error } = await supabase.storage
        .from('datasets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload file' },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('datasets')
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        id: data.path,
        message: 'File uploaded successfully',
        developmentMode: false,
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Dataset upload endpoint ready' 
  });
}