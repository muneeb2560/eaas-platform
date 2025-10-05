#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Standalone health check script for deployment verification
 * Can be used by Railway or other platforms to verify deployment success
 */

const http = require('http');
const https = require('https');

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

async function performHealthCheck(url, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const request = client.get(url, {
      timeout,
      headers: {
        'User-Agent': 'HealthCheck/1.0',
        'Accept': 'application/json'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const result = {
            statusCode: response.statusCode,
            headers: response.headers,
            body: data
          };
          
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`Health check failed with status ${response.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Health check timed out after ${timeout}ms`));
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function healthCheckWithRetries(url, retries = DEFAULT_RETRIES, delay = RETRY_DELAY) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Health check attempt ${attempt}/${retries}: ${url}`);
      
      const result = await performHealthCheck(url);
      
      console.log(`✅ Health check passed on attempt ${attempt}`);
      console.log(`📊 Status: ${result.statusCode}`);
      
      try {
        const healthData = JSON.parse(result.body);
        console.log(`🏥 Service: ${healthData.service || 'unknown'}`);
        console.log(`⏱️  Status: ${healthData.status || 'unknown'}`);
        console.log(`🕐 Uptime: ${healthData.uptime || 'unknown'}s`);
        
        if (healthData.checks) {
          console.log('🔍 Checks:', Object.entries(healthData.checks)
            .map(([key, value]) => `${key}:${value}`)
            .join(', '));
        }
      } catch {
        // Non-JSON response, just log status
        console.log(`📄 Response: ${result.body.substring(0, 100)}...`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Health check attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      if (attempt < retries) {
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Health Check Script

Usage: node health-check.js [options] <url>

Options:
  --timeout <ms>     Request timeout in milliseconds (default: ${DEFAULT_TIMEOUT})
  --retries <n>      Number of retry attempts (default: ${DEFAULT_RETRIES})
  --delay <ms>       Delay between retries in milliseconds (default: ${RETRY_DELAY})
  --help, -h         Show this help message

Examples:
  node health-check.js http://localhost:3000/api/health
  node health-check.js --timeout 10000 --retries 3 https://myapp.railway.app/api/health
    `);
    process.exit(0);
  }
  
  let url = args[args.length - 1];
  let timeout = DEFAULT_TIMEOUT;
  let retries = DEFAULT_RETRIES;
  let delay = RETRY_DELAY;
  
  // Parse arguments
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === '--timeout' && args[i + 1]) {
      timeout = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--retries' && args[i + 1]) {
      retries = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--delay' && args[i + 1]) {
      delay = parseInt(args[i + 1], 10);
      i++;
    }
  }
  
  // Default URL if not provided
  if (!url || url.startsWith('--')) {
    url = process.env.HEALTH_CHECK_URL || 'http://localhost:3000/api/health';
  }
  
  // Validate URL
  try {
    new URL(url);
  } catch {
    console.error(`❌ Invalid URL: ${url}`);
    process.exit(1);
  }
  
  console.log(`🚀 Starting health check for: ${url}`);
  console.log(`⚙️  Timeout: ${timeout}ms, Retries: ${retries}, Delay: ${delay}ms`);
  console.log('─'.repeat(50));
  
  try {
    await healthCheckWithRetries(url, retries, delay);
    console.log('─'.repeat(50));
    console.log('🎉 Health check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.log('─'.repeat(50));
    console.error('💥 Health check failed after all retries:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { performHealthCheck, healthCheckWithRetries };