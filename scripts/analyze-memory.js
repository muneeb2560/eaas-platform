#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Memory optimization and analysis script
 * Analyzes and optimizes memory usage for the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MEMORY_ANALYSIS = {
  bundleSize: {
    target: '1MB',
    warning: '2MB',
    critical: '5MB'
  },
  nodeMemory: {
    development: '1GB',
    production: '512MB',
    build: '2GB'
  },
  dependencies: {
    maxSize: '100MB',
    warning: '150MB'
  }
};

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzePackageJson() {
  console.log('📦 PACKAGE ANALYSIS');
  console.log('=' .repeat(50));
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const depCount = Object.keys(pkg.dependencies || {}).length;
  const devDepCount = Object.keys(pkg.devDependencies || {}).length;
  
  console.log(`Dependencies: ${depCount}`);
  console.log(`Dev Dependencies: ${devDepCount}`);
  console.log(`Total: ${depCount + devDepCount}`);
  
  // Analyze large dependencies
  const largeDeps = [
    '@supabase/supabase-js',
    'googleapis', 
    'recharts',
    'next'
  ];
  
  console.log('\\n🔍 Large Dependencies:');
  largeDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`  ${dep}: ${pkg.dependencies[dep]}`);
    }
  });
}

function analyzeBundleSize() {
  console.log('\\n📊 BUNDLE SIZE ANALYSIS');
  console.log('=' .repeat(50));
  
  try {
    // Check if .next exists
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      console.log('❌ No build found. Run `npm run build` first.');
      return;
    }
    
    // Get build sizes
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      const getDirSize = (dirPath) => {
        let size = 0;
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const file of files) {
          const filePath = path.join(dirPath, file.name);
          if (file.isDirectory()) {
            size += getDirSize(filePath);
          } else {
            size += fs.statSync(filePath).size;
          }
        }
        return size;
      };
      
      const totalSize = getDirSize(staticDir);
      console.log(`Static Bundle Size: ${formatBytes(totalSize)}`);
      
      // Analyze chunks
      const chunksDir = path.join(staticDir, 'chunks');
      if (fs.existsSync(chunksDir)) {
        const chunkSize = getDirSize(chunksDir);
        console.log(`Chunks Size: ${formatBytes(chunkSize)}`);
      }
    }
    
    // Check standalone build
    const standaloneDir = path.join(nextDir, 'standalone');
    if (fs.existsSync(standaloneDir)) {
      console.log('✅ Standalone build available');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
  }
}

function analyzeNodeModules() {
  console.log('\\n📁 NODE_MODULES ANALYSIS');
  console.log('=' .repeat(50));
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules not found');
    return;
  }
  
  try {
    // Get size of node_modules
    const getDirSize = (dirPath) => {
      let size = 0;
      try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const file of files) {
          const filePath = path.join(dirPath, file.name);
          try {
            if (file.isDirectory()) {
              size += getDirSize(filePath);
            } else {
              size += fs.statSync(filePath).size;
            }
          } catch {
            // Skip files that can't be accessed
          }
        }
      } catch {
        // Skip directories that can't be accessed
      }
      return size;
    };
    
    const totalSize = getDirSize(nodeModulesPath);
    console.log(`Total Size: ${formatBytes(totalSize)}`);
    
    // Analyze large packages
    const packages = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        try {
          const packagePath = path.join(nodeModulesPath, dirent.name);
          const size = getDirSize(packagePath);
          return { name: dirent.name, size };
        } catch {
          return { name: dirent.name, size: 0 };
        }
      })
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    console.log('\\n🔍 Largest Packages:');
    packages.forEach((pkg, i) => {
      console.log(`  ${i+1}. ${pkg.name}: ${formatBytes(pkg.size)}`);
    });
    
  } catch (error) {
    console.error('❌ Error analyzing node_modules:', error.message);
  }
}

function generateOptimizationRecommendations() {
  console.log('\\n💡 OPTIMIZATION RECOMMENDATIONS');
  console.log('=' .repeat(50));
  
  const recommendations = [
    '1. Use dynamic imports for large components',
    '2. Enable tree shaking with sideEffects: false',
    '3. Optimize images with next/image',
    '4. Use bundle analyzer to identify large chunks',
    '5. Consider lazy loading for non-critical components',
    '6. Remove unused dependencies',
    '7. Use production builds for deployment',
    '8. Enable compression in production',
    '9. Optimize CSS with purging unused styles',
    '10. Use memory-optimized Node.js flags'
  ];
  
  recommendations.forEach(rec => console.log(`  ${rec}`));
  
  console.log('\\n🚀 Quick Commands:');
  console.log('  npm run analyze:memory     - Analyze bundle with memory optimization');
  console.log('  npm run build:memory-optimized - Build with memory constraints');
  console.log('  npm run clean              - Clean build cache');
  console.log('  npm run clean:full         - Full clean and reinstall');
}

function checkMemorySettings() {
  console.log('\\n🧠 MEMORY CONFIGURATION');
  console.log('=' .repeat(50));
  
  // Check Node.js memory settings
  const nodeOptions = process.env.NODE_OPTIONS || '';
  console.log(`NODE_OPTIONS: ${nodeOptions || 'Not set'}`);
  
  // Check package.json scripts
  const packagePath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const memoryScripts = Object.entries(pkg.scripts || {})
    .filter(([, script]) => script.includes('max-old-space-size'))
    .map(([name]) => name);
  
  if (memoryScripts.length > 0) {
    console.log(`✅ Memory-optimized scripts: ${memoryScripts.join(', ')}`);
  } else {
    console.log('⚠️  No memory-optimized scripts found');
  }
  
  // Check nixpacks config
  const nixpacksPath = path.join(process.cwd(), 'nixpacks.toml');
  if (fs.existsSync(nixpacksPath)) {
    const nixpacks = fs.readFileSync(nixpacksPath, 'utf8');
    if (nixpacks.includes('max-old-space-size')) {
      console.log('✅ Nixpacks configured with memory optimization');
    } else {
      console.log('⚠️  Nixpacks not memory-optimized');
    }
  }
}

function main() {
  console.log('🔬 MEMORY OPTIMIZATION ANALYSIS');
  console.log('=' .repeat(80));
  
  analyzePackageJson();
  analyzeBundleSize();
  analyzeNodeModules();
  checkMemorySettings();
  generateOptimizationRecommendations();
  
  console.log('\\n' + '=' .repeat(80));
  console.log('✅ Analysis complete! Use recommendations to optimize memory usage.');
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzePackageJson,
  analyzeBundleSize,
  analyzeNodeModules,
  generateOptimizationRecommendations
};