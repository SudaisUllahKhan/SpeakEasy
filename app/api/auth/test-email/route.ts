import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;

  if (!key || key.startsWith("re_xxx")) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured — set a real key in .env.local" },
      { status: 503 }
    );
  }

  let email = "sudais.khan@consult-first.com";
  try {
    const body = (await req.json()) as { email?: string };
    if (body.email) email = body.email;
  } catch {
    // use default
  }

  const resend = new Resend(key);
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: "SpeakEasy — test email",
    html: `<p>This is a test email from SpeakEasy. If you received this, magic link is working!</p><p>Sent at: ${new Date().toISOString()}</p>`,
  });

  if (error) {
    console.error("[test-email] Resend error:", error);
    return NextResponse.json({ error: error.message, from }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id, from, to: email });
}
