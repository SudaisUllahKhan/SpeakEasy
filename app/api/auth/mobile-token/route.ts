import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("next-auth.session-token")?.value ??
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login?error=no_session", req.url));
  }

  const session = await prisma.session.findUnique({ where: { sessionToken } });
  if (!session || session.expires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=session_expired", req.url));
  }

  // The mobile app passes its redirect URI via ?mobileRedirect=... so we send
  // the token back to the right scheme (exp:// in Expo Go, speakeasy:// in prod).
  const mobileRedirect = req.nextUrl.searchParams.get("mobileRedirect");
  const base = mobileRedirect
    ? decodeURIComponent(mobileRedirect)
    : "speakeasy://auth/callback";

  const separator = base.includes("?") ? "&" : "?";
  const deepLink = `${base}${separator}sessionToken=${encodeURIComponent(sessionToken)}`;
  return NextResponse.redirect(deepLink);
}
