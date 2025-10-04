import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Remove turbopack config for production builds to avoid Vercel conflicts
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      root: '/Users/moneebraza/Desktop/FullStack/my-nextjs-app',
    },
  }),
};

export default nextConfig;
