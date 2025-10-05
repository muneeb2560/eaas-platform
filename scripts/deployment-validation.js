#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Post-deployment validation script
 * Validates that the deployment is successful and all services are working
 */

const { healthCheckWithRetries } = require('./health-check.js');

const DEPLOYMENT_CHECKS = [
  {
    name: 'Health Check',
    path: '/api/health',
    timeout: 30000,
    retries: 10,
    delay: 3000,
    required: true
  },
  {
    name: 'Readiness Check',
    path: '/api/health',
    method: 'POST',
    timeout: 15000,
    retries: 5,
    delay: 2000,
    required: true
  },
  {
    name: 'Home Page',
    path: '/',
    timeout: 15000,
    retries: 3,
    delay: 2000,
    required: false
  }
];

async function validateEndpoint(baseUrl, check) {
  const url = `${baseUrl}${check.path}`;
  
  console.log(`\\n🔍 Validating: ${check.name}`);
  console.log(`📍 URL: ${url}`);
  console.log(`⚙️  Method: ${check.method || 'GET'}, Timeout: ${check.timeout}ms, Retries: ${check.retries}`);
  
  try {
    await healthCheckWithRetries(url, check.retries, check.delay);
    console.log(`✅ ${check.name} - PASSED`);
    return true;
  } catch (error) {
    console.error(`❌ ${check.name} - FAILED:`, error.message);
    return false;
  }
}

async function runDeploymentValidation(baseUrl) {
  console.log('🚀 Starting deployment validation...');
  console.log(`🎯 Target: ${baseUrl}`);
  console.log('=' .repeat(60));
  
  const results = [];
  let hasRequiredFailures = false;
  
  for (const check of DEPLOYMENT_CHECKS) {
    const success = await validateEndpoint(baseUrl, check);
    results.push({ ...check, success });
    
    if (!success && check.required) {
      hasRequiredFailures = true;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 DEPLOYMENT VALIDATION RESULTS');
  console.log('=' .repeat(60));
  
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const required = result.required ? '(Required)' : '(Optional)';
    console.log(`${status} ${result.name} ${required}`);
  }
  
  console.log('\n' + '-' .repeat(60));
  
  if (hasRequiredFailures) {
    console.log('💥 DEPLOYMENT VALIDATION FAILED');
    console.log('❌ One or more required checks failed');
    console.log('🔧 Please check the logs and fix the issues before proceeding');
    return false;
  } else {
    console.log('🎉 DEPLOYMENT VALIDATION SUCCESSFUL');
    console.log('✅ All required checks passed');
    
    const optionalFailures = results.filter(r => !r.success && !r.required).length;
    if (optionalFailures > 0) {
      console.log(`⚠️  ${optionalFailures} optional check(s) failed (not critical)`);
    }
    
    return true;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Deployment Validation Script

Usage: node deployment-validation.js [options] <base-url>

Options:
  --help, -h         Show this help message

Examples:
  node deployment-validation.js https://myapp.railway.app
  node deployment-validation.js http://localhost:3000
    `);
    process.exit(0);
  }
  
  let baseUrl = args[0];
  
  // Default URL if not provided
  if (!baseUrl) {
    baseUrl = process.env.RAILWAY_STATIC_URL || 
              process.env.DEPLOYMENT_URL || 
              'http://localhost:3000';
  }
  
  // Validate URL
  try {
    new URL(baseUrl);
  } catch {
    console.error(`❌ Invalid URL: ${baseUrl}`);
    process.exit(1);
  }
  
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  try {
    const success = await runDeploymentValidation(baseUrl);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Validation script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { runDeploymentValidation };