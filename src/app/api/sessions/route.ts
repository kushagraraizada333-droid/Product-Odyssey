import { NextResponse } from 'next/server';
import { createSession } from '@/backend/sessionManager';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const nickname = body.nickname || 'Pico the Product Prodigy';
    const session = createSession(nickname);
    return NextResponse.json({
      success: true,
      session,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
