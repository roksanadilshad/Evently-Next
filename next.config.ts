import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This allows images from any HTTPS site (useful for demo/testing)
      },
      // OR be specific for security (Recommended):
      // {
        // protocol: 'https',
        // hostname: 'res.cloudinary.com',
        // port: '',
        // pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;