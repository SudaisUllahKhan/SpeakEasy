import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SettingsBody = z.object({
  name:            z.string().min(1).max(100).optional(),
  nativeLanguage:  z.string().max(50).optional(),
  preferredAccent: z.enum(["US", "UK", "AU", "IN"]).optional(),
  audioSpeed:      z.number().refine((v) => [0.75, 1.0, 1.25].includes(v)).optional(),
  level:           z.enum(["A1", "A2", "B1"]).optional(),
});

export async function PATCH(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const userId = mobileSession?.userId ?? (await auth())?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = SettingsBody.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", details: body.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: body.data,
    select: {
      id: true,
      name: true,
      nativeLanguage: true,
      preferredAccent: true,
      audioSpeed: true,
      level: true,
    },
  });

  return NextResponse.json({ user: updated });
}
