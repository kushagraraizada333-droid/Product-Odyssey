import { NextResponse } from 'next/server';
import { completeLevel } from '@/backend/sessionManager';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { levelId } = body;

    if (!levelId || (levelId !== 1 && levelId !== 2)) {
      return NextResponse.json({ success: false, error: 'Invalid levelId' }, { status: 400 });
    }

    const session = completeLevel(params.sessionId, levelId);
    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
