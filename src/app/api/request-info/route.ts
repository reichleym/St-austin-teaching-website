import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, program, message } = body;

    // Basic validation
    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !program) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log request (extend to email/DB later)
    console.log('[Request Info Form]', {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      program,
      message: message?.trim() || ''
    });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ ok: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('[Request Info API Error]', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

