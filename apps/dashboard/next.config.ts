import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@juris/ui', '@juris/domain', '@juris/schemas'],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env['NEXT_PUBLIC_APP_VERSION'] ?? '0.0.0-dev',
    NEXT_PUBLIC_COMMIT_SHA: process.env['NEXT_PUBLIC_COMMIT_SHA'] ?? 'local',
    NEXT_PUBLIC_DEPLOY_ENV: process.env['NEXT_PUBLIC_DEPLOY_ENV'] ?? 'development',
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ],
    },
  ],
};

export default config;
