import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// DEV ONLY — remove before production
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split("@")[0],
        role: "STUDENT",
        level: "A1",
      },
    });

    // Ensure UserProgress rows exist for all topics
    const topics = await prisma.topic.findMany({ select: { id: true } });
    if (topics.length > 0) {
      await prisma.userProgress.createMany({
        data: topics.map((t) => ({ userId: user.id, topicId: t.id })),
        skipDuplicates: true,
      });
    }

    // Create a session valid for 30 days
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { sessionToken, userId: user.id, expires },
    });

    const deepLink = `speakeasy://auth/callback?sessionToken=${encodeURIComponent(sessionToken)}`;
    return NextResponse.json({ sessionToken, deepLink });
  } catch (err) {
    console.error("[dev-login] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
