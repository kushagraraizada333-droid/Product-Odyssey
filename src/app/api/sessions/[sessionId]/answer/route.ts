import { NextResponse } from 'next/server';
import { submitAnswer } from '@/backend/sessionManager';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { questionId, selectedOptionKey } = body;

    if (!questionId || !selectedOptionKey) {
      return NextResponse.json(
        { success: false, error: 'Missing questionId or selectedOptionKey' },
        { status: 400 }
      );
    }

    const result = submitAnswer(params.sessionId, Number(questionId), selectedOptionKey);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
