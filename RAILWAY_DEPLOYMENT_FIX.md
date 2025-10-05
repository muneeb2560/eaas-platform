# Railway Deployment Fix Guide

## समस्या का समाधान

यह guide Railway.com पर deployment errors को fix करने के लिए है, विशेष रूप से memory usage और build failures के लिए।

## मुख्य समस्याएं और समाधान

### 1. Googleapis Module Error
**समस्या**: `Module not found: Can't resolve 'googleapis'`

**समाधान**:
- `googleapis` को `devDependencies` से `dependencies` में move किया गया
- अब production build में available होगा

### 2. Next.js Config Invalid Options
**समस्या**: `Invalid next.config.ts options detected: 'memoryBasedWorkers', 'turbotrace'`

**समाधान**:
- Invalid experimental options को remove किया गया
- केवल valid `optimizePackageImports` option रखा गया

### 3. Memory Usage Optimization
**समस्या**: Large memory usage during build

**समाधान**:
- Memory-optimized build scripts बनाए गए
- Node.js memory limits को reduce किया गया
- Railway-specific build process create किया गया

## नए Build Scripts

### 1. Standard Build (Memory Optimized)
```bash
npm run build
```
- Memory limit: 1024MB
- Standard Next.js build

### 2. Railway Optimized Build
```bash
npm run build:railway
```
- Memory limit: 1024MB + semi-space optimization
- Railway-specific optimizations

### 3. Advanced Railway Build
```bash
npm run build:railway-optimized
```
- Custom build script with memory management
- Automatic cleanup and optimization
- Step-by-step memory monitoring

## Configuration Changes

### 1. Package.json Updates
- `googleapis` moved to dependencies
- New build scripts added
- Memory-optimized configurations

### 2. Next.js Config
- Removed invalid experimental options
- Kept only valid optimizations
- Memory-friendly webpack config

### 3. Railway Configuration
- Updated build command to use optimized script
- Added memory environment variables
- Configured for production deployment

### 4. Dockerfile Updates
- Memory-optimized build process
- Reduced memory limits for production
- Better resource management

## Deployment Steps

### 1. Pre-deployment Checklist
```bash
# Clean previous builds
npm run clean

# Install dependencies
npm install

# Test build locally
npm run build:railway-optimized
```

### 2. Railway Deployment
1. Push changes to repository
2. Railway will automatically use `build:railway-optimized` script
3. Monitor build logs for memory usage
4. Check deployment health at `/api/health`

### 3. Environment Variables
Ensure these are set in Railway:
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=64
NEXT_TELEMETRY_DISABLED=1
```

## Memory Optimization Features

### 1. Build Process
- Reduced memory allocation (1024MB instead of 2048MB)
- Semi-space optimization for better garbage collection
- Step-by-step build process with cleanup

### 2. Runtime Optimization
- Production memory limits (512MB)
- Disabled telemetry
- Optimized Node.js flags

### 3. Webpack Optimizations
- Better chunk splitting
- Reduced bundle sizes
- Memory-efficient compilation

## Troubleshooting

### Build Failures
1. Check memory usage in Railway logs
2. Try `npm run build:railway-optimized` locally
3. Verify all dependencies are installed

### Runtime Issues
1. Monitor memory usage in Railway dashboard
2. Check health endpoint: `/api/health`
3. Review application logs

### Performance Issues
1. Use `npm run analyze-memory` for analysis
2. Check bundle sizes
3. Monitor build times

## Monitoring

### Health Checks
- Endpoint: `/api/health`
- Timeout: 120 seconds
- Automatic restart on failure

### Memory Monitoring
- Railway dashboard shows real-time usage
- Build logs show memory allocation
- Runtime logs show performance metrics

## Best Practices

1. **Regular Cleanup**: Use `npm run clean` before builds
2. **Memory Monitoring**: Watch Railway dashboard during deployment
3. **Incremental Builds**: Use optimized scripts for faster builds
4. **Health Checks**: Monitor `/api/health` endpoint
5. **Log Analysis**: Review build and runtime logs regularly

## Support

यदि issues persist करें:
1. Railway logs check करें
2. Local build test करें
3. Memory usage monitor करें
4. Health endpoint verify करें

---

**Note**: यह configuration Railway.com के memory constraints के साथ optimized है और production deployment के लिए ready है।

