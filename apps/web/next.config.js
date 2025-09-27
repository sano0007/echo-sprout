/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add module resolution for the backend package
    config.resolve.alias = {
      ...config.resolve.alias,
      // Point to the monorepo backend package correctly from apps/web
      '@packages/backend': path.resolve(__dirname, '../../packages/backend'),
    };
    return config;
  },
};

export default nextConfig;
