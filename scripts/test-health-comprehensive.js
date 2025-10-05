#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Comprehensive health check testing script for Railway deployment
 * Tests health check endpoint extensively to identify production issues
 */

const http = require('http');
const https = require('https');

const TEST_CONFIGURATIONS = [
  {
    name: 'Local Development',
    url: 'http://localhost:3002/api/health',
    timeout: 10000,
    retries: 3,
    required: false
  },
  {
    name: 'Local Production Build',
    url: 'http://localhost:3000/api/health',
    timeout: 15000,
    retries: 3,
    required: false
  },
  {
    name: 'Railway Production',
    url: process.env.RAILWAY_STATIC_URL ? `${process.env.RAILWAY_STATIC_URL}/api/health` : null,
    timeout: 30000,
    retries: 5,
    required: true
  }
];

const STRESS_TEST_CONFIG = {
  concurrentRequests: 10,
  totalRequests: 50,
  requestDelay: 100 // ms
};

async function performRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    const timeout = options.timeout || 10000;
    
    const startTime = Date.now();
    
    const request = client.get(url, {
      timeout,
      headers: {
        'User-Agent': 'HealthCheck-Tester/1.0',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const result = {
            statusCode: response.statusCode,
            headers: response.headers,
            body: data,
            responseTime,
            success: response.statusCode >= 200 && response.statusCode < 300
          };
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timed out after ${timeout}ms`));
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function testSingleEndpoint(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`📍 URL: ${config.url}`);
  console.log(`⏱️  Timeout: ${config.timeout}ms, Retries: ${config.retries}`);
  console.log('-'.repeat(60));
  
  if (!config.url) {
    console.log('⚠️  URL not available, skipping...');
    return { success: false, reason: 'URL not available' };
  }
  
  const results = [];
  let lastError = null;
  
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🚀 Attempt ${attempt}/${config.retries}...`);
      
      const result = await performRequest(config.url, { timeout: config.timeout });
      
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`⏱️  Response Time: ${result.responseTime}ms`);
      
      // Parse and display health check data
      try {
        const healthData = JSON.parse(result.body);
        console.log(`🏥 Health Status: ${healthData.status}`);
        console.log(`🔧 Service: ${healthData.service}`);
        console.log(`⏰ Uptime: ${healthData.uptime}s`);
        
        if (healthData.checks) {
          const checkResults = Object.entries(healthData.checks)
            .map(([key, value]) => `${key}:${value}`)
            .join(', ');
          console.log(`🔍 Checks: ${checkResults}`);
        }
        
        if (healthData.details && healthData.details.memory) {
          const memory = healthData.details.memory;
          console.log(`💾 Memory: ${memory.heapUsed}/${memory.heapTotal} (${memory.usage_percent})`);
        }
        
        if (healthData.details && healthData.details.railway) {
          console.log(`🚂 Railway Env: ${healthData.details.railway.environment}`);
        }
      } catch {
        console.log(`📄 Raw Response: ${result.body.substring(0, 200)}...`);
      }
      
      results.push(result);
      
      if (result.success) {
        console.log(`🎉 Test passed on attempt ${attempt}`);
        return { success: true, results, attempts: attempt };
      } else {
        console.log(`❌ HTTP ${result.statusCode} - continuing...`);
      }
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      lastError = error;
      results.push({ error: error.message, attempt });
      
      if (attempt < config.retries) {
        console.log('⏳ Waiting 2s before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log(`💥 All attempts failed`);
  return { success: false, results, lastError: lastError?.message };
}

async function performStressTest(url) {
  if (!url) {
    console.log('⚠️  No URL provided for stress test');
    return;
  }
  
  console.log(`\n🔥 STRESS TEST: ${url}`);
  console.log(`📊 ${STRESS_TEST_CONFIG.concurrentRequests} concurrent, ${STRESS_TEST_CONFIG.totalRequests} total requests`);
  console.log('-'.repeat(60));
  
  const results = [];
  const startTime = Date.now();
  
  // Create batches of concurrent requests
  const batchSize = STRESS_TEST_CONFIG.concurrentRequests;
  const totalBatches = Math.ceil(STRESS_TEST_CONFIG.totalRequests / batchSize);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchPromises = [];
    const requestsInBatch = Math.min(batchSize, STRESS_TEST_CONFIG.totalRequests - (batch * batchSize));
    
    console.log(`🚀 Batch ${batch + 1}/${totalBatches} (${requestsInBatch} requests)`);
    
    for (let i = 0; i < requestsInBatch; i++) {
      batchPromises.push(
        performRequest(url, { timeout: 10000 })
          .then(result => ({ ...result, batch, request: i }))
          .catch(error => ({ error: error.message, batch, request: i }))
      );
    }
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Brief delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, STRESS_TEST_CONFIG.requestDelay));
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Analyze results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => r.error).length;
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((acc, r) => acc + r.responseTime, 0) / successful || 0;
  
  console.log(`\n📊 STRESS TEST RESULTS:`);
  console.log(`✅ Successful: ${successful}/${STRESS_TEST_CONFIG.totalRequests} (${((successful/STRESS_TEST_CONFIG.totalRequests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`⏰ Total Test Time: ${totalTime}ms`);
  console.log(`📈 Requests/sec: ${(STRESS_TEST_CONFIG.totalRequests / (totalTime/1000)).toFixed(1)}`);
  
  if (failed > 0) {
    console.log(`\n❌ FAILED REQUESTS:`);
    results.filter(r => r.error).slice(0, 5).forEach((r, i) => {
      console.log(`  ${i+1}. ${r.error}`);
    });
  }
  
  return {
    successful,
    failed,
    avgResponseTime,
    totalTime,
    successRate: (successful/STRESS_TEST_CONFIG.totalRequests)*100
  };
}

async function main() {
  console.log('🚀 COMPREHENSIVE HEALTH CHECK TESTING');
  console.log('=' .repeat(80));
  
  const overallResults = {
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      requiredFailed: 0
    }
  };
  
  // Test each configuration
  for (const config of TEST_CONFIGURATIONS) {
    const result = await testSingleEndpoint(config);
    
    overallResults.tests.push({
      ...config,
      result
    });
    
    if (result.success) {
      overallResults.summary.passed++;
    } else {
      overallResults.summary.failed++;
      if (config.required) {
        overallResults.summary.requiredFailed++;
      }
    }
  }
  
  // Perform stress test on production if available
  const productionUrl = process.env.RAILWAY_STATIC_URL ? `${process.env.RAILWAY_STATIC_URL}/api/health` : null;
  if (productionUrl && overallResults.tests.find(t => t.name === 'Railway Production')?.result.success) {
    const stressResults = await performStressTest(productionUrl);
    overallResults.stressTest = stressResults;
  }
  
  // Final summary
  console.log('\n' + '=' .repeat(80));
  console.log('📊 OVERALL TEST RESULTS');
  console.log('=' .repeat(80));
  
  overallResults.tests.forEach(test => {
    const status = test.result.success ? '✅ PASS' : '❌ FAIL';
    const required = test.required ? '(Required)' : '(Optional)';
    console.log(`${status} ${test.name} ${required}`);
    
    if (!test.result.success && test.result.lastError) {
      console.log(`    └─ ${test.result.lastError}`);
    }
  });
  
  console.log(`\n📈 Summary:`);
  console.log(`  ✅ Passed: ${overallResults.summary.passed}`);
  console.log(`  ❌ Failed: ${overallResults.summary.failed}`);
  console.log(`  🚨 Required Failed: ${overallResults.summary.requiredFailed}`);
  
  if (overallResults.stressTest) {
    console.log(`\n🔥 Stress Test: ${overallResults.stressTest.successRate.toFixed(1)}% success rate`);
  }
  
  console.log('\n' + '=' .repeat(80));
  
  if (overallResults.summary.requiredFailed > 0) {
    console.log('💥 CRITICAL: Required health checks failed!');
    console.log('🔧 Recommended actions:');
    console.log('   1. Check Railway deployment logs');
    console.log('   2. Verify environment variables are set');
    console.log('   3. Consider temporarily disabling health checks');
    console.log('   4. Test with railway-no-healthcheck.json configuration');
    process.exit(1);
  } else {
    console.log('🎉 All required health checks passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { performRequest, testSingleEndpoint, performStressTest };