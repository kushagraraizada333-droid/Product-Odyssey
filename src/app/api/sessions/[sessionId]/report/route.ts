import { NextResponse } from 'next/server';
import { generateSessionReport } from '@/backend/sessionManager';

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const report = generateSessionReport(params.sessionId);
    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 404 });
  }
}
