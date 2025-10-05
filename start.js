#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Production start script that tries Next.js CLI first, 
 * then falls back to standalone server if available
 * Includes health check validation and graceful shutdown
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const HEALTH_CHECK_DELAY = 5000; // Wait 5 seconds before health check
const HEALTH_CHECK_TIMEOUT = 10000; // 10 second timeout

console.log('🚀 Starting production server...');
console.log(`📍 Port: ${PORT}, Host: ${HOSTNAME}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'unknown'}`);

let serverProcess = null;

// Health check function
function performHealthCheck() {
  return new Promise((resolve, reject) => {
    const healthUrl = `http://${HOSTNAME === '0.0.0.0' ? 'localhost' : HOSTNAME}:${PORT}/api/health`;
    
    console.log(`🏥 Performing health check: ${healthUrl}`);
    
    const request = http.get(healthUrl, { timeout: HEALTH_CHECK_TIMEOUT }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          console.log('✅ Health check passed');
          try {
            const healthData = JSON.parse(data);
            console.log(`📊 Status: ${healthData.status}, Service: ${healthData.service}`);
          } catch {
            console.log('📊 Health check returned non-JSON response');
          }
          resolve(true);
        } else {
          reject(new Error(`Health check failed with status ${response.statusCode}`));
        }
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Health check timed out'));
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

// Delayed health check with retries
async function validateServerHealth(retries = 3) {
  console.log(`⏳ Waiting ${HEALTH_CHECK_DELAY}ms before health check...`);
  await new Promise(resolve => setTimeout(resolve, HEALTH_CHECK_DELAY));
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await performHealthCheck();
      console.log('🎉 Server is healthy and ready!');
      return true;
    } catch (error) {
      console.error(`❌ Health check attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt < retries) {
        console.log('⏳ Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error('💥 Server failed health checks - may not be fully ready');
  return false;
}

// Graceful shutdown handler
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    if (serverProcess) {
      console.log('🔄 Terminating server process...');
      serverProcess.kill('SIGTERM');
      
      // Force kill after 10 seconds
      setTimeout(() => {
        if (!serverProcess.killed) {
          console.log('⚡ Force killing server process...');
          serverProcess.kill('SIGKILL');
        }
      }, 10000);
    } else {
      process.exit(0);
    }
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));
}

// Try to start with Next.js CLI first
function startWithNextCLI() {
  console.log('🔧 Attempting to start with Next.js CLI...');
  
  serverProcess = spawn('npx', ['next', 'start', '-p', PORT, '-H', HOSTNAME], {
    stdio: 'inherit',
    env: { ...process.env, PORT, HOSTNAME }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Next.js CLI failed:', error.message);
    console.log('🔄 Attempting fallback to standalone server...');
    startStandalone();
  });

  serverProcess.on('exit', (code, signal) => {
    if (signal) {
      console.log(`🛑 Next.js CLI terminated by signal: ${signal}`);
      process.exit(0);
    } else if (code !== 0) {
      console.error(`❌ Next.js CLI exited with code ${code}`);
      console.log('🔄 Attempting fallback to standalone server...');
      startStandalone();
    } else {
      console.log('✅ Next.js CLI exited normally');
      process.exit(0);
    }
  });
  
  // Validate health after startup
  validateServerHealth().catch(error => {
    console.error('⚠️ Health check validation failed:', error.message);
  });
}

// Fallback to standalone server
function startStandalone() {
  const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
  
  if (existsSync(standalonePath)) {
    console.log('✅ Starting standalone server...');
    process.env.PORT = PORT;
    process.env.HOSTNAME = HOSTNAME;
    
    try {
      require(standalonePath);
      
      // Validate health after startup
      validateServerHealth().catch(error => {
        console.error('⚠️ Health check validation failed:', error.message);
      });
    } catch (error) {
      console.error('❌ Failed to start standalone server:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ No standalone server found. Make sure to build with output: "standalone"');
    console.error('💡 Try running: npm run build');
    process.exit(1);
  }
}

// Setup graceful shutdown
setupGracefulShutdown();

// Start the server
startWithNextCLI();