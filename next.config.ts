import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    domains: ['example.com',  'localhost'],

  },
};

export default nextConfig;
