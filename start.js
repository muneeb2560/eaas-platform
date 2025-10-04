#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Production start script that tries Next.js CLI first, 
 * then falls back to standalone server if available
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log('🚀 Starting production server...');

// Try to start with Next.js CLI first
function startWithNextCLI() {
  const nextProcess = spawn('npx', ['next', 'start', '-p', PORT, '-H', HOSTNAME], {
    stdio: 'inherit',
    env: process.env
  });

  nextProcess.on('error', (error) => {
    console.error('❌ Next.js CLI failed:', error.message);
    console.log('🔄 Attempting fallback to standalone server...');
    startStandalone();
  });

  nextProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Next.js CLI exited with code ${code}`);
      console.log('🔄 Attempting fallback to standalone server...');
      startStandalone();
    }
  });
}

// Fallback to standalone server
function startStandalone() {
  const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
  
  if (existsSync(standalonePath)) {
    console.log('✅ Starting standalone server...');
    process.env.PORT = PORT;
    process.env.HOSTNAME = HOSTNAME;
    require(standalonePath);
  } else {
    console.error('❌ No standalone server found. Make sure to build with output: "standalone"');
    process.exit(1);
  }
}

// Start the server
startWithNextCLI();