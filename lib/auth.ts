import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM ?? "noreply@speakeasy.app",
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
