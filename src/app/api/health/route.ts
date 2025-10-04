import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple health check for Railway
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'eaas-platform'
    };

    return NextResponse.json(healthCheck, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  // For simple health checks that just need HTTP status
  return new NextResponse(null, { status: 200 });
}