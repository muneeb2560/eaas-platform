import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: '/Users/moneebraza/Desktop/FullStack/my-nextjs-app',
  },
};

export default nextConfig;
