import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Memory and performance optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingRoot: __dirname,
  output: 'standalone',
  
  // Experimental optimizations for memory reduction
  experimental: {
    // Reduce memory usage during builds
    memoryBasedWorkers: true,
    // Optimize bundling
    optimizePackageImports: ['react-icons', 'lodash', 'date-fns'],
    // Enable advanced tree shaking
    turbotrace: {
      logLevel: 'error'
    }
  },
  
  // Webpack optimizations for memory reduction
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Memory optimizations
    config.optimization = {
      ...config.optimization,
      // Reduce chunk sizes
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
        },
      },
    };
    
    // Reduce memory usage during compilation
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    // Plugin optimizations
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
      })
    );
    
    return config;
  },
  
  // Compression for smaller bundles
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
  
  // Remove turbopack config for production builds to avoid conflicts
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      root: '/Users/moneebraza/Desktop/FullStack/my-nextjs-app',
    },
  }),
};

export default nextConfig;
