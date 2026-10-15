import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    game: 'PRODUCT ODYSSEY: JUMP. THINK. BUILD. BECOME A PM.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
