import { NextResponse } from 'next/server';

export const runtime = 'edge';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'web',
    version: process.env['NEXT_PUBLIC_APP_VERSION'] ?? 'dev',
    commit: process.env['NEXT_PUBLIC_COMMIT_SHA'] ?? 'unknown',
    environment: process.env['NEXT_PUBLIC_DEPLOY_ENV'] ?? 'development',
    timestamp: new Date().toISOString(),
  });
}
