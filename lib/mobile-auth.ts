import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Reads session token from Authorization header or Cookie header for mobile API calls
export async function getMobileSession(req: NextRequest) {
  let sessionToken: string | null = null;

  // Try Authorization: Bearer TOKEN
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    sessionToken = authHeader.slice(7);
  }

  // Fallback: Cookie header
  if (!sessionToken) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:__Secure-)?next-auth\.session-token=([^;]+)/);
    if (match) sessionToken = decodeURIComponent(match[1]);
  }

  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) return null;
  return session;
}
