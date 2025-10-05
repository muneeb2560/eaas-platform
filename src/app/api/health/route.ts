import { NextRequest, NextResponse } from 'next/server';

// Health check dependencies
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  checks: {
    database?: 'pass' | 'fail';
    memory?: 'pass' | 'fail' | 'warn';
    disk?: 'pass' | 'fail' | 'warn';
    dependencies?: 'pass' | 'fail';
  };
  details?: Record<string, unknown>;
}

// Memory usage check
function checkMemoryUsage(): { status: 'pass' | 'fail' | 'warn'; details: Record<string, unknown> } {
  try {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usage_percent = (usedMB / totalMB) * 100;
    
    return {
      status: usage_percent > 90 ? 'fail' : usage_percent > 75 ? 'warn' : 'pass',
      details: {
        heapUsed: `${usedMB}MB`,
        heapTotal: `${totalMB}MB`,
        usage_percent: `${usage_percent.toFixed(1)}%`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`
      }
    };
  } catch (error) {
    return { status: 'fail', details: { error: 'Memory check failed' } };
  }
}

// Basic dependency check
function checkDependencies(): { status: 'pass' | 'fail'; details: Record<string, unknown> } {
  try {
    // Check if essential modules are available
    const essentialModules = ['next', 'react', 'react-dom'];
    const moduleStatus: Record<string, boolean> = {};
    
    for (const moduleName of essentialModules) {
      try {
        require.resolve(moduleName);
        moduleStatus[moduleName] = true;
      } catch {
        moduleStatus[moduleName] = false;
      }
    }
    
    const allPassed = Object.values(moduleStatus).every(status => status);
    
    return {
      status: allPassed ? 'pass' : 'fail',
      details: { modules: moduleStatus }
    };
  } catch (error) {
    return { status: 'fail', details: { error: 'Dependency check failed' } };
  }
}

// Process uptime in seconds
function getUptime(): number {
  return Math.floor(process.uptime());
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Perform health checks
    const memoryCheck = checkMemoryUsage();
    const dependencyCheck = checkDependencies();
    const uptime = getUptime();
    
    // Determine overall status
    const hasFailures = memoryCheck.status === 'fail' || dependencyCheck.status === 'fail';
    const hasWarnings = memoryCheck.status === 'warn';
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (hasFailures) {
      overallStatus = 'unhealthy';
    } else if (hasWarnings) {
      overallStatus = 'degraded';
    }
    
    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: 'eaas-platform',
      version: process.env.APP_VERSION || '1.0.0',
      uptime,
      checks: {
        memory: memoryCheck.status,
        dependencies: dependencyCheck.status
      },
      details: {
        memory: memoryCheck.details,
        dependencies: dependencyCheck.details,
        responseTime: `${Date.now() - startTime}ms`,
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'unknown'
      }
    };
    
    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Health-Check': overallStatus
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'eaas-platform',
      version: process.env.APP_VERSION || '1.0.0',
      uptime: getUptime(),
      checks: {},
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: `${Date.now() - startTime}ms`
      }
    };
    
    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// Liveness probe - simple check that service is running
export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Health-Check': 'alive'
      }
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

// Readiness probe - detailed check that service can handle requests
export async function POST(request: NextRequest) {
  try {
    const memoryCheck = checkMemoryUsage();
    const dependencyCheck = checkDependencies();
    
    const isReady = memoryCheck.status !== 'fail' && dependencyCheck.status !== 'fail';
    
    return NextResponse.json(
      {
        ready: isReady,
        timestamp: new Date().toISOString(),
        checks: {
          memory: memoryCheck.status,
          dependencies: dependencyCheck.status
        }
      },
      { status: isReady ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        ready: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}