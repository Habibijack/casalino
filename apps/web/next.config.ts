import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@casalino/db', '@casalino/shared', '@casalino/ui'],
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
