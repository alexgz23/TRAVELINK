import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Used by Docker healthcheck and monitoring services
 */
export async function GET() {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    service: 'viajero-conectado-web',
  };

  try {
    // Add any additional health checks here
    // For example, check database connection, external APIs, etc.

    return NextResponse.json(healthcheck, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}
