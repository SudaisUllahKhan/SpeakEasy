import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = SettingsBody.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", details: body.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
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
