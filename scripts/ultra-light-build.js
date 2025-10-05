#!/usr/bin/env node

/**
 * Ultra-lightweight build script for Railway deployment
 * Minimal memory usage with maximum optimization
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Ultra-lightweight build...');

// Set ultra-minimal memory environment variables
process.env.NODE_OPTIONS = '--max-old-space-size=128 --max-semi-space-size=8 --max-new-space-size=16';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

try {
  // Clean previous builds aggressively
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
  }

  // Install dependencies with minimal memory
  console.log('📦 Installing dependencies with minimal memory...');
  execSync('npm ci --omit=dev --no-audit --no-fund --prefer-offline', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=64' }
  });

  // Build with ultra-minimal memory constraints
  console.log('🔨 Building application with ultra-minimal memory...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=128 --max-semi-space-size=8 --max-new-space-size=16'
    }
  });

  // Clean up build artifacts to reduce final size
  console.log('🧹 Cleaning build artifacts...');
  if (fs.existsSync('.next/cache')) {
    execSync('rm -rf .next/cache', { stdio: 'inherit' });
  }

  console.log('✅ Ultra-lightweight build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
