import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({ confirm: z.literal("DELETE") });

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: "Type DELETE to confirm account deletion" },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Cascade deletes are handled by Prisma schema (onDelete: Cascade on all relations)
  await prisma.user.delete({ where: { id: userId } });

  // Send GDPR confirmation email (non-fatal)
  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@speakeasy.app",
        to: user.email,
        subject: "Your SpeakEasy account has been deleted",
        html: `
          <p>Hi ${user.name ?? "there"},</p>
          <p>Your SpeakEasy account and all associated data have been permanently deleted as requested.</p>
          <p>This includes your learning progress, lesson attempts, vocabulary lists, and personal settings.</p>
          <p>If you change your mind, you can always create a new account at any time.</p>
          <br>
          <p>The SpeakEasy Team</p>
        `,
      });
    }
  } catch {
    // Non-fatal — deletion succeeded regardless
  }

  return NextResponse.json({ deleted: true });
}
