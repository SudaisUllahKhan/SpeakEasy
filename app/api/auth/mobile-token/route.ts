import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  // In production NextAuth sets __Secure-next-auth.session-token (HTTPS only).
  // Always read the secure cookie first — it's the one just set by the OAuth flow.
  // The non-secure next-auth.session-token may be a stale cookie from a previous
  // web-app login by a different user still sitting in Chrome's cookie jar.
  const sessionToken =
    cookieStore.get("__Secure-next-auth.session-token")?.value ??
    cookieStore.get("next-auth.session-token")?.value;

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
