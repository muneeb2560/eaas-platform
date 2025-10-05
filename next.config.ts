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
    // Optimize bundling
    optimizePackageImports: ['react-icons', 'lodash', 'date-fns']
  },
  
  // Webpack optimizations for memory reduction
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Memory optimizations
    config.optimization = {
      ...config.optimization,
      // Reduce chunk sizes aggressively
      splitChunks: {
        chunks: 'all',
        minSize: 1000,
        maxSize: 10000,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 10000,
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            maxSize: 5000,
            priority: 5,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            maxSize: 8000,
            priority: 8,
          },
        },
      },
      // Reduce memory usage during compilation
      usedExports: true,
      sideEffects: false,
      providedExports: false,
    };
    
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
