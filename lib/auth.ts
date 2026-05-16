import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      server: "",
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      async sendVerificationRequest({ identifier: email, url }) {
        const key = process.env.RESEND_API_KEY ?? "";
        const isRealKey = key && !key.startsWith("re_xxx");

        // Dev fallback: log magic link to console + file when no real Resend key is set
        if (!isRealKey) {
          const msg = `\n========== MAGIC LINK (dev) ==========\nTo: ${email}\nURL: ${url}\n======================================\n`;
          console.log(msg);
          try {
            const logPath = path.join(process.cwd(), ".magic-link.txt");
            fs.writeFileSync(logPath, `${new Date().toISOString()}\n${msg}`);
          } catch { /* ignore write errors */ }
          return;
        }

        const fromAddress = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
        const { error } = await getResend().emails.send({
          from: fromAddress,
          to: [email],
          subject: "Sign in to SpeakEasy",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px;">Welcome to SpeakEasy</h1>
              <p style="font-size: 16px; color: #6B7280; margin-bottom: 32px;">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display:inline-block; background:#6366F1; color:#fff; font-size:16px; font-weight:600; padding:14px 28px; border-radius:8px; text-decoration:none;">Sign in to SpeakEasy</a>
              <p style="font-size: 13px; color: #9CA3AF; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
        if (error) {
          console.error("[auth] Resend email error:", error);
          throw new Error(`Failed to send verification email: ${error.message}`);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id    = user.id;
        session.user.role  = user.role;
        session.user.level = user.level;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const topics = await prisma.topic.findMany({ select: { id: true } });
      if (topics.length > 0) {
        await prisma.userProgress.createMany({
          data: topics.map((t) => ({ userId: user.id!, topicId: t.id })),
          skipDuplicates: true,
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login/verify",
  },
};

// v4 App Router helper — use in server components and API routes
export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);
