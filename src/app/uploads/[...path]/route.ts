import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Only serve files in development mode
    const isDevelopmentMode = 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key_for_development' ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!isDevelopmentMode) {
      return NextResponse.json(
        { error: 'File serving only available in development mode' },
        { status: 404 }
      );
    }

    const filePath = join(process.cwd(), 'uploads', ...params.path);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);
    const fileName = params.path[params.path.length - 1];
    
    // Determine content type based on file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'csv') {
      contentType = 'text/csv';
    } else if (ext === 'json') {
      contentType = 'application/json';
    } else if (ext === 'txt') {
      contentType = 'text/plain';
    }

    return new NextResponse(Buffer.from(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}