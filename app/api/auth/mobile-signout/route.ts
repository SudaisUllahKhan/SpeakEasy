import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by the mobile app during logout to invalidate the server-side session.
// Without this, the browser cookie in Chrome Custom Tabs stays alive and the
// next Google OAuth flow returns the old user's token instead of the new one.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { sessionToken?: string };
    const token = body.sessionToken;
    if (token) {
      await prisma.session.deleteMany({ where: { sessionToken: token } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Non-fatal — mobile logout proceeds regardless
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
