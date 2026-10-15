import { NextResponse } from 'next/server';
import { getSession } from '@/backend/sessionManager';

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = getSession(params.sessionId);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, session });
}
