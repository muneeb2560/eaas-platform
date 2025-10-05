#!/usr/bin/env node

/**
 * Railway-optimized build script
 * Reduces memory usage during build process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway-optimized build...');

// Set memory-optimized environment variables
process.env.NODE_OPTIONS = '--max-old-space-size=128 --max-semi-space-size=8 --max-new-space-size=16';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // Install dependencies with memory optimization
  console.log('📦 Installing dependencies...');
  execSync('npm ci --omit=dev --no-audit --no-fund', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=128' }
  });

  // Build with memory constraints
  console.log('🔨 Building application...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=128 --max-semi-space-size=8 --max-new-space-size=16'
    }
  });

  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

