import { NextRequest, NextResponse } from 'next/server';

/**
 * Ultra-simple health check that always returns 200
 * Use this for critical Railway deployment issues
 * Rename this file to route.ts to activate
 */

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'eaas-platform',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor(process.uptime()),
    mode: 'simple',
    environment: process.env.NODE_ENV || 'unknown'
  };
  
  return NextResponse.json(healthCheck, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Health-Check': 'simple'
    }
  });
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ ready: true, timestamp: new Date().toISOString() }, { status: 200 });
}