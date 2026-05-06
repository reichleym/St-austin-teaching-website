import { NextRequest, NextResponse } from 'next/server';
import { isSmtpConfigured, sendRequestInfoNotificationEmail } from "@/lib/mail";

const REQUEST_INFO_NOTIFICATION_EMAIL = (process.env.REQUEST_INFO_NOTIFICATION_EMAIL || "infos@st-austin.org").trim();

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

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { ok: false, error: "SMTP is not configured." },
        { status: 503 }
      );
    }

    await sendRequestInfoNotificationEmail({
      toEmail: REQUEST_INFO_NOTIFICATION_EMAIL,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      program: String(program).trim(),
      message: message?.trim() || "",
    });

    return NextResponse.json({ ok: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('[Request Info API Error]', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
