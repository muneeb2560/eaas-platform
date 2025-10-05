# Health Check & Deployment Failure Handling Guide

This guide provides comprehensive solutions for handling health check failures and deployment issues.

## 🏥 Health Check System Overview

Our health check system includes multiple layers:

### 1. **Health Check API (`/api/health`)**
- **GET**: Comprehensive health status with system checks
- **HEAD**: Simple liveness probe
- **POST**: Readiness probe for deployment validation

### 2. **Health Check Scripts**
- `scripts/health-check.js`: Standalone health check with retries
- `scripts/deployment-validation.js`: Full deployment validation

### 3. **Integrated Start Script**
- `start.js`: Enhanced startup with health validation
- Automatic fallback mechanisms
- Graceful shutdown handling

## 🔧 Health Check Features

### Comprehensive Monitoring
```json
{
  \"status\": \"healthy|degraded|unhealthy\",
  \"timestamp\": \"2024-01-01T00:00:00.000Z\",
  \"service\": \"eaas-platform\",
  \"version\": \"1.0.0\",
  \"uptime\": 3600,
  \"checks\": {
    \"memory\": \"pass|warn|fail\",
    \"dependencies\": \"pass|fail\"
  },
  \"details\": {
    \"memory\": {
      \"heapUsed\": \"45MB\",
      \"heapTotal\": \"60MB\",
      \"usage_percent\": \"75.0%\"
    },
    \"dependencies\": {
      \"modules\": {
        \"next\": true,
        \"react\": true,
        \"react-dom\": true
      }
    },
    \"responseTime\": \"5ms\",
    \"nodeVersion\": \"v20.0.0\",
    \"platform\": \"linux\",
    \"environment\": \"production\"
  }
}
```

### Status Levels
- **healthy**: All systems operational
- **degraded**: Some warnings but functional
- **unhealthy**: Critical issues detected

## 🚀 Railway Deployment Configuration

### railway.json
```json
{
  \"deploy\": {
    \"healthcheckPath\": \"/api/health\",
    \"healthcheckTimeout\": 60,
    \"sleepApplication\": false,
    \"restartPolicyType\": \"always\"
  }
}
```

### Health Check Behavior
- **Timeout**: 60 seconds for initial health check
- **Retries**: Automatic retries with exponential backoff
- **Failure Action**: Restart container if health checks fail

## 🛠️ Common Health Check Failures

### 1. **Service Not Ready**
```bash
❌ Error: Health check failed with status 503
```

**Causes:**
- Application still starting up
- Dependencies not loaded
- Database connection issues

**Solutions:**
```bash
# Check startup logs
railway logs

# Validate locally
npm run health-check:local

# Manual validation
node scripts/health-check.js http://localhost:3000/api/health
```

### 2. **Memory Issues**
```bash
❌ Memory check failed: usage_percent > 90%
```

**Solutions:**
- Increase Railway plan memory limit
- Optimize application memory usage
- Check for memory leaks

### 3. **Dependency Failures**
```bash
❌ Dependency check failed: next module not found
```

**Solutions:**
- Verify build completed successfully
- Check package.json dependencies
- Rebuild application

## 🔄 Deployment Failure Recovery

### Step 1: Immediate Diagnosis
```bash
# Check deployment logs
railway logs --tail 100

# Validate health endpoint
node scripts/health-check.js $RAILWAY_STATIC_URL/api/health

# Full deployment validation
node scripts/deployment-validation.js $RAILWAY_STATIC_URL
```

### Step 2: Local Validation
```bash
# Test locally first
npm run build
npm start

# Local health check
npm run health-check:local

# Local deployment validation
npm run validate-deployment
```

### Step 3: Railway-Specific Fixes

#### Build Issues
```bash
# Force rebuild
railway up --detach

# Check build logs
railway logs --build
```

#### Health Check Timeout
```bash
# Increase timeout in railway.json
\"healthcheckTimeout\": 120

# Disable health checks temporarily
# (Remove healthcheckPath from railway.json)
```

#### Environment Variables
```bash
# Set required variables
railway variables set NODE_ENV=production
railway variables set APP_VERSION=1.0.0
```

### Step 4: Rollback Strategy
```bash
# Rollback to last working deployment
git log --oneline -10
git reset --hard <last_working_commit>
git push --force-with-lease
```

## 📊 Monitoring & Alerting

### Manual Health Checks
```bash
# Quick check
curl -f https://yourapp.railway.app/api/health

# Detailed check with retries
node scripts/health-check.js https://yourapp.railway.app/api/health

# Full deployment validation
node scripts/deployment-validation.js https://yourapp.railway.app
```

### Automated Monitoring
```bash
# Add to CI/CD pipeline
npm run validate-deployment:production

# Scheduled health checks
# (Set up external monitoring service)
```

## 🚨 Emergency Procedures

### 1. **Complete Service Failure**
```bash
# Immediate rollback
git reset --hard HEAD~1
git push --force-with-lease

# Or disable health checks
# Remove healthcheckPath from railway.json
```

### 2. **Partial Service Degradation**
```bash
# Check specific endpoints
curl -f https://yourapp.railway.app/api/health
curl -f https://yourapp.railway.app/

# Scale up resources if needed
# (Upgrade Railway plan)
```

### 3. **Health Check False Positives**
```bash
# Temporary bypass
# Comment out healthcheckPath in railway.json
# Push changes to disable health checks
```

## 📋 Troubleshooting Checklist

### Pre-Deployment
- [ ] Local build successful
- [ ] Local health check passing
- [ ] All dependencies resolved
- [ ] Environment variables set

### During Deployment
- [ ] Build logs show success
- [ ] Start command executing
- [ ] Health check endpoint responding
- [ ] No error logs in railway logs

### Post-Deployment
- [ ] Health check returns 200 status
- [ ] All required endpoints accessible
- [ ] Performance within acceptable limits
- [ ] No critical errors in logs

### Validation Commands
```bash
# Complete validation suite
npm run validate-deployment:production

# Individual checks
npm run health-check:production
curl -f $RAILWAY_STATIC_URL/api/health
curl -f $RAILWAY_STATIC_URL/
```

## 🔗 Related Files

- `src/app/api/health/route.ts` - Health check API implementation
- `scripts/health-check.js` - Standalone health check script
- `scripts/deployment-validation.js` - Deployment validation script
- `start.js` - Enhanced production start script
- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration

## 📞 Support

If health check issues persist:
1. Check Railway status page
2. Verify DNS resolution
3. Test from different networks
4. Contact Railway support with health check logs