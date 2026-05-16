import { NextRequest, NextResponse } from "next/server";
import { createPublicKey, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface ApplePublicKey {
  kid: string;
  kty: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface AppleTokenClaims {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  iss: string;
  aud: string;
  exp: number;
}

async function verifyAppleIdentityToken(identityToken: string): Promise<AppleTokenClaims> {
  const parts = identityToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as { kid: string; alg: string };

  const res = await fetch("https://appleid.apple.com/auth/keys", { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch Apple public keys");
  const { keys } = (await res.json()) as { keys: ApplePublicKey[] };

  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("No matching Apple public key found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publicKey = createPublicKey({ key: jwk as any, format: "jwk" });
  const pem = publicKey.export({ type: "spki", format: "pem" }) as string;

  const payload = jwt.verify(identityToken, pem, {
    algorithms: ["RS256"],
    audience: process.env.APPLE_ID,
    issuer: "https://appleid.apple.com",
  }) as AppleTokenClaims;

  return payload;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      identityToken: string;
      user?: { name?: { firstName?: string; lastName?: string }; email?: string };
    };

    const { identityToken, user: appleUser } = body;

    if (!identityToken) {
      return NextResponse.json({ error: "Missing identity token" }, { status: 400 });
    }

    const claims = await verifyAppleIdentityToken(identityToken);

    const appleUserId = claims.sub;
    const email = claims.email ?? appleUser?.email;

    if (!email) {
      return NextResponse.json(
        { error: "No email returned from Apple. Please allow email access." },
        { status: 400 }
      );
    }

    // Find existing account or user, or create a new one
    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: "apple", providerAccountId: appleUserId } },
      include: { user: true },
    });

    let userId: string;

    if (existingAccount) {
      userId = existingAccount.userId;
    } else {
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        userId = existingUser.id;
        // Link this Apple account to the existing user
        await prisma.account.create({
          data: {
            userId,
            type: "oauth",
            provider: "apple",
            providerAccountId: appleUserId,
          },
        });
      } else {
        // Create new user
        const name = appleUser?.name
          ? [appleUser.name.firstName, appleUser.name.lastName].filter(Boolean).join(" ")
          : undefined;

        const newUser = await prisma.user.create({
          data: { email, name: name ?? null, emailVerified: new Date() },
        });
        userId = newUser.id;

        await prisma.account.create({
          data: {
            userId,
            type: "oauth",
            provider: "apple",
            providerAccountId: appleUserId,
          },
        });

        // Seed UserProgress rows for all topics
        const topics = await prisma.topic.findMany({ select: { id: true } });
        if (topics.length > 0) {
          await prisma.userProgress.createMany({
            data: topics.map((t) => ({ userId, topicId: t.id })),
            skipDuplicates: true,
          });
        }
      }
    }

    // Create a NextAuth-compatible session
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: { sessionToken, userId, expires },
    });

    return NextResponse.json({ sessionToken });
  } catch (err) {
    console.error("[apple-signin]", err);
    const message = err instanceof Error ? err.message : "Apple sign-in failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
