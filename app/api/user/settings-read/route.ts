import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const webSession = mobileSession ? null : await auth();
  const userId = mobileSession?.userId ?? webSession?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      nativeLanguage: true,
      preferredAccent: true,
      audioSpeed: true,
      level: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
